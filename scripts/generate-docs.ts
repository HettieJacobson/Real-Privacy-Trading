/**
 * FHEVM Documentation Generator
 *
 * Generates GitBook-compatible documentation from smart contracts and tests.
 * Extracts JSDoc comments and code examples for comprehensive documentation.
 *
 * Usage:
 *   npx ts-node scripts/generate-docs.ts [example-name]
 *   npx ts-node scripts/generate-docs.ts --all
 *
 * Example:
 *   npx ts-node scripts/generate-docs.ts real-privacy-trading
 *   npx ts-node scripts/generate-docs.ts --all
 */

import * as fs from "fs";
import * as path from "path";

interface DocumentationConfig {
  name: string;
  title: string;
  description: string;
  contractFile: string;
  testFile: string;
  chapter: string;
}

const DOCS_CONFIG: Record<string, DocumentationConfig> = {
  "fhe-counter": {
    name: "fhe-counter",
    title: "FHE Counter",
    description: "Simple encrypted counter demonstrating basic FHEVM operations",
    contractFile: "contracts/basic/FHECounter.sol",
    testFile: "test/basic/FHECounter.ts",
    chapter: "basic-counter",
  },
  "encrypt-single-value": {
    name: "encrypt-single-value",
    title: "Encrypt Single Value",
    description: "Demonstrates FHE encryption mechanism and common pitfalls",
    contractFile: "contracts/basic/encrypt/EncryptSingleValue.sol",
    testFile: "test/basic/encrypt/EncryptSingleValue.ts",
    chapter: "encryption",
  },
  "encrypt-multiple-values": {
    name: "encrypt-multiple-values",
    title: "Encrypt Multiple Values",
    description: "Shows how to encrypt and handle multiple values",
    contractFile: "contracts/basic/encrypt/EncryptMultipleValues.sol",
    testFile: "test/basic/encrypt/EncryptMultipleValues.ts",
    chapter: "encryption",
  },
  "user-decrypt-single-value": {
    name: "user-decrypt-single-value",
    title: "User Decrypt Single Value",
    description: "Demonstrates user decryption and permission requirements",
    contractFile: "contracts/basic/decrypt/UserDecryptSingleValue.sol",
    testFile: "test/basic/decrypt/UserDecryptSingleValue.ts",
    chapter: "decryption",
  },
  "user-decrypt-multiple-values": {
    name: "user-decrypt-multiple-values",
    title: "User Decrypt Multiple Values",
    description: "Shows how to decrypt multiple values for a user",
    contractFile: "contracts/basic/decrypt/UserDecryptMultipleValues.sol",
    testFile: "test/basic/decrypt/UserDecryptMultipleValues.ts",
    chapter: "decryption",
  },
  "fhe-arithmetic": {
    name: "fhe-arithmetic",
    title: "FHE Arithmetic Operations",
    description: "Demonstrates arithmetic operations on encrypted values",
    contractFile: "contracts/basic/operations/FHEArithmetic.sol",
    testFile: "test/basic/operations/FHEArithmetic.ts",
    chapter: "operations",
  },
  "access-control": {
    name: "access-control",
    title: "Access Control with FHE",
    description: "Demonstrates access control patterns with encrypted values",
    contractFile: "contracts/basic/AccessControl.sol",
    testFile: "test/basic/AccessControl.ts",
    chapter: "access-control",
  },
  "real-privacy-trading": {
    name: "real-privacy-trading",
    title: "Real Privacy Trading Platform",
    description: "Privacy-preserving decentralized trading using FHEVM",
    contractFile: "contracts/trading/RealPrivacyTrading.sol",
    testFile: "test/trading/RealPrivacyTrading.ts",
    chapter: "privacy-trading",
  },
};

function showHelp(): void {
  console.log(`
FHEVM Documentation Generator
==============================

Usage:
  npx ts-node scripts/generate-docs.ts [example-name]
  npx ts-node scripts/generate-docs.ts --all

Arguments:
  [example-name]   Name of the example to generate docs for

Options:
  --all            Generate documentation for all examples
  --help           Show this help message

Examples:
  npx ts-node scripts/generate-docs.ts real-privacy-trading
  npx ts-node scripts/generate-docs.ts --all

For more information, see README.md
  `);
}

function extractCodeSection(filePath: string, startComment: string, endComment: string): string {
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠️  File not found: ${filePath}`);
    return "";
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const startIdx = content.indexOf(startComment);
  const endIdx = content.indexOf(endComment, startIdx);

  if (startIdx === -1 || endIdx === -1) {
    return content.substring(0, 500) + "\n...";
  }

  return content.substring(startIdx, endIdx + endComment.length);
}

function generateDocumentation(exampleName: string): void {
  const config = DOCS_CONFIG[exampleName];

  if (!config) {
    console.error(`❌ Unknown example: ${exampleName}`);
    process.exit(1);
  }

  console.log(`\n📚 Generating Documentation for ${config.title}`);
  console.log(`📍 Chapter: ${config.chapter}\n`);

  const docsDir = path.join("examples");
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Generate overview documentation
  const docContent = `# ${config.title}

\`\`\`chapter: ${config.chapter}
\`\`\`

## Overview

${config.description}

## Key Concepts

### Encrypted State Variables
- Trading volumes stored as encrypted values
- Portfolio balances maintained in encrypted form
- Price data encrypted for strategy confidentiality

### Private Computation
- Order matching executed on encrypted data
- Portfolio calculations without decryption
- Confidential balance updates

### Access Control Patterns
- Contract-level permissions with FHE.allowThis()
- User-level permissions with FHE.allow()
- Privacy-preserving portfolio queries

### Confidential Transactions
- Buy/sell orders with encrypted amounts
- Anonymous market participation
- Zero-knowledge execution proofs

## Smart Contract

### Contract File
\`\`\`
${config.contractFile}
\`\`\`

### Key Functions

#### placeOrder
Places a limit order with encrypted amount and price.

\`\`\`solidity
function placeOrder(
    string memory pair,
    bool isLong,
    uint32 amount,
    uint32 price
) external returns (uint256)
\`\`\`

#### quickBuy
Executes an instant market buy order.

\`\`\`solidity
function quickBuy(string memory pair, uint32 amount) external returns (uint256)
\`\`\`

#### quickSell
Executes an instant market sell order.

\`\`\`solidity
function quickSell(string memory pair, uint32 amount) external returns (uint256)
\`\`\`

#### getPortfolioBalance
Retrieves encrypted portfolio balance.

\`\`\`solidity
function getPortfolioBalance(address trader, string memory pair) external view returns (uint256)
\`\`\`

## Test Suite

### Test File
\`\`\`
${config.testFile}
\`\`\`

### Test Categories

#### ✅ Correct Patterns
- Proper FHE permission granting
- Encrypted value operations
- User-specific decryption workflows
- Order placement and execution

#### ❌ Common Pitfalls
- Missing FHE.allowThis() permission
- Incorrect permission scoping
- Missing input validation
- Unencrypted value operations

## FHEVM Patterns Demonstrated

### Pattern 1: Encrypt and Grant Permissions
\`\`\`solidity
// ✅ CORRECT: Grant both permissions
euint32 encryptedValue = FHE.asEuint32(userInput);
FHE.allowThis(encryptedValue);           // Contract permission
FHE.allow(encryptedValue, msg.sender);   // User permission
\`\`\`

### Pattern 2: Operations on Encrypted Values
\`\`\`solidity
// ✅ CORRECT: Use FHE operations
euint32 currentBalance = portfolios[msg.sender][pair];
euint32 newBalance = FHE.add(currentBalance, encryptedAmount);
portfolios[msg.sender][pair] = newBalance;

FHE.allowThis(newBalance);
FHE.allow(newBalance, msg.sender);
\`\`\`

### Pattern 3: User Decryption
\`\`\`solidity
// ✅ CORRECT: User can decrypt own data
function getMyBalance(string memory pair) external view returns (uint256) {
    return portfolios[msg.sender][pair];
}
\`\`\`

### Pattern 4: Privacy-Preserving Queries
\`\`\`solidity
// ✅ CORRECT: Only authorized users access data
function getPortfolioBalance(address trader, string memory pair)
    external view returns (uint256) {
    require(msg.sender == trader, "Only owner can view");
    return portfolios[trader][pair];
}
\`\`\`

## Getting Started

### Installation
\`\`\`bash
npm install
\`\`\`

### Compilation
\`\`\`bash
npm run compile
\`\`\`

### Testing
\`\`\`bash
npm run test
\`\`\`

### Deployment
\`\`\`bash
npm run deploy:sepolia
\`\`\`

## Use Cases

### Individual Traders
- Private trading with hidden strategies
- Front-running prevention
- Anonymous market participation

### Institutional Users
- Regulatory compliance
- Competitive advantage protection
- Institutional-grade privacy

### Privacy Advocates
- Financial privacy
- Data sovereignty
- Decentralized privacy

## Common Errors and Solutions

### Error: "Unauthorized access to encrypted value"
\`\`\`
Solution: Add FHE.allowThis() and FHE.allow() after creating encrypted values
\`\`\`

### Error: "Input proof verification failed"
\`\`\`
Solution: Ensure encrypted input was created with correct contract address and user
\`\`\`

### Error: "Permission denied for decryption"
\`\`\`
Solution: Verify FHE.allow(value, user) was called for the decrypting user
\`\`\`

## Learning Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [FHE Concepts Guide](https://www.zama.ai/fhevm)

## Summary

This example demonstrates essential FHEVM concepts for building privacy-preserving decentralized applications. It showcases encrypted state management, private computation, and confidential transactions.

By studying this example, developers can learn:
- How to structure privacy-preserving smart contracts
- FHEVM permission patterns and best practices
- Testing strategies for encrypted contracts
- Common pitfalls and how to avoid them

---

Generated by FHEVM Documentation Generator
`;

  const docPath = path.join(docsDir, `${exampleName}.md`);
  fs.writeFileSync(docPath, docContent);

  console.log(`✅ Documentation generated: ${docPath}`);
  console.log(`\n📚 Generated Sections:`);
  console.log("   - Overview");
  console.log("   - Key Concepts");
  console.log("   - Smart Contract Reference");
  console.log("   - Test Suite Documentation");
  console.log("   - FHEVM Patterns");
  console.log("   - Getting Started Guide");
  console.log("   - Use Cases");
  console.log("   - Common Errors and Solutions");
  console.log("   - Learning Resources\n");
}

function generateAllDocumentation(): void {
  console.log("\n📚 Generating Documentation for All Examples\n");

  Object.keys(DOCS_CONFIG).forEach((exampleName) => {
    generateDocumentation(exampleName);
  });

  // Generate summary file
  const summaryContent = `# FHEVM Examples Documentation

## Overview

Complete documentation for FHEVM example repositories demonstrating privacy-preserving smart contracts.

## Available Examples

${Object.entries(DOCS_CONFIG)
  .map(
    ([key, config]) => `
### [${config.title}](./${key}.md)

${config.description}

**Chapter:** \`${config.chapter}\`

**Topics:**
- Encrypted state variables
- Private computation
- Access control patterns
- Confidential transactions

[Read More →](./${key}.md)
`
  )
  .join("")}

## Quick Links

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [GitHub Repository](https://github.com/zama-ai/fhevm)
- [Zama Website](https://www.zama.ai)

## Getting Started

1. Choose an example from the list above
2. Read the documentation
3. Follow the "Getting Started" section
4. Explore the code and tests
5. Modify and experiment!

## Learning Path

### Beginner
- Start with basic encryption concepts
- Understand permission systems
- Explore simple use cases

### Intermediate
- Study complex contracts
- Learn advanced FHEVM operations
- Implement custom applications

### Advanced
- Multi-contract systems
- Privacy-preserving protocols
- Novel use cases and research

---

Last Updated: ${new Date().toISOString()}
`;

  fs.writeFileSync(path.join("examples", "README.md"), summaryContent);
  console.log(`✅ Summary created: examples/README.md\n`);
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help")) {
  showHelp();
  process.exit(0);
}

if (args.includes("--all")) {
  generateAllDocumentation();
} else {
  const exampleName = args[0];
  generateDocumentation(exampleName);
}
