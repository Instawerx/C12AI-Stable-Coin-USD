const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("C12USDTokenEnhanced", function () {

  async function deployC12USDFixture() {
    const [owner, user1, user2, minter, burner, pauser, circuitBreaker] = await ethers.getSigners();

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

    // Get role constants
    const MINTER_ROLE = await token.MINTER_ROLE();
    const BURNER_ROLE = await token.BURNER_ROLE();
    const PAUSER_ROLE = await token.PAUSER_ROLE();
    const CIRCUIT_BREAKER_ROLE = await token.CIRCUIT_BREAKER_ROLE();

    // Grant roles to test accounts
    await token.grantRole(MINTER_ROLE, minter.address);
    await token.grantRole(BURNER_ROLE, burner.address);
    await token.grantRole(PAUSER_ROLE, pauser.address);
    await token.grantRole(CIRCUIT_BREAKER_ROLE, circuitBreaker.address);

    return {
      token,
      mockEndpoint,
      owner,
      user1,
      user2,
      minter,
      burner,
      pauser,
      circuitBreaker,
      MINTER_ROLE,
      BURNER_ROLE,
      PAUSER_ROLE,
      CIRCUIT_BREAKER_ROLE
    };
  }

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      const { token } = await loadFixture(deployC12USDFixture);

      expect(await token.name()).to.equal("C12USD");
      expect(await token.symbol()).to.equal("C12USD");
    });

    it("Should set the correct decimals", async function () {
      const { token } = await loadFixture(deployC12USDFixture);

      expect(await token.decimals()).to.equal(18);
    });

    it("Should set the pilot max supply", async function () {
      const { token } = await loadFixture(deployC12USDFixture);

      const maxSupply = await token.PILOT_MAX_SUPPLY();
      expect(maxSupply).to.equal(ethers.utils.parseEther("100"));
    });

    it("Should grant initial roles to owner", async function () {
      const { token, owner, MINTER_ROLE, BURNER_ROLE, PAUSER_ROLE, CIRCUIT_BREAKER_ROLE } = await loadFixture(deployC12USDFixture);

      expect(await token.hasRole(MINTER_ROLE, owner.address)).to.be.true;
      expect(await token.hasRole(BURNER_ROLE, owner.address)).to.be.true;
      expect(await token.hasRole(PAUSER_ROLE, owner.address)).to.be.true;
      expect(await token.hasRole(CIRCUIT_BREAKER_ROLE, owner.address)).to.be.true;
    });

    it("Should start unpaused with circuit breaker off", async function () {
      const { token } = await loadFixture(deployC12USDFixture);

      expect(await token.paused()).to.be.false;
      expect(await token.circuitBreakerTripped()).to.be.false;
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      const { token, minter, user1 } = await loadFixture(deployC12USDFixture);

      const amount = ethers.utils.parseEther("10");
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-receipt"));

      await expect(
        token.connect(minter).mintWithReceipt(user1.address, amount, receiptHash)
      )
        .to.emit(token, "PilotMint")
        .withArgs(user1.address, amount, receiptHash);

      expect(await token.balanceOf(user1.address)).to.equal(amount);
      expect(await token.totalSupply()).to.equal(amount);
    });

    it("Should not allow non-minter to mint tokens", async function () {
      const { token, user1, user2 } = await loadFixture(deployC12USDFixture);

      const amount = ethers.utils.parseEther("10");
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-receipt"));

      await expect(
        token.connect(user1).mintWithReceipt(user2.address, amount, receiptHash)
      ).to.be.reverted;
    });

    it("Should not allow minting beyond pilot max supply", async function () {
      const { token, minter, user1 } = await loadFixture(deployC12USDFixture);

      const maxSupply = await token.PILOT_MAX_SUPPLY();
      const amount = maxSupply.add(1);
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-receipt"));

      await expect(
        token.connect(minter).mintWithReceipt(user1.address, amount, receiptHash)
      ).to.be.revertedWith("C12USD: Exceeds pilot max supply");
    });

    it("Should not allow minting to zero address", async function () {
      const { token, minter } = await loadFixture(deployC12USDFixture);

      const amount = ethers.utils.parseEther("10");
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-receipt"));

      await expect(
        token.connect(minter).mintWithReceipt(ethers.constants.AddressZero, amount, receiptHash)
      ).to.be.revertedWith("C12USD: Cannot mint to zero address");
    });

    it("Should not allow minting zero amount", async function () {
      const { token, minter, user1 } = await loadFixture(deployC12USDFixture);

      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-receipt"));

      await expect(
        token.connect(minter).mintWithReceipt(user1.address, 0, receiptHash)
      ).to.be.revertedWith("C12USD: Amount must be greater than zero");
    });

    it("Should track remaining pilot supply correctly", async function () {
      const { token, minter, user1 } = await loadFixture(deployC12USDFixture);

      const maxSupply = await token.PILOT_MAX_SUPPLY();
      const mintAmount = ethers.utils.parseEther("30");
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-receipt"));

      // Check initial remaining supply
      expect(await token.remainingPilotSupply()).to.equal(maxSupply);

      // Mint some tokens
      await token.connect(minter).mintWithReceipt(user1.address, mintAmount, receiptHash);

      // Check updated remaining supply
      expect(await token.remainingPilotSupply()).to.equal(maxSupply.sub(mintAmount));
    });
  });

  describe("Burning", function () {
    it("Should allow burner to burn tokens", async function () {
      const { token, minter, burner, user1 } = await loadFixture(deployC12USDFixture);

      const amount = ethers.utils.parseEther("10");
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-receipt"));

      // First mint tokens
      await token.connect(minter).mintWithReceipt(user1.address, amount, receiptHash);

      // Then burn them
      await expect(
        token.connect(burner).burnWithReceipt(user1.address, amount, receiptHash)
      )
        .to.emit(token, "PilotBurn")
        .withArgs(user1.address, amount, receiptHash);

      expect(await token.balanceOf(user1.address)).to.equal(0);
      expect(await token.totalSupply()).to.equal(0);
    });

    it("Should not allow non-burner to burn tokens", async function () {
      const { token, minter, user1, user2 } = await loadFixture(deployC12USDFixture);

      const amount = ethers.utils.parseEther("10");
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-receipt"));

      // First mint tokens
      await token.connect(minter).mintWithReceipt(user1.address, amount, receiptHash);

      // Try to burn without permission
      await expect(
        token.connect(user2).burnWithReceipt(user1.address, amount, receiptHash)
      ).to.be.reverted;
    });

    it("Should not allow burning more than balance", async function () {
      const { token, minter, burner, user1 } = await loadFixture(deployC12USDFixture);

      const mintAmount = ethers.utils.parseEther("10");
      const burnAmount = ethers.utils.parseEther("15");
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-receipt"));

      // First mint tokens
      await token.connect(minter).mintWithReceipt(user1.address, mintAmount, receiptHash);

      // Try to burn more than balance
      await expect(
        token.connect(burner).burnWithReceipt(user1.address, burnAmount, receiptHash)
      ).to.be.revertedWith("C12USD: Insufficient balance to burn");
    });
  });

  describe("Circuit Breaker", function () {
    it("Should allow circuit breaker role to trip the breaker", async function () {
      const { token, circuitBreaker } = await loadFixture(deployC12USDFixture);

      const reason = "Emergency stop";

      await expect(
        token.connect(circuitBreaker).tripCircuitBreaker(reason)
      )
        .to.emit(token, "CircuitBreakerTripped")
        .withArgs(circuitBreaker.address, reason);

      expect(await token.circuitBreakerTripped()).to.be.true;
      expect(await token.paused()).to.be.true;
    });

    it("Should allow circuit breaker role to reset the breaker", async function () {
      const { token, circuitBreaker } = await loadFixture(deployC12USDFixture);

      // First trip the breaker
      await token.connect(circuitBreaker).tripCircuitBreaker("Emergency stop");

      // Then reset it
      await expect(
        token.connect(circuitBreaker).resetCircuitBreaker()
      )
        .to.emit(token, "CircuitBreakerReset")
        .withArgs(circuitBreaker.address);

      expect(await token.circuitBreakerTripped()).to.be.false;
      expect(await token.paused()).to.be.false;
    });

    it("Should prevent operations when circuit breaker is tripped", async function () {
      const { token, minter, user1, circuitBreaker } = await loadFixture(deployC12USDFixture);

      // Trip the circuit breaker
      await token.connect(circuitBreaker).tripCircuitBreaker("Emergency stop");

      // Try to mint - should fail
      const amount = ethers.utils.parseEther("10");
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-receipt"));

      await expect(
        token.connect(minter).mintWithReceipt(user1.address, amount, receiptHash)
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should prevent transfers when circuit breaker is tripped", async function () {
      const { token, minter, user1, user2, circuitBreaker } = await loadFixture(deployC12USDFixture);

      // First mint tokens
      const amount = ethers.utils.parseEther("10");
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-receipt"));
      await token.connect(minter).mintWithReceipt(user1.address, amount, receiptHash);

      // Trip the circuit breaker
      await token.connect(circuitBreaker).tripCircuitBreaker("Emergency stop");

      // Try to transfer - should fail
      await expect(
        token.connect(user1).transfer(user2.address, amount)
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Pausing", function () {
    it("Should allow pauser to pause the contract", async function () {
      const { token, pauser } = await loadFixture(deployC12USDFixture);

      await token.connect(pauser).pause();
      expect(await token.paused()).to.be.true;
    });

    it("Should allow pauser to unpause the contract", async function () {
      const { token, pauser } = await loadFixture(deployC12USDFixture);

      await token.connect(pauser).pause();
      await token.connect(pauser).unpause();
      expect(await token.paused()).to.be.false;
    });

    it("Should prevent operations when paused", async function () {
      const { token, minter, user1, pauser } = await loadFixture(deployC12USDFixture);

      // Pause the contract
      await token.connect(pauser).pause();

      // Try to mint - should fail
      const amount = ethers.utils.parseEther("10");
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-receipt"));

      await expect(
        token.connect(minter).mintWithReceipt(user1.address, amount, receiptHash)
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Access Control", function () {
    it("Should not allow non-admin to grant roles", async function () {
      const { token, user1, user2, MINTER_ROLE } = await loadFixture(deployC12USDFixture);

      await expect(
        token.connect(user1).grantRole(MINTER_ROLE, user2.address)
      ).to.be.reverted;
    });

    it("Should allow admin to revoke roles", async function () {
      const { token, owner, minter, MINTER_ROLE } = await loadFixture(deployC12USDFixture);

      // Revoke minter role
      await token.connect(owner).revokeRole(MINTER_ROLE, minter.address);

      expect(await token.hasRole(MINTER_ROLE, minter.address)).to.be.false;

      // Try to mint - should fail
      const amount = ethers.utils.parseEther("10");
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-receipt"));

      await expect(
        token.connect(minter).mintWithReceipt(owner.address, amount, receiptHash)
      ).to.be.reverted;
    });
  });

  describe("Integration", function () {
    it("Should maintain accurate total supply across mint and burn operations", async function () {
      const { token, minter, burner, user1, user2 } = await loadFixture(deployC12USDFixture);

      const amount1 = ethers.utils.parseEther("25");
      const amount2 = ethers.utils.parseEther("15");
      const burnAmount = ethers.utils.parseEther("10");
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-receipt"));

      // Mint to two users
      await token.connect(minter).mintWithReceipt(user1.address, amount1, receiptHash);
      await token.connect(minter).mintWithReceipt(user2.address, amount2, receiptHash);

      expect(await token.totalSupply()).to.equal(amount1.add(amount2));

      // Burn some tokens
      await token.connect(burner).burnWithReceipt(user1.address, burnAmount, receiptHash);

      expect(await token.totalSupply()).to.equal(amount1.add(amount2).sub(burnAmount));
      expect(await token.balanceOf(user1.address)).to.equal(amount1.sub(burnAmount));
    });

    it("Should handle edge case: minting up to exact pilot limit", async function () {
      const { token, minter, user1 } = await loadFixture(deployC12USDFixture);

      const maxSupply = await token.PILOT_MAX_SUPPLY();
      const receiptHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-receipt"));

      // Mint exactly the max supply
      await token.connect(minter).mintWithReceipt(user1.address, maxSupply, receiptHash);

      expect(await token.totalSupply()).to.equal(maxSupply);
      expect(await token.remainingPilotSupply()).to.equal(0);

      // Try to mint even 1 more - should fail
      await expect(
        token.connect(minter).mintWithReceipt(user1.address, 1, receiptHash)
      ).to.be.revertedWith("C12USD: Exceeds pilot max supply");
    });
  });
});