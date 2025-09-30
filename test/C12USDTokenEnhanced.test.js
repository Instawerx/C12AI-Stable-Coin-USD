const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("C12USDTokenEnhanced - Flash Loans", function () {
    let c12usdToken;
    let mockFlashBorrower;
    let owner, user, flashBorrower;
    let lzEndpoint;

    const INITIAL_SUPPLY = ethers.utils.parseEther("50"); // 50 tokens for testing
    const FLASH_LOAN_AMOUNT = ethers.utils.parseEther("10"); // 10 tokens
    const DEFAULT_FLASH_FEE = 5; // 0.05% (5 basis points)

    beforeEach(async function () {
        [owner, user, flashBorrower] = await ethers.getSigners();

        // Deploy mock LayerZero endpoint for testing
        const MockLZEndpoint = await ethers.getContractFactory("MockLayerZeroEndpoint");
        lzEndpoint = await MockLZEndpoint.deploy();

        // Deploy enhanced C12USD token
        const C12USDTokenEnhanced = await ethers.getContractFactory("C12USDTokenEnhanced");
        c12usdToken = await C12USDTokenEnhanced.deploy(
            lzEndpoint.address,
            owner.address, // delegate
            owner.address  // owner
        );
        await c12usdToken.deployed();

        // Deploy mock flash borrower
        const MockFlashBorrower = await ethers.getContractFactory("MockFlashBorrower");
        mockFlashBorrower = await MockFlashBorrower.deploy();
        await mockFlashBorrower.deployed();

        // Mint initial supply for testing flash loans
        await c12usdToken.mintWithReceipt(owner.address, INITIAL_SUPPLY, ethers.utils.formatBytes32String("test"));
    });

    describe("Flash Loan Configuration", function () {
        it("Should have correct initial flash loan settings", async function () {
            const config = await c12usdToken.getFlashLoanConfig();
            expect(config.feeInBasisPoints).to.equal(DEFAULT_FLASH_FEE);
            expect(config.maxAmount).to.equal(ethers.constants.MaxUint256);
            expect(config.enabled).to.be.true;
        });

        it("Should allow admin to update flash loan fee", async function () {
            const newFee = 10; // 0.10%

            await expect(c12usdToken.setFlashLoanFee(newFee))
                .to.emit(c12usdToken, "FlashLoanFeeUpdated")
                .withArgs(DEFAULT_FLASH_FEE, newFee);

            const config = await c12usdToken.getFlashLoanConfig();
            expect(config.feeInBasisPoints).to.equal(newFee);
        });

        it("Should not allow fee higher than maximum", async function () {
            const tooHighFee = 101; // 1.01% (above 1% maximum)

            await expect(c12usdToken.setFlashLoanFee(tooHighFee))
                .to.be.revertedWith("C12USD: Fee too high");
        });

        it("Should allow toggling flash loans on/off", async function () {
            await expect(c12usdToken.setFlashLoansEnabled(false))
                .to.emit(c12usdToken, "FlashLoansToggled")
                .withArgs(false);

            const config = await c12usdToken.getFlashLoanConfig();
            expect(config.enabled).to.be.false;
        });
    });

    describe("Flash Loan Mechanics", function () {
        it("Should calculate flash fee correctly", async function () {
            const amount = ethers.utils.parseEther("100");
            const expectedFee = amount.mul(DEFAULT_FLASH_FEE).div(10000); // 0.05%

            const actualFee = await c12usdToken.flashFee(c12usdToken.address, amount);
            expect(actualFee).to.equal(expectedFee);
        });

        it("Should return correct max flash loan amount", async function () {
            const maxLoan = await c12usdToken.maxFlashLoan(c12usdToken.address);
            expect(maxLoan).to.equal(ethers.constants.MaxUint256);
        });

        it("Should return 0 for unsupported tokens", async function () {
            const maxLoan = await c12usdToken.maxFlashLoan(user.address);
            expect(maxLoan).to.equal(0);
        });

        it("Should execute flash loan successfully", async function () {
            const fee = await c12usdToken.flashFee(c12usdToken.address, FLASH_LOAN_AMOUNT);

            // Give mockFlashBorrower enough tokens to pay fee
            await c12usdToken.transfer(mockFlashBorrower.address, fee);

            // Execute flash loan
            await expect(
                c12usdToken.flashLoan(
                    mockFlashBorrower.address,
                    c12usdToken.address,
                    FLASH_LOAN_AMOUNT,
                    "0x"
                )
            ).to.not.be.reverted;

            // Verify borrower received and returned tokens
            const borrowerBalance = await c12usdToken.balanceOf(mockFlashBorrower.address);
            expect(borrowerBalance).to.equal(0); // All tokens returned + fee paid
        });

        it("Should fail if borrower cannot pay fee", async function () {
            // Don't give borrower any tokens to pay the fee
            await expect(
                c12usdToken.flashLoan(
                    mockFlashBorrower.address,
                    c12usdToken.address,
                    FLASH_LOAN_AMOUNT,
                    "0x"
                )
            ).to.be.reverted;
        });
    });

    describe("Flash Loan Security", function () {
        it("Should reject flash loans when circuit breaker is active", async function () {
            await c12usdToken.tripCircuitBreaker("Emergency test");

            const maxLoan = await c12usdToken.maxFlashLoan(c12usdToken.address);
            expect(maxLoan).to.equal(0);

            // Circuit breaker also pauses the contract, so it will fail on "Pausable: paused"
            await expect(
                c12usdToken.flashLoan(
                    mockFlashBorrower.address,
                    c12usdToken.address,
                    FLASH_LOAN_AMOUNT,
                    "0x"
                )
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should reject flash loans when disabled", async function () {
            await c12usdToken.setFlashLoansEnabled(false);

            await expect(
                c12usdToken.flashLoan(
                    mockFlashBorrower.address,
                    c12usdToken.address,
                    FLASH_LOAN_AMOUNT,
                    "0x"
                )
            ).to.be.revertedWith("C12USD: Flash loans are disabled");
        });

        it("Should reject flash loans when paused", async function () {
            await c12usdToken.pause();

            await expect(
                c12usdToken.flashLoan(
                    mockFlashBorrower.address,
                    c12usdToken.address,
                    FLASH_LOAN_AMOUNT,
                    "0x"
                )
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should reject flash loans for unsupported tokens", async function () {
            await expect(
                c12usdToken.flashFee(user.address, FLASH_LOAN_AMOUNT)
            ).to.be.revertedWith("C12USD: Flash loan token not supported");
        });
    });

    describe("Flash Loan Administration", function () {
        it("Should only allow admin to change flash loan fee", async function () {
            await expect(
                c12usdToken.connect(user).setFlashLoanFee(10)
            ).to.be.reverted; // Access control revert
        });

        it("Should only allow admin to toggle flash loans", async function () {
            await expect(
                c12usdToken.connect(user).setFlashLoansEnabled(false)
            ).to.be.reverted; // Access control revert
        });

        it("Should only allow admin to set max flash loan amount", async function () {
            const newMax = ethers.utils.parseEther("1000");

            await expect(
                c12usdToken.connect(user).setMaxFlashLoanAmount(newMax)
            ).to.be.reverted; // Access control revert

            // Admin should be able to set it
            await c12usdToken.setMaxFlashLoanAmount(newMax);
            const maxLoan = await c12usdToken.maxFlashLoan(c12usdToken.address);
            expect(maxLoan).to.equal(newMax);
        });
    });

    describe("ERC20Permit Integration", function () {
        it("Should support permit functionality", async function () {
            const nonce = await c12usdToken.nonces(owner.address);
            const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

            const domain = {
                name: await c12usdToken.name(),
                version: "1",
                chainId: await owner.getChainId(),
                verifyingContract: c12usdToken.address
            };

            const types = {
                Permit: [
                    { name: "owner", type: "address" },
                    { name: "spender", type: "address" },
                    { name: "value", type: "uint256" },
                    { name: "nonce", type: "uint256" },
                    { name: "deadline", type: "uint256" }
                ]
            };

            const values = {
                owner: owner.address,
                spender: user.address,
                value: FLASH_LOAN_AMOUNT,
                nonce: nonce,
                deadline: deadline
            };

            const signature = await owner._signTypedData(domain, types, values);
            const { v, r, s } = ethers.utils.splitSignature(signature);

            await expect(
                c12usdToken.permit(
                    owner.address,
                    user.address,
                    FLASH_LOAN_AMOUNT,
                    deadline,
                    v,
                    r,
                    s
                )
            ).to.not.be.reverted;

            const allowance = await c12usdToken.allowance(owner.address, user.address);
            expect(allowance).to.equal(FLASH_LOAN_AMOUNT);
        });
    });
});