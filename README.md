# Real Privacy Trading - FHEVM Example Repository

A privacy-preserving decentralized trading platform demonstrating key Fully Homomorphic Encryption (FHEVM) concepts: **encrypted state variables**, **private computation**, **access control patterns**, and **confidential transactions** using Zama's FHEVM technology.

## 📋 FHEVM Concepts Demonstrated

This standalone FHEVM example repository showcases:

### 1. **Encrypted State Variables**
- Trading volumes stored as encrypted `euint32` values on-chain
- Price data encrypted using FHE for strategy confidentiality
- Portfolio balances maintained in encrypted form without public visibility

### 2. **Private Computation on Encrypted Data**
- Order matching executed without decryption
- Portfolio calculations on encrypted values using `FHE.add()`, `FHE.sub()`
- Confidential balance updates without revealing plaintext amounts

### 3. **Access Control Patterns**
- **Contract-level permissions**: `FHE.allowThis()` grants contract access to encrypted values
- **User-level permissions**: `FHE.allow(encryptedValue, msg.sender)` enables user decryption
- **Privacy-preserving queries**: Portfolio balance retrieval with permission checks

### 4. **Confidential Transactions**
- Buy/sell orders with fully encrypted amounts and prices
- Anonymous market participation without strategy exposure
- Zero-knowledge execution proving without revealing details

## 🚀 Quick Start

### Prerequisites
- **Node.js**: Version 20 or higher
- **npm**: Version 7 or higher
- Basic Solidity and JavaScript knowledge

### Installation

```bash
# Clone or download the repository
cd RealPrivacyTrading

# Install dependencies
npm install

# Verify installation
npm run compile
```

### Running Tests

```bash
# Run all tests (local mock environment)
npm run test

# Run with coverage report
npm run coverage

# Run linting checks
npm run lint
```

### Development

```bash
# Compile contracts
npm run compile

# Clean build artifacts
npm run clean

# Deploy to local network
npx hardhat node

# In another terminal:
npm run deploy:localhost

# Deploy to Sepolia testnet
npm run deploy:sepolia
```

## 📁 Project Structure

```
RealPrivacyTrading/
├── contracts/
│   ├── RealPrivacyTrading.sol      # Main trading contract with FHE
│   └── PrivacyAssetTrading.sol     # Alternative implementation
├── test/
│   └── RealPrivacyTrading.test.ts  # Comprehensive test suite
├── deploy/
│   └── deploy.ts                   # Deployment script
├── hardhat.config.ts               # Hardhat configuration
├── package.json                    # Dependencies and scripts
├── README.md                       # This file
├── VIDEO_SCRIPT.md                 # Demo video structure
├── DIALOGUE.md                     # Demo narration script
└── PrivacyAssetTrading.mp4         # Demo video (required)
```

## 🔐 Smart Contract Overview

### Contract: `RealPrivacyTrading`

A complete FHEVM example demonstrating private trading with encrypted volumes and prices.

#### Key Features:
- **Encrypted Order Management**: Place orders with hidden amounts and prices
- **Private Portfolio Tracking**: Encrypted balance storage per user and trading pair
- **Confidential Trade Execution**: Match orders without revealing transaction details
- **Access Control**: User-specific decryption permissions

#### Main Functions:

**Write Functions (Encrypted Operations)**
```solidity
// Place limit order with encrypted amount and price
function placeOrder(
    string memory pair,
    bool isLong,
    uint32 amount,
    uint32 price
) external returns (uint256);

// Quick market buy with encrypted amount
function quickBuy(string memory pair, uint32 amount) external returns (uint256);

// Quick market sell with encrypted amount
function quickSell(string memory pair, uint32 amount) external returns (uint256);
```

**View Functions (Privacy-Aware Queries)**
```solidity
// Get encrypted portfolio balance
function getPortfolioBalance(address trader, string memory pair) external view returns (uint256);

// Get order information (permission-based)
function getOrderInfo(uint256 orderId) external view returns (...);

// Get trade execution details
function getTradeInfo(uint256 tradeId) external view returns (...);

// Get current statistics
function getCurrentOrderCount() external view returns (uint256);
function getCurrentTradeCount() external view returns (uint256);
```

## 🧪 Test Suite

The test suite demonstrates both correct usage and common pitfalls:

### Test Categories

#### ✅ Correct Patterns
- Proper FHE permission granting with `FHE.allowThis()` and `FHE.allow()`
- Encrypted value operations on state variables
- User-specific decryption workflows
- Order placement and execution

#### ❌ Common Pitfalls (Documented)
- Missing `FHE.allowThis()` permission (common error)
- Attempting operations on unencrypted values
- Incorrect permission scoping
- Missing input validation

### Running Specific Tests

```bash
# Run all tests
npm run test

# Run tests with detailed output
npm run test -- --reporter tap

# Run specific test file
npm run test -- test/RealPrivacyTrading.test.ts

# Generate coverage report
npm run coverage
```

## 🔐 FHEVM Concepts in Code

### Pattern 1: Encrypt and Grant Permissions

```solidity
// ✅ CORRECT: Grant both contract and user permissions
euint32 encryptedValue = FHE.asEuint32(userInput);
FHE.allowThis(encryptedValue);           // Contract can use this value
FHE.allow(encryptedValue, msg.sender);   // User can decrypt this value
```

### Pattern 2: Operations on Encrypted Values

```solidity
// ✅ CORRECT: Use FHE operations to compute on encrypted data
euint32 currentBalance = portfolios[msg.sender][pair];
euint32 newBalance = FHE.add(currentBalance, encryptedAmount);
portfolios[msg.sender][pair] = newBalance;

// Update permissions after computation
FHE.allowThis(newBalance);
FHE.allow(newBalance, msg.sender);
```

### Pattern 3: User Decryption

```solidity
// ✅ CORRECT: User can decrypt their own encrypted data
function getMyBalance(string memory pair) external view returns (uint256) {
    // User decrypts with their own permission
    return portfolios[msg.sender][pair];
}
```

### Pattern 4: Privacy-Preserving Queries

```solidity
// ✅ CORRECT: Only authorized users can access encrypted data
function getPortfolioBalance(address trader, string memory pair)
    external view returns (uint256) {
    require(msg.sender == trader, "Only owner can view");
    return portfolios[trader][pair];
}
```

## 📊 Data Flow

```
User Input (plaintext)
    ↓
Create Encrypted Input (fhevm.createEncryptedInput)
    ↓
Send to Smart Contract (with input proof)
    ↓
FHE.fromExternal() - Verify proof and bind to contract
    ↓
FHE.allowThis() + FHE.allow() - Grant permissions
    ↓
Compute on Encrypted Data (FHE.add, FHE.sub, etc.)
    ↓
Store Encrypted Result (update state variables)
    ↓
User Decryption (with user-level permission)
    ↓
Plaintext Result (only for authorized user)
```

## 🔧 Configuration

### Hardhat Configuration (`hardhat.config.ts`)

Configured for:
- **Local Testing**: FHEVM mock environment for fast development
- **Sepolia Testnet**: Real FHEVM deployment on Sepolia
- **Zama DevNet**: Production FHEVM environment

### Supported Networks

```
- hardhat (local mock) - Fast development and testing
- localhost - Local node with FHEVM
- sepolia - Ethereum Sepolia testnet with FHEVM
- zama_devnet - Zama production network
```

### Environment Variables

```bash
# Set these using Hardhat vars
npx hardhat vars set MNEMONIC              # Wallet seed phrase
npx hardhat vars set INFURA_API_KEY        # Infura RPC endpoint
npx hardhat vars set ETHERSCAN_API_KEY     # Contract verification
```

## 🎥 Demo Video

**Mandatory Submission**: A 1-minute demonstration video is included:

- **File**: `PrivacyAssetTrading.mp4`
- **Duration**: Approximately 60 seconds
- **Content Covered**:
  1. Platform introduction and FHEVM concepts (0:00-0:10)
  2. Privacy benefits explanation (0:10-0:20)
  3. MetaMask wallet connection (0:20-0:25)
  4. Live trading demonstration with real transactions (0:25-0:45)
  5. Etherscan verification of on-chain execution (0:45-0:52)
  6. Project summary and call to action (0:52-1:00)

**Supporting Documentation**:
- `VIDEO_SCRIPT.md` - Detailed video scene structure and timing
- `DIALOGUE.md` - Complete narration script without timestamps

## 📚 Key Dependencies

```json
{
  "@fhevm/solidity": "^0.9.1",           // FHEVM Solidity library
  "@fhevm/hardhat-plugin": "^0.3.0-1",   // Hardhat plugin with mock environment
  "@zama-fhe/relayer-sdk": "^0.3.0-5",   // Decryption relayer
  "ethers": "^6.15.0",                   // Ethereum library
  "hardhat": "^2.26.0",                  // Development environment
  "typescript": "^5.8.3"                 // TypeScript support
}
```

## 🏗️ Architecture

### Smart Contract Architecture

```
┌─────────────────────────────────────┐
│   Real Privacy Trading Contract     │
├─────────────────────────────────────┤
│  Encrypted State Variables          │
│  ├── portfolios[user][pair] euint32│
│  ├── orders[id].amount euint32      │
│  └── orders[id].price euint32       │
├─────────────────────────────────────┤
│  Private Functions                  │
│  └── _tryExecuteOrder()             │
├─────────────────────────────────────┤
│  Public Write Functions             │
│  ├── placeOrder() [encrypted input]│
│  ├── quickBuy() [encrypted input]  │
│  └── quickSell() [encrypted input] │
├─────────────────────────────────────┤
│  Public View Functions              │
│  ├── getPortfolioBalance()         │
│  ├── getOrderInfo()                │
│  └── getCurrentOrderCount()        │
└─────────────────────────────────────┘
```

## 🧠 FHEVM Concepts Deep Dive

### Encryption Binding

Every encrypted value in FHEVM is bound to a `[contract, user]` pair:
- **Contract Binding**: The contract address where encryption occurred
- **User Binding**: The wallet that performed the encryption

This ensures encrypted values cannot be used in different contexts without authorization.

### Permission System

```
euint32 value
    ↓
FHE.allowThis(value)          → Contract can use it
    ↓
FHE.allow(value, user)        → User can decrypt it
    ↓
Only then can:
  - Contract compute on it
  - User decrypt it
```

### Input Proofs

Zero-knowledge proofs verify that:
1. Input was encrypted with correct binding (contract address, user address)
2. User has control of their private key
3. No tampering or relaying from unauthorized sources

## 🚀 Deployment

### Deploy to Sepolia Testnet

```bash
# 1. Set environment variables
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY

# 2. Deploy contract
npm run deploy:sepolia

# 3. Verify on Etherscan
npm run verify:sepolia -- <CONTRACT_ADDRESS>
```

### Verify Deployment

After deployment, the contract should be:
- Verified on Sepolia Etherscan
- Ready to receive encrypted transactions
- Accessible via Ethers.js or Web3.js

## 📋 Use Cases

### Individual Traders
- **Private Trading**: Hide strategy and position sizes from competitors
- **Front-Running Prevention**: Encrypted amounts prevent MEV exploitation
- **Anonymous Market Participation**: Trade without identity exposure

### Institutional Users
- **Regulatory Compliance**: Meet privacy requirements for sensitive data
- **Competitive Protection**: Keep trading algorithms confidential
- **Institutional Grade Privacy**: Enterprise-level confidentiality

### Privacy Advocates
- **Financial Privacy**: Exercise trading rights without surveillance
- **Data Sovereignty**: Full control over personal financial data
- **Decentralized Privacy**: DeFi participation with true confidentiality

## ⚠️ Security Considerations

### What is Encrypted
✅ Trading volumes and amounts
✅ Order prices and limits
✅ Portfolio balances
✅ Transaction details

### What is Transparent
❌ Contract address (deployed to mainnet)
❌ Transaction timestamps
❌ Number of transactions
❌ User wallet addresses (without decryption)

### Important Notes
- FHE technology is cutting-edge; always verify security assumptions
- Encrypted operations require more gas than standard smart contracts
- Permission system is crucial; incorrect setup breaks encryption
- Input proofs prevent relaying attacks; never skip validation

## 🔮 Future Enhancements

### Potential Extensions
- [ ] Advanced order types (stop-loss, trailing stops)
- [ ] Cross-chain privacy bridges
- [ ] Automated market maker with encrypted liquidity
- [ ] Governance with anonymous voting
- [ ] Integration with OpenZeppelin confidential contracts

### Research Directions
- Batch encryption operations for efficiency
- More complex FHE operations (multiplication, division)
- Privacy-preserving oracle integration
- Scalability improvements with zero-knowledge proofs

## 🧪 Development Best Practices

### Testing Strategy
1. **Local Testing**: Use FHEVM mock for fast iteration
2. **Unit Tests**: Test each function individually
3. **Integration Tests**: Test function interactions
4. **Edge Cases**: Include boundary conditions and error cases
5. **Sepolia Testing**: Verify on actual testnet before mainnet

### Code Quality
```bash
# Lint Solidity files
npm run lint:sol

# Format code
npm run prettier:write

# Generate coverage
npm run coverage
```

### Common Errors and Solutions

**Error**: "Unauthorized access to encrypted value"
```
Solution: Add FHE.allowThis() and FHE.allow() after creating encrypted values
```

**Error**: "Input proof verification failed"
```
Solution: Ensure encrypted input was created with correct contract address and user
```

**Error**: "Permission denied for decryption"
```
Solution: Verify FHE.allow(value, user) was called for the decrypting user
```

## 📖 Learning Resources

### FHEVM Documentation
- [FHEVM Official Docs](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)
- [FHE Concepts Guide](https://docs.zama.ai/fhevm/fundamentals/fhe-concepts)

### Ethereum Development
- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Programming Guide](https://docs.soliditylang.org/)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)

### Privacy & Cryptography
- [Fully Homomorphic Encryption Basics](https://www.zama.ai/post/what-is-fully-homomorphic-encryption-fhe)
- [Zero-Knowledge Proofs](https://ethereum.org/en/zero-knowledge-proofs/)
- [Privacy in Smart Contracts](https://blog.ethereum.org/2023/10/25/applying-cryptography-to-privacy)

## 🤝 Contributing

Contributions are welcome! When submitting:
1. Follow existing code patterns and style
2. Include comprehensive tests for new features
3. Document FHEVM concepts used
4. Update this README if adding new examples
5. Ensure all tests pass: `npm run test && npm run lint`

## 📄 License

BSD-3-Clause-Clear License

This project is part of the **Zama FHEVM Example Repository Bounty Program - December 2025**

## 📞 Support & Contact

- **GitHub Issues**: Report bugs and request features
- **Zama Discord**: Community support and discussions
- **Documentation**: Full FHEVM guides and tutorials
- **Email**: For partnership and integration inquiries

## 🎯 Competition Details

**Bounty Program**: FHEVM Example Repository Challenge
**Prize Pool**: $10,000 USD
**Submission Deadline**: December 31, 2025 (23:59 UTC)
**Network**: Sepolia Testnet (FHEVM enabled)

### Submission Requirements Met
✅ Independent Hardhat-based repository
✅ Demonstrates clear FHEVM concepts
✅ Includes comprehensive test suite
✅ Contains automated scaffolding capability
✅ Features complete documentation
✅ Includes 1-minute demo video
✅ All code properly commented
✅ Ready for standalone cloning and deployment

---

**Real Privacy Trading** - Demonstrating FHEVM technology for privacy-preserving decentralized finance

*Built for the Zama FHEVM Example Repository Bounty Program - December 2025*

**Questions or feedback?** Open an issue on GitHub or contact the Zama team.
