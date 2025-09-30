const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("MintRedeemGateway", function () {

  async function deployGatewayFixture() {
    const [owner, signer, user1, user2] = await ethers.getSigners();

    // Deploy mock LayerZero endpoint
    const MockEndpoint = await ethers.getContractFactory("MockLayerZeroEndpoint");
    const mockEndpoint = await MockEndpoint.deploy();

    // Deploy C12USD token
    const C12USD = await ethers.getContractFactory("C12USDTokenEnhanced");
    const token = await C12USD.deploy(
      mockEndpoint.address,
      owner.address, // delegate
      owner.address  // initial owner
    );

    // Deploy gateway
    const Gateway = await ethers.getContractFactory("MintRedeemGateway");
    const gateway = await Gateway.deploy(token.address, owner.address);

    // Get role constants
    const MINTER_ROLE = await token.MINTER_ROLE();
    const BURNER_ROLE = await token.BURNER_ROLE();
    const SIGNER_ROLE = await gateway.SIGNER_ROLE();
    const PAUSER_ROLE = await gateway.PAUSER_ROLE();

    // Grant gateway permission to mint and burn tokens
    await token.grantRole(MINTER_ROLE, gateway.address);
    await token.grantRole(BURNER_ROLE, gateway.address);

    // Grant signer role
    await gateway.grantRole(SIGNER_ROLE, signer.address);

    return {
      token,
      gateway,
      mockEndpoint,
      owner,
      signer,
      user1,
      user2,
      MINTER_ROLE,
      BURNER_ROLE,
      SIGNER_ROLE,
      PAUSER_ROLE
    };
  }

  // Helper function to create signed mint receipt
  async function createMintSignature(signer, recipient, amount, nonce, expiryTime, receiptHash) {
    const messageHash = ethers.utils.solidityKeccak256(
      ["string", "address", "uint256", "bytes32", "uint256", "bytes32"],
      ["MINT", recipient, amount, nonce, expiryTime, receiptHash]
    );

    const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));
    return signature;
  }

  // Helper function to create signed redeem receipt
  async function createRedeemSignature(signer, from, amount, nonce, expiryTime, receiptHash) {
    const messageHash = ethers.utils.solidityKeccak256(
      ["string", "address", "uint256", "bytes32", "uint256", "bytes32"],
      ["REDEEM", from, amount, nonce, expiryTime, receiptHash]
    );

    const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));
    return signature;
  }

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      const { gateway, token } = await loadFixture(deployGatewayFixture);

      expect(await gateway.c12usdToken()).to.equal(token.address);
    });

    it("Should grant initial roles to owner", async function () {
      const { gateway, owner, SIGNER_ROLE, PAUSER_ROLE } = await loadFixture(deployGatewayFixture);

      const DEFAULT_ADMIN_ROLE = await gateway.DEFAULT_ADMIN_ROLE();
      expect(await gateway.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await gateway.hasRole(SIGNER_ROLE, owner.address)).to.be.true;
      expect(await gateway.hasRole(PAUSER_ROLE, owner.address)).to.be.true;
    });

    it("Should start unpaused", async function () {
      const { gateway } = await loadFixture(deployGatewayFixture);

      expect(await gateway.paused()).to.be.false;
    });

    it("Should return correct version", async function () {
      const { gateway } = await loadFixture(deployGatewayFixture);

      expect(await gateway.version()).to.equal("1.0.0");
    });
  });

  describe("Mint Operations", function () {
    it("Should execute mint with valid signature", async function () {
      const { gateway, token, signer, user1 } = await loadFixture(deployGatewayFixture);

      const amount = ethers.utils.parseEther("10");
      const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const expiryTime = (await time.latest()) + 3600; // 1 hour from now
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("mint-receipt-123"));

      const signature = await createMintSignature(signer, user1.address, amount, nonce, expiryTime, receiptHash);

      await expect(
        gateway.executeMint(user1.address, amount, nonce, expiryTime, receiptHash, signature)
      )
        .to.emit(gateway, "MintExecuted")
        .withArgs(user1.address, amount, receiptHash, nonce)
        .and.to.emit(gateway, "NonceUsed")
        .withArgs(nonce);

      expect(await token.balanceOf(user1.address)).to.equal(amount);
      expect(await gateway.usedNonces(nonce)).to.be.true;
      expect(await gateway.isNonceUsed(nonce)).to.be.true;
    });

    it("Should reject mint with invalid signature", async function () {
      const { gateway, user1, user2 } = await loadFixture(deployGatewayFixture);

      const amount = ethers.utils.parseEther("10");
      const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const expiryTime = (await time.latest()) + 3600;
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("mint-receipt-123"));

      // Sign with wrong signer (user2 instead of authorized signer)
      const signature = await createMintSignature(user2, user1.address, amount, nonce, expiryTime, receiptHash);

      await expect(
        gateway.executeMint(user1.address, amount, nonce, expiryTime, receiptHash, signature)
      ).to.be.revertedWith("Gateway: Invalid signature");
    });

    it("Should reject mint with expired receipt", async function () {
      const { gateway, signer, user1 } = await loadFixture(deployGatewayFixture);

      const amount = ethers.utils.parseEther("10");
      const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const expiryTime = (await time.latest()) - 1; // Already expired
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("mint-receipt-123"));

      const signature = await createMintSignature(signer, user1.address, amount, nonce, expiryTime, receiptHash);

      await expect(
        gateway.executeMint(user1.address, amount, nonce, expiryTime, receiptHash, signature)
      ).to.be.revertedWith("Gateway: Receipt expired");
    });

    it("Should reject mint with reused nonce", async function () {
      const { gateway, signer, user1 } = await loadFixture(deployGatewayFixture);

      const amount = ethers.utils.parseEther("10");
      const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const expiryTime = (await time.latest()) + 3600;
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("mint-receipt-123"));

      const signature = await createMintSignature(signer, user1.address, amount, nonce, expiryTime, receiptHash);

      // First mint should succeed
      await gateway.executeMint(user1.address, amount, nonce, expiryTime, receiptHash, signature);

      // Second mint with same nonce should fail
      await expect(
        gateway.executeMint(user1.address, amount, nonce, expiryTime, receiptHash, signature)
      ).to.be.revertedWith("Gateway: Nonce already used");
    });

    it("Should reject mint to zero address", async function () {
      const { gateway, signer } = await loadFixture(deployGatewayFixture);

      const amount = ethers.utils.parseEther("10");
      const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const expiryTime = (await time.latest()) + 3600;
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("mint-receipt-123"));

      const signature = await createMintSignature(signer, ethers.constants.AddressZero, amount, nonce, expiryTime, receiptHash);

      await expect(
        gateway.executeMint(ethers.constants.AddressZero, amount, nonce, expiryTime, receiptHash, signature)
      ).to.be.revertedWith("Gateway: Invalid recipient");
    });

    it("Should reject mint with zero amount", async function () {
      const { gateway, signer, user1 } = await loadFixture(deployGatewayFixture);

      const amount = 0;
      const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const expiryTime = (await time.latest()) + 3600;
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("mint-receipt-123"));

      const signature = await createMintSignature(signer, user1.address, amount, nonce, expiryTime, receiptHash);

      await expect(
        gateway.executeMint(user1.address, amount, nonce, expiryTime, receiptHash, signature)
      ).to.be.revertedWith("Gateway: Amount must be greater than zero");
    });
  });

  // Helper function for minting tokens
  async function mintTokensToUser(gateway, token, signer, user, amount) {
    const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
    const expiryTime = (await time.latest()) + 3600;
    const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("mint-receipt"));
    const signature = await createMintSignature(signer, user.address, amount, nonce, expiryTime, receiptHash);

    await gateway.executeMint(user.address, amount, nonce, expiryTime, receiptHash, signature);
  }

  describe("Redeem Operations", function () {

    it("Should execute redeem with valid signature", async function () {
      const { gateway, token, signer, user1 } = await loadFixture(deployGatewayFixture);

      const amount = ethers.utils.parseEther("10");

      // First mint tokens to user
      await mintTokensToUser(gateway, token, signer, user1, amount);

      const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const expiryTime = (await time.latest()) + 3600;
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("redeem-receipt-123"));

      const signature = await createRedeemSignature(signer, user1.address, amount, nonce, expiryTime, receiptHash);

      await expect(
        gateway.executeRedeem(user1.address, amount, nonce, expiryTime, receiptHash, signature)
      )
        .to.emit(gateway, "RedeemExecuted")
        .withArgs(user1.address, amount, receiptHash, nonce)
        .and.to.emit(gateway, "NonceUsed")
        .withArgs(nonce);

      expect(await token.balanceOf(user1.address)).to.equal(0);
      expect(await gateway.usedNonces(nonce)).to.be.true;
    });

    it("Should reject redeem with invalid signature", async function () {
      const { gateway, token, signer, user1, user2 } = await loadFixture(deployGatewayFixture);

      const amount = ethers.utils.parseEther("10");

      // First mint tokens to user
      await mintTokensToUser(gateway, token, signer, user1, amount);

      const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const expiryTime = (await time.latest()) + 3600;
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("redeem-receipt-123"));

      // Sign with wrong signer (user2 instead of authorized signer)
      const signature = await createRedeemSignature(user2, user1.address, amount, nonce, expiryTime, receiptHash);

      await expect(
        gateway.executeRedeem(user1.address, amount, nonce, expiryTime, receiptHash, signature)
      ).to.be.revertedWith("Gateway: Invalid signature");
    });

    it("Should reject redeem with insufficient token balance", async function () {
      const { gateway, signer, user1 } = await loadFixture(deployGatewayFixture);

      const amount = ethers.utils.parseEther("10");
      const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const expiryTime = (await time.latest()) + 3600;
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("redeem-receipt-123"));

      const signature = await createRedeemSignature(signer, user1.address, amount, nonce, expiryTime, receiptHash);

      // User has no tokens, so burn should fail
      await expect(
        gateway.executeRedeem(user1.address, amount, nonce, expiryTime, receiptHash, signature)
      ).to.be.revertedWith("C12USD: Insufficient balance to burn");
    });
  });

  describe("Pausing", function () {
    it("Should allow pauser to pause the gateway", async function () {
      const { gateway, owner } = await loadFixture(deployGatewayFixture);

      await gateway.connect(owner).pause();
      expect(await gateway.paused()).to.be.true;
    });

    it("Should prevent operations when paused", async function () {
      const { gateway, signer, user1, owner } = await loadFixture(deployGatewayFixture);

      // Pause the gateway
      await gateway.connect(owner).pause();

      const amount = ethers.utils.parseEther("10");
      const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const expiryTime = (await time.latest()) + 3600;
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("mint-receipt-123"));

      const signature = await createMintSignature(signer, user1.address, amount, nonce, expiryTime, receiptHash);

      await expect(
        gateway.executeMint(user1.address, amount, nonce, expiryTime, receiptHash, signature)
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Access Control", function () {
    it("Should not allow non-signer to create valid signatures", async function () {
      const { gateway, user1, user2 } = await loadFixture(deployGatewayFixture);

      const amount = ethers.utils.parseEther("10");
      const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const expiryTime = (await time.latest()) + 3600;
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("mint-receipt-123"));

      // Create signature with non-authorized user
      const signature = await createMintSignature(user2, user1.address, amount, nonce, expiryTime, receiptHash);

      await expect(
        gateway.executeMint(user1.address, amount, nonce, expiryTime, receiptHash, signature)
      ).to.be.revertedWith("Gateway: Invalid signature");
    });

    it("Should allow admin to revoke signer role", async function () {
      const { gateway, owner, signer, user1, SIGNER_ROLE } = await loadFixture(deployGatewayFixture);

      // Revoke signer role
      await gateway.connect(owner).revokeRole(SIGNER_ROLE, signer.address);

      const amount = ethers.utils.parseEther("10");
      const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const expiryTime = (await time.latest()) + 3600;
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("mint-receipt-123"));

      const signature = await createMintSignature(signer, user1.address, amount, nonce, expiryTime, receiptHash);

      await expect(
        gateway.executeMint(user1.address, amount, nonce, expiryTime, receiptHash, signature)
      ).to.be.revertedWith("Gateway: Invalid signature");
    });
  });

  describe("Integration", function () {
    it("Should handle multiple mint and redeem operations", async function () {
      const { gateway, token, signer, user1, user2 } = await loadFixture(deployGatewayFixture);

      const amount1 = ethers.utils.parseEther("25");
      const amount2 = ethers.utils.parseEther("15");
      const redeemAmount = ethers.utils.parseEther("10");

      // Mint to both users
      await mintTokensToUser(gateway, token, signer, user1, amount1);
      await mintTokensToUser(gateway, token, signer, user2, amount2);

      expect(await token.totalSupply()).to.equal(amount1.add(amount2));

      // Redeem from user1
      const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const expiryTime = (await time.latest()) + 3600;
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("redeem-receipt"));
      const signature = await createRedeemSignature(signer, user1.address, redeemAmount, nonce, expiryTime, receiptHash);

      await gateway.executeRedeem(user1.address, redeemAmount, nonce, expiryTime, receiptHash, signature);

      expect(await token.balanceOf(user1.address)).to.equal(amount1.sub(redeemAmount));
      expect(await token.balanceOf(user2.address)).to.equal(amount2);
      expect(await token.totalSupply()).to.equal(amount1.add(amount2).sub(redeemAmount));
    });

    it("Should maintain nonce uniqueness across operations", async function () {
      const { gateway, signer, user1 } = await loadFixture(deployGatewayFixture);

      const amount = ethers.utils.parseEther("10");
      const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const expiryTime = (await time.latest()) + 3600;

      // Use same nonce for both mint and redeem receipts
      const mintReceiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("mint-receipt"));
      const redeemReceiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("redeem-receipt"));

      const mintSignature = await createMintSignature(signer, user1.address, amount, nonce, expiryTime, mintReceiptHash);

      // First mint should succeed
      await gateway.executeMint(user1.address, amount, nonce, expiryTime, mintReceiptHash, mintSignature);

      // Second operation with same nonce should fail, even if it's a redeem
      const redeemSignature = await createRedeemSignature(signer, user1.address, amount, nonce, expiryTime, redeemReceiptHash);

      await expect(
        gateway.executeRedeem(user1.address, amount, nonce, expiryTime, redeemReceiptHash, redeemSignature)
      ).to.be.revertedWith("Gateway: Nonce already used");
    });
  });
});