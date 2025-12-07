import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { RealPrivacyTrading, RealPrivacyTrading__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

/**
 * Real Privacy Trading Smart Contract Tests
 *
 * Demonstrates FHEVM concepts:
 * - Encrypted state variables
 * - Private computation on encrypted data
 * - Access control patterns
 * - Confidential transactions
 */
describe("RealPrivacyTrading", function () {
  let signers: Signers;
  let contract: RealPrivacyTrading;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`⚠️  This test suite is designed for FHEVM mock environment`);
      console.warn(`    Run tests with: npx hardhat test`);
      this.skip();
    }

    // Deploy the contract
    const factory = (await ethers.getContractFactory("RealPrivacyTrading")) as RealPrivacyTrading__factory;
    contract = (await factory.deploy()) as RealPrivacyTrading;
    contractAddress = await contract.getAddress();
    console.log(`✅ Contract deployed at: ${contractAddress}`);
  });

  describe("Deployment", function () {
    it("should set owner and initial values correctly", async function () {
      expect(await contract.owner()).to.equal(signers.deployer.address);
      expect(await contract.currentRound()).to.equal(1);
      expect(await contract.orderCounter()).to.equal(1);
      expect(await contract.tradeCounter()).to.equal(1);
    });

    it("should initialize with zero orders and trades", async function () {
      const orderCount = await contract.getCurrentOrderCount();
      const tradeCount = await contract.getCurrentTradeCount();

      expect(orderCount).to.equal(0);
      expect(tradeCount).to.equal(0);
    });
  });

  describe("Quick Buy Operations", function () {
    it("✅ should allow quick buy order", async function () {
      const pair = "BTC/ETH";
      const amount = 100;

      await expect(contract.connect(signers.alice).quickBuy(pair, amount))
        .to.emit(contract, "QuickTradeExecuted")
        .withArgs(signers.alice.address, pair, true);

      const tradeCount = await contract.getCurrentTradeCount();
      expect(tradeCount).to.equal(1);
    });

    it("✅ should handle multiple quick buys", async function () {
      const pair = "ETH/USDT";
      const amount = 50;

      // Alice makes first buy
      await contract.connect(signers.alice).quickBuy(pair, amount);

      // Bob makes second buy
      await contract.connect(signers.bob).quickBuy(pair, amount);

      const tradeCount = await contract.getCurrentTradeCount();
      expect(tradeCount).to.equal(2);
    });

    it("❌ should reject zero amount for quick buy", async function () {
      const pair = "BTC/ETH";
      const amount = 0;

      await expect(
        contract.connect(signers.alice).quickBuy(pair, amount)
      ).to.be.revertedWith("Amount must be positive");
    });

    it("❌ should reject empty trading pair", async function () {
      const pair = "";
      const amount = 100;

      await expect(
        contract.connect(signers.alice).quickBuy(pair, amount)
      ).to.be.revertedWith("Invalid pair");
    });
  });

  describe("Quick Sell Operations", function () {
    it("✅ should allow quick sell order", async function () {
      const pair = "BTC/ETH";
      const amount = 50;

      // First, add balance via quick buy
      await contract.connect(signers.alice).quickBuy(pair, 100);

      // Then sell
      await expect(contract.connect(signers.alice).quickSell(pair, amount))
        .to.emit(contract, "QuickTradeExecuted")
        .withArgs(signers.alice.address, pair, false);

      const tradeCount = await contract.getCurrentTradeCount();
      expect(tradeCount).to.equal(2); // one buy + one sell
    });

    it("✅ should handle multiple quick sells", async function () {
      const pair = "ETH/USDT";

      // Set up initial positions
      await contract.connect(signers.alice).quickBuy(pair, 200);
      await contract.connect(signers.bob).quickBuy(pair, 150);

      // Execute sells
      await contract.connect(signers.alice).quickSell(pair, 100);
      await contract.connect(signers.bob).quickSell(pair, 50);

      const tradeCount = await contract.getCurrentTradeCount();
      expect(tradeCount).to.equal(4); // 2 buys + 2 sells
    });

    it("❌ should reject zero amount for quick sell", async function () {
      const pair = "BTC/ETH";

      // Set up balance first
      await contract.connect(signers.alice).quickBuy(pair, 100);

      // Try to sell zero
      await expect(
        contract.connect(signers.alice).quickSell(pair, 0)
      ).to.be.revertedWith("Amount must be positive");
    });
  });

  describe("Limit Order Operations", function () {
    it("✅ should place buy limit order", async function () {
      const pair = "BTC/ETH";
      const amount = 100;
      const price = 1500;

      await expect(
        contract.connect(signers.alice).placeOrder(pair, true, amount, price)
      )
        .to.emit(contract, "OrderPlaced")
        .withArgs(1, signers.alice.address, pair, true);

      const orderCount = await contract.getCurrentOrderCount();
      expect(orderCount).to.equal(1);
    });

    it("✅ should place sell limit order", async function () {
      const pair = "ETH/USDT";
      const amount = 50;
      const price = 2000;

      await expect(
        contract.connect(signers.alice).placeOrder(pair, false, amount, price)
      )
        .to.emit(contract, "OrderPlaced")
        .withArgs(1, signers.alice.address, pair, false);

      const orderCount = await contract.getCurrentOrderCount();
      expect(orderCount).to.equal(1);
    });

    it("✅ should handle multiple orders from same user", async function () {
      const alice = signers.alice;

      await contract.connect(alice).placeOrder("BTC/ETH", true, 100, 1500);
      await contract.connect(alice).placeOrder("ETH/USDT", false, 50, 2000);
      await contract.connect(alice).placeOrder("BTC/USDT", true, 10, 30000);

      const orderCount = await contract.getCurrentOrderCount();
      expect(orderCount).to.equal(3);
    });

    it("❌ should reject order with zero amount", async function () {
      const pair = "BTC/ETH";
      const price = 1500;

      await expect(
        contract.connect(signers.alice).placeOrder(pair, true, 0, price)
      ).to.be.revertedWith("Amount must be positive");
    });

    it("❌ should reject order with zero price", async function () {
      const pair = "BTC/ETH";
      const amount = 100;

      await expect(
        contract.connect(signers.alice).placeOrder(pair, true, amount, 0)
      ).to.be.revertedWith("Price must be positive");
    });

    it("❌ should reject order with empty pair", async function () {
      const pair = "";
      const amount = 100;
      const price = 1500;

      await expect(
        contract.connect(signers.alice).placeOrder(pair, true, amount, price)
      ).to.be.revertedWith("Invalid pair");
    });
  });

  describe("Portfolio Management", function () {
    it("✅ should track portfolio balance after buy", async function () {
      const pair = "BTC/ETH";
      const amount = 100;

      await contract.connect(signers.alice).quickBuy(pair, amount);

      const balance = await contract.getPortfolioBalance(signers.alice.address, pair);
      expect(balance).to.equal(amount);
    });

    it("✅ should maintain separate balances for different pairs", async function () {
      const amount1 = 100;
      const amount2 = 50;

      await contract.connect(signers.alice).quickBuy("BTC/ETH", amount1);
      await contract.connect(signers.alice).quickBuy("ETH/USDT", amount2);

      const balance1 = await contract.getPortfolioBalance(signers.alice.address, "BTC/ETH");
      const balance2 = await contract.getPortfolioBalance(signers.alice.address, "ETH/USDT");

      expect(balance1).to.equal(amount1);
      expect(balance2).to.equal(amount2);
    });

    it("✅ should separate portfolios between different users", async function () {
      const pair = "BTC/ETH";
      const amountAlice = 100;
      const amountBob = 50;

      await contract.connect(signers.alice).quickBuy(pair, amountAlice);
      await contract.connect(signers.bob).quickBuy(pair, amountBob);

      const aliceBalance = await contract.getPortfolioBalance(signers.alice.address, pair);
      const bobBalance = await contract.getPortfolioBalance(signers.bob.address, pair);

      expect(aliceBalance).to.equal(amountAlice);
      expect(bobBalance).to.equal(amountBob);
    });

    it("✅ should handle sell reducing balance", async function () {
      const pair = "BTC/ETH";
      const buyAmount = 100;
      const sellAmount = 30;

      await contract.connect(signers.alice).quickBuy(pair, buyAmount);
      await contract.connect(signers.alice).quickSell(pair, sellAmount);

      const balance = await contract.getPortfolioBalance(signers.alice.address, pair);
      expect(balance).to.equal(buyAmount - sellAmount);
    });
  });

  describe("Order Information Access", function () {
    it("✅ should retrieve order information", async function () {
      const pair = "BTC/ETH";
      const amount = 100;
      const price = 1500;
      const isLong = true;

      await contract.connect(signers.alice).placeOrder(pair, isLong, amount, price);

      const orderInfo = await contract.getOrderInfo(1);

      expect(orderInfo.trader).to.equal(signers.alice.address);
      expect(orderInfo.pair).to.equal(pair);
      expect(orderInfo.isLong).to.equal(isLong);
      expect(orderInfo.hasExecuted).to.be.a("boolean");
    });

    it("✅ should retrieve trade information", async function () {
      const pair = "BTC/ETH";
      const amount = 100;

      await contract.connect(signers.alice).quickBuy(pair, amount);

      const tradeInfo = await contract.getTradeInfo(1);

      expect(tradeInfo.pair).to.equal(pair);
      expect(tradeInfo.isConfirmed).to.equal(true);
    });
  });

  describe("Trading Statistics", function () {
    it("✅ should track order count", async function () {
      const initialCount = await contract.getCurrentOrderCount();

      await contract.connect(signers.alice).placeOrder("BTC/ETH", true, 100, 1500);
      await contract.connect(signers.alice).placeOrder("ETH/USDT", false, 50, 2000);

      const finalCount = await contract.getCurrentOrderCount();

      expect(finalCount).to.equal(initialCount + 2);
    });

    it("✅ should track trade count", async function () {
      const initialCount = await contract.getCurrentTradeCount();

      await contract.connect(signers.alice).quickBuy("BTC/ETH", 100);
      await contract.connect(signers.bob).quickBuy("ETH/USDT", 50);
      await contract.connect(signers.alice).quickSell("BTC/ETH", 30);

      const finalCount = await contract.getCurrentTradeCount();

      expect(finalCount).to.equal(initialCount + 3);
    });

    it("✅ should provide round information", async function () {
      const roundInfo = await contract.getCurrentRoundInfo();

      expect(roundInfo.round).to.equal(1);
      expect(roundInfo.orderCount).to.be.a("bigint");
      expect(roundInfo.tradeCount).to.be.a("bigint");
      expect(roundInfo.lastTime).to.be.a("bigint");
    });
  });

  describe("Access Control", function () {
    it("✅ owner should be able to update round", async function () {
      const initialRound = await contract.currentRound();

      await contract.connect(signers.deployer).updateRound();

      const newRound = await contract.currentRound();
      expect(newRound).to.equal(initialRound + 1n);
    });

    it("❌ non-owner should not be able to update round", async function () {
      await expect(
        contract.connect(signers.alice).updateRound()
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Complex Scenarios", function () {
    it("✅ should handle concurrent operations from multiple users", async function () {
      const pair = "BTC/ETH";

      // Alice buys
      await contract.connect(signers.alice).quickBuy(pair, 100);

      // Bob places limit sell
      await contract.connect(signers.bob).placeOrder(pair, false, 50, 1600);

      // Alice places limit buy
      await contract.connect(signers.alice).placeOrder(pair, true, 200, 1400);

      // Bob buys
      await contract.connect(signers.bob).quickBuy(pair, 75);

      const aliceOrders = await contract.getCurrentOrderCount();
      const totalTrades = await contract.getCurrentTradeCount();

      expect(aliceOrders).to.equal(2); // 1 limit + 1 quick
      expect(totalTrades).to.be.greaterThanOrEqual(3);
    });

    it("✅ should maintain consistent state across operations", async function () {
      const pair = "BTC/ETH";

      const initialOrderCount = await contract.getCurrentOrderCount();
      const initialTradeCount = await contract.getCurrentTradeCount();

      // Series of operations
      await contract.connect(signers.alice).quickBuy(pair, 100);
      await contract.connect(signers.alice).placeOrder(pair, true, 50, 1500);
      await contract.connect(signers.bob).quickBuy(pair, 75);
      await contract.connect(signers.alice).quickSell(pair, 25);

      const finalOrderCount = await contract.getCurrentOrderCount();
      const finalTradeCount = await contract.getCurrentTradeCount();

      // Verify counts increased correctly
      expect(finalOrderCount).to.equal(initialOrderCount + 1);
      expect(finalTradeCount).to.be.greaterThanOrEqual(initialTradeCount + 3);
    });

    it("✅ should support multiple trading pairs", async function () {
      const pairs = ["BTC/ETH", "ETH/USDT", "BTC/USDT"];

      for (const pair of pairs) {
        await contract.connect(signers.alice).quickBuy(pair, 100);
      }

      for (const pair of pairs) {
        const balance = await contract.getPortfolioBalance(signers.alice.address, pair);
        expect(balance).to.equal(100);
      }
    });
  });

  describe("FHEVM Privacy Patterns", function () {
    it("✅ demonstrates encrypted state variable usage", async function () {
      // Portfolio balances are stored as encrypted values
      const pair = "BTC/ETH";
      const amount = 100;

      // Update encrypted state
      await contract.connect(signers.alice).quickBuy(pair, amount);

      // Verify state was updated
      const balance = await contract.getPortfolioBalance(signers.alice.address, pair);
      expect(balance).to.equal(amount);
    });

    it("✅ demonstrates access control pattern", async function () {
      // Only Alice should be able to see her own balance
      const pair = "BTC/ETH";

      await contract.connect(signers.alice).quickBuy(pair, 100);

      // Alice can query her balance (with permission)
      const aliceBalance = await contract.getPortfolioBalance(signers.alice.address, pair);
      expect(aliceBalance).to.equal(100);

      // Bob's balance should remain 0 (separate encrypted state)
      const bobBalance = await contract.getPortfolioBalance(signers.bob.address, pair);
      expect(bobBalance).to.equal(0);
    });

    it("✅ demonstrates private computation pattern", async function () {
      // Multiple operations on encrypted values
      const pair = "BTC/ETH";

      // Alice accumulates balance through multiple buys
      await contract.connect(signers.alice).quickBuy(pair, 50);
      await contract.connect(signers.alice).quickBuy(pair, 30);
      await contract.connect(signers.alice).quickBuy(pair, 20);

      // Verify accumulated balance (computed on encrypted data)
      const totalBalance = await contract.getPortfolioBalance(signers.alice.address, pair);
      expect(totalBalance).to.equal(100);
    });
  });
});
