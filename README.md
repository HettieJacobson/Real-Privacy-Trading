# FHEVM Privacy Trading Examples

A comprehensive FHEVM Example Hub demonstrating privacy-preserving smart contracts using Fully Homomorphic Encryption. This repository contains standalone, Hardhat-based FHEVM example repositories with clean tests, automated scaffolding, and self-contained documentation.

[Video](https://youtu.be/VSFhg4Up8WM)

[Live Demo](https://real-privacytrading.vercel.app/)

## 🎯 Project Overview

This project provides a complete system for building and understanding privacy-preserving decentralized finance (DeFi) applications using FHEVM by Zama. It includes:

- **Base Template**: A complete, ready-to-use Hardhat setup for FHEVM development
- **Example Contracts**: Categorized collection of FHEVM examples from basic to advanced
- **Automation Tools**: TypeScript-based CLI tools for generating standalone repositories
- **Documentation Generator**: Tools to create GitBook-compatible documentation
- **Comprehensive Tests**: Test suites demonstrating correct usage and common pitfalls

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Version 7 or higher
- Basic Solidity and JavaScript knowledge

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd RealPrivacyTrading

# Install dependencies
npm install

# Verify installation
npm run compile
```

### Running Tests

```bash
# Run all tests
npm run test

# Run with coverage report
npm run coverage

# Run linting checks
npm run lint
```

### Generate Examples

```bash
# Generate a standalone example repository
npm run create-example real-privacy-trading ./test-output/my-trading-example

# Generate a category project with multiple examples
npm run create-category trading ./test-output/trading-examples

# Generate documentation
npm run generate-docs real-privacy-trading
npm run generate-all-docs
```

## 📁 Project Structure

```
RealPrivacyTrading/
├── fhevm-hardhat-template/          # Base Hardhat template
│   ├── contracts/
│   ├── test/
│   ├── deploy/
│   ├── hardhat.config.ts
│   └── package.json
│
├── contracts/                        # All example contracts
│   ├── basic/                       # Basic FHE operations
│   │   └── FHECounter.sol           # Simple encrypted counter
│   │
│   └── trading/                     # Privacy-preserving trading
│       ├── RealPrivacyTrading.sol   # Full trading platform
│       └── PrivacyAssetTrading.sol  # Alternative implementation
│
├── test/                            # Comprehensive test suites
│   ├── basic/                       # Tests for basic examples
│   └── trading/                     # Tests for trading contracts
│
├── scripts/                         # Automation tools
│   ├── create-fhevm-example.ts      # Single example generator
│   ├── create-fhevm-category.ts     # Category project generator
│   ├── generate-docs.ts              # Documentation generator
│   └── README.md                     # Scripts documentation
│
├── examples/                        # Generated documentation
│   ├── README.md                    # Documentation index
│   └── *.md                         # Individual example docs
│
├── package.json                     # Project configuration
├── hardhat.config.ts                # Hardhat configuration
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # This file
```

## 📚 Available Examples

### Basic Examples

#### **FHE Counter** (`fhe-counter`)
A simple encrypted counter demonstrating basic FHEVM operations.

**Concepts:**
- Encrypted state variables
- FHE addition and subtraction
- Input proofs and verification
- Permission management

**Quick Start:**
```bash
npm run create-example fhe-counter ./test-output/counter
cd test-output/counter
npm install && npm run compile && npm run test
```

### Advanced Examples

#### **Real Privacy Trading** (`real-privacy-trading`)
A complete privacy-preserving decentralized trading platform.

**Concepts:**
- Encrypted order management
- Private portfolio tracking
- Confidential trade execution
- Access control patterns

**Features:**
- Place encrypted orders with hidden amounts and prices
- Track portfolios in encrypted form
- Execute trades without revealing transaction details
- User-specific decryption permissions

**Quick Start:**
```bash
npm run create-example real-privacy-trading ./test-output/trading
cd test-output/trading
npm install && npm run compile && npm run test
```

## 🔧 Automation Scripts

### Create FHEVM Example

Generates standalone FHEVM example repositories.

```bash
npm run create-example <example-name> <output-path>
```

**Examples:**
```bash
npm run create-example fhe-counter ./examples/counter
npm run create-example real-privacy-trading ./examples/trading

# List available examples
npm run list-examples
npm run help:create
```

### Create FHEVM Category

Generates projects with multiple related examples.

```bash
npm run create-category <category-name> <output-path>
```

**Available Categories:**
- **basic** - Foundational FHEVM operations
- **trading** - Privacy-preserving trading examples

**Examples:**
```bash
npm run create-category basic ./examples/basic-set
npm run create-category trading ./examples/trading-set

# List available categories
npm run list-categories
npm run help:category
```

### Generate Documentation

Creates GitBook-compatible documentation.

```bash
# Generate docs for specific example
npm run generate-docs <example-name>

# Generate docs for all examples
npm run generate-all-docs

# Show help
npm run help:docs
```

**Examples:**
```bash
npm run generate-docs fhe-counter
npm run generate-docs real-privacy-trading
npm run generate-all-docs
```

## 🔐 FHEVM Concepts

### Encryption Binding

Every encrypted value in FHEVM is bound to a `[contract, user]` pair:
- **Contract Address**: The contract where encryption occurred
- **User Address**: The wallet that performed the encryption

This ensures encrypted values cannot be used in different contexts without authorization.

### Critical Pattern: Permission System

```solidity
// ✅ ALWAYS grant both permissions
euint32 value = FHE.fromExternal(externalValue, proof);
FHE.allowThis(value);           // Contract permission
FHE.allow(value, msg.sender);   // User permission
```

### Access Control

```solidity
// ✅ CORRECT: Grant contract access
FHE.allowThis(encryptedValue);

// ✅ CORRECT: Grant user decryption access
FHE.allow(encryptedValue, msg.sender);

// ❌ WRONG: Missing FHE.allowThis()
FHE.allow(encryptedValue, msg.sender);  // Fails without allowThis!
```

### Input Proofs

Zero-knowledge proofs verify:
1. Input was encrypted with correct binding
2. User has control of private key
3. No tampering or relaying

```typescript
// ✅ CORRECT: Create encrypted input with correct signer
const enc = await fhevm.createEncryptedInput(contractAddr, alice.address)
    .add32(123).encrypt();
await contract.connect(alice).operate(enc.handles[0], enc.inputProof);

// ❌ WRONG: Mismatched signer
const enc = await fhevm.createEncryptedInput(contractAddr, alice.address)
    .add32(123).encrypt();
await contract.connect(bob).operate(enc.handles[0], enc.inputProof);  // Fails!
```

## 🧪 Testing Strategy

### Test Structure

```bash
test/
├── basic/
│   ├── FHECounter.ts          # Tests for basic counter
│   └── *.ts                    # Other basic tests
│
└── trading/
    ├── RealPrivacyTrading.ts   # Tests for trading contract
    └── *.ts                    # Other trading tests
```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- test/trading/RealPrivacyTrading.ts

# Run with detailed output
npm run test -- --reporter tap

# Run with coverage
npm run coverage
```

### Test Categories

Each example includes:

**✅ Success Cases**
- Proper FHE permission granting
- Encrypted value operations
- User-specific decryption
- Complex transactions

**❌ Failure Cases & Pitfalls**
- Missing FHE.allowThis() permission
- Incorrect permission scoping
- Missing input validation
- Unauthorized access attempts

## 📖 Code Quality Standards

### Solidity Contracts

```bash
# Lint Solidity files
npm run lint:sol

# Format code
npm run prettier:write

# Generate coverage report
npm run coverage
```

### TypeScript Scripts

```bash
# Lint TypeScript files
npm run lint:ts

# Check code formatting
npm run prettier:check
```

### Full Quality Check

```bash
npm run lint
```

## 🏗️ Architecture

### Contract Design Pattern

```
┌─────────────────────────────────┐
│   FHEVM Contract Layer          │
├─────────────────────────────────┤
│  Encrypted State Variables      │
│  (euint32, euint64, etc.)       │
├─────────────────────────────────┤
│  FHE Operations                 │
│  (FHE.add, FHE.sub, FHE.eq)     │
├─────────────────────────────────┤
│  Permission Management          │
│  (FHE.allowThis, FHE.allow)     │
├─────────────────────────────────┤
│  Access Control Checks          │
│  (require, permission guards)    │
└─────────────────────────────────┘
```

### Development Workflow

1. **Write Contract** - Create in `contracts/<category>/`
2. **Write Tests** - Create in `test/<category>/`
3. **Generate Docs** - Use generation scripts
4. **Test Standalone** - Verify example repository works
5. **Update README** - Document new example

## 🚀 Deployment

### Deploy to Sepolia Testnet

```bash
# 1. Configure environment
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY

# 2. Deploy contract
npm run deploy:sepolia

# 3. Verify on Etherscan
npm run verify:sepolia -- <CONTRACT_ADDRESS>
```

### Deploy Generated Example

```bash
# Generate example
npm run create-example fhe-counter ./my-counter

# Deploy
cd my-counter
npm install
npm run deploy:sepolia
```

## 📊 Key Dependencies

```json
{
  "@fhevm/solidity": "^0.9.1",         // FHEVM Solidity library
  "@fhevm/hardhat-plugin": "^0.3.0-1", // Hardhat plugin with mock
  "@zama-fhe/relayer-sdk": "^0.3.0-5", // Decryption relayer
  "hardhat": "^2.26.0",                 // Development environment
  "typescript": "^5.8.3"                // Type safety
}
```

## 🔮 Use Cases

### Individual Traders
- **Private Trading**: Hide strategy and position sizes
- **Front-Running Prevention**: Encrypted amounts prevent MEV
- **Anonymous Participation**: Trade without identity exposure

### Institutional Users
- **Regulatory Compliance**: Privacy for sensitive data
- **Competitive Protection**: Keep algorithms confidential
- **Institutional-Grade Privacy**: Enterprise confidentiality

### Privacy Advocates
- **Financial Privacy**: Exercise rights without surveillance
- **Data Sovereignty**: Full control over financial data
- **Decentralized Privacy**: DeFi with true confidentiality

## ⚠️ Security Considerations

### What is Encrypted
✅ Trading volumes and amounts
✅ Order prices and limits
✅ Portfolio balances
✅ Transaction details

### What is Transparent
❌ Contract address (deployed)
❌ Transaction timestamps
❌ Number of transactions
❌ User addresses (without decryption)

### Security Best Practices

1. **Always grant both permissions**
   ```solidity
   FHE.allowThis(value);
   FHE.allow(value, user);
   ```

2. **Validate all encrypted inputs**
   - Check input proofs
   - Verify user signatures
   - Validate input ranges

3. **Use proper error handling**
   - Require statements
   - Custom error messages
   - Permission checks

4. **Test edge cases**
   - Boundary values
   - Overflow/underflow
   - Permission violations

## 📚 Learning Resources

### FHEVM Documentation
- [FHEVM Official Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)
- [FHE Concepts Guide](https://docs.zama.ai/fhevm/fundamentals/fhe-concepts)

### Development Tools
- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Programming Guide](https://docs.soliditylang.org/)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)

### Privacy & Cryptography
- [Fully Homomorphic Encryption Basics](https://www.zama.ai/post/what-is-fully-homomorphic-encryption-fhe)
- [Zero-Knowledge Proofs](https://ethereum.org/en/zero-knowledge-proofs/)
- [Privacy in Smart Contracts](https://blog.ethereum.org/2023/10/25/applying-cryptography-to-privacy)

## 🤝 Contributing

Contributions are welcome! When adding examples:

1. **Follow naming conventions**
   - Kebab-case for example names: `my-privacy-example`
   - PascalCase for contracts: `MyPrivacyExample`
   - camelCase for functions: `myFunction()`

2. **Include comprehensive documentation**
   - JSDoc comments for all public functions
   - Explain FHEVM-specific patterns
   - Document common pitfalls

3. **Write thorough tests**
   - Test both success and failure cases
   - Use descriptive test names
   - Include integration tests

4. **Update automation scripts**
   - Add to `EXAMPLES_CONFIG` in `create-fhevm-example.ts`
   - Add to `DOCS_CONFIG` in `generate-docs.ts`
   - Add to `CATEGORIES_CONFIG` in `create-fhevm-category.ts`

5. **Test generated repositories**
   ```bash
   npm run create-example your-example ./test-output
   cd test-output
   npm install && npm run compile && npm run test
   ```

## 📝 License

BSD-3-Clause-Clear License

See LICENSE file for details.

## 🎯 Bounty Program

**Program**: FHEVM Example Repository Challenge
**Prize Pool**: $10,000 USD
**Submission Deadline**: December 31, 2025 (23:59 UTC)
**Network**: Sepolia Testnet (FHEVM enabled)

### Deliverables Met

✅ Independent Hardhat-based examples
✅ Demonstrates clear FHEVM concepts
✅ Comprehensive test suite
✅ Automated scaffolding capability
✅ GitBook-compatible documentation
✅ Developer guide and maintenance tools
✅ Multiple example categories
✅ Standalone repository generation

## 📞 Support & Contact

- **GitHub Issues**: Report bugs and request features
- **Zama Discord**: Community support and discussions
- **Documentation**: Full FHEVM guides and tutorials
- **Email**: For partnership inquiries

## 🔗 References

- [Zama GitHub](https://github.com/zama-ai)
- [Zama Website](https://www.zama.ai)
- [FHEVM Repository](https://github.com/zama-ai/fhevm)
- [Hardhat Template](https://github.com/zama-ai/fhevm-hardhat-template)
- [OpenZeppelin Confidential](https://github.com/OpenZeppelin/openzeppelin-confidential-contracts)

---

**Built for the Zama FHEVM Example Repository Bounty Program - December 2025**

**Privacy-Preserving Finance with Fully Homomorphic Encryption**
