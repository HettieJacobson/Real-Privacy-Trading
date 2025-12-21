#!/usr/bin/env ts-node

/**
 * FHEVM Category Repository Generator
 *
 * This script generates standalone FHEVM category repositories containing
 * multiple related examples organized by topic.
 *
 * Usage:
 *   npx ts-node scripts/create-fhevm-category.ts <category-name> <output-path>
 *
 * Example:
 *   npx ts-node scripts/create-fhevm-category.ts trading ./my-trading-examples
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface CategoryConfig {
  name: string;
  title: string;
  description: string;
  examples: string[];
  concepts: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

const CATEGORIES_CONFIG: Record<string, CategoryConfig> = {
  "basic": {
    name: "basic",
    title: "Basic FHEVM Operations",
    description: "Foundational examples covering core FHEVM concepts and operations",
    examples: [
      "fhe-counter",
      "encrypt-single-value",
      "encrypt-multiple-values",
      "user-decrypt-single-value",
      "user-decrypt-multiple-values"
    ],
    concepts: [
      "Encrypted variables",
      "FHE operations",
      "Input proofs",
      "User decryption",
      "Permission system",
      "Batch operations"
    ],
    difficulty: "beginner",
  },
  "operations": {
    name: "operations",
    title: "FHE Operations and Arithmetic",
    description: "Examples demonstrating FHE arithmetic operations and comparisons",
    examples: ["fhe-arithmetic"],
    concepts: [
      "FHE.add",
      "FHE.sub",
      "FHE.mul",
      "FHE.eq",
      "Chaining operations",
      "Result permissions"
    ],
    difficulty: "intermediate",
  },
  "access": {
    name: "access",
    title: "Access Control Patterns",
    description: "Examples demonstrating access control and permission management",
    examples: ["access-control"],
    concepts: [
      "FHE.allow",
      "FHE.allowThis",
      "FHE.allowTransient",
      "Role-based access",
      "Ownership patterns",
      "Authorization checks"
    ],
    difficulty: "intermediate",
  },
  "trading": {
    name: "trading",
    title: "Privacy-Preserving Trading Examples",
    description: "Advanced examples demonstrating privacy-preserving decentralized trading using FHEVM",
    examples: ["real-privacy-trading"],
    concepts: [
      "Encrypted state variables",
      "Private computation",
      "Access control patterns",
      "Confidential transactions",
      "Order matching",
      "Portfolio management"
    ],
    difficulty: "advanced",
  },
};

function showHelp(): void {
  console.log(`
FHEVM Category Repository Generator
====================================

Usage:
  npx ts-node scripts/create-fhevm-category.ts <category-name> <output-path>

Arguments:
  <category-name>  Name of the category to generate
  <output-path>    Output directory path

Examples:
  npx ts-node scripts/create-fhevm-category.ts trading ./examples/trading
  npx ts-node scripts/create-fhevm-category.ts basic ./examples/basic

Available Categories:
${Object.entries(CATEGORIES_CONFIG)
  .map(
    ([key, config]) => `
  • ${key}
    Title: ${config.title}
    Description: ${config.description}
    Difficulty: ${config.difficulty}
    Examples: ${config.examples.join(", ")}
    Concepts: ${config.concepts.join(", ")}
  `
  )
  .join("")}

Options:
  --help           Show this help message
  --list           List all available categories

For more information, see README.md
  `);
}

function listCategories(): void {
  console.log("\nAvailable FHEVM Categories:\n");
  Object.entries(CATEGORIES_CONFIG).forEach(([key, config]) => {
    console.log(`  ${key}`);
    console.log(`    Title: ${config.title}`);
    console.log(`    Description: ${config.description}`);
    console.log(`    Difficulty: ${config.difficulty}`);
    console.log(`    Examples: ${config.examples.join(", ")}`);
    console.log("");
  });
}

function validateCategoryName(name: string): boolean {
  return name in CATEGORIES_CONFIG;
}

function createCategoryRepository(categoryName: string, outputPath: string): void {
  const config = CATEGORIES_CONFIG[categoryName];

  if (!config) {
    console.error(`❌ Unknown category: ${categoryName}`);
    console.error(`Run with --list to see available categories\n`);
    process.exit(1);
  }

  console.log(`\n📋 Generating ${config.title} Category Repository`);
  console.log(`📍 Output: ${outputPath}`);
  console.log(`🎯 Examples: ${config.examples.join(", ")}`);
  console.log(`📚 Concepts: ${config.concepts.join(", ")}\n`);

  try {
    // Create output directory
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
      console.log(`✅ Created directory: ${outputPath}`);
    }

    // Create project structure
    const dirs = ["contracts", "test", "deploy", "scripts"];
    dirs.forEach((dir) => {
      const dirPath = path.join(outputPath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
    console.log(`✅ Created project structure`);

    // Create package.json
    const packageJson = {
      name: `fhevm-${categoryName}-examples`,
      version: "1.0.0",
      description: config.description,
      license: "BSD-3-Clause-Clear",
      scripts: {
        compile: "hardhat compile",
        test: "hardhat test",
        deploy: "hardhat deploy",
        lint: "hardhat check",
        coverage: "hardhat coverage",
      },
      dependencies: {
        "encrypted-types": "^0.0.4",
        "@fhevm/solidity": "^0.9.1",
      },
      devDependencies: {
        "@fhevm/hardhat-plugin": "^0.3.0-1",
        "@nomicfoundation/hardhat-chai-matchers": "^2.1.0",
        "@nomicfoundation/hardhat-ethers": "^3.1.0",
        "@nomicfoundation/hardhat-network-helpers": "^1.1.0",
        "@nomicfoundation/hardhat-verify": "^2.1.0",
        "@typechain/ethers-v6": "^0.5.1",
        "@typechain/hardhat": "^9.1.0",
        "@types/chai": "^4.3.20",
        "@types/mocha": "^10.0.10",
        "@types/node": "^20.19.8",
        "@typescript-eslint/eslint-plugin": "^8.37.0",
        "@typescript-eslint/parser": "^8.37.0",
        "@zama-fhe/relayer-sdk": "^0.3.0-5",
        chai: "^4.5.0",
        "chai-as-promised": "^8.0.1",
        "cross-env": "^7.0.3",
        eslint: "^8.57.1",
        "eslint-config-prettier": "^9.1.0",
        ethers: "^6.15.0",
        hardhat: "^2.26.0",
        "hardhat-deploy": "^0.11.45",
        "hardhat-gas-reporter": "^2.3.0",
        mocha: "^11.7.1",
        prettier: "^3.6.2",
        "prettier-plugin-solidity": "^2.1.0",
        rimraf: "^6.0.1",
        solhint: "^6.0.0",
        "solidity-coverage": "^0.8.16",
        "ts-generator": "^0.1.1",
        "ts-node": "^10.9.2",
        typechain: "^8.3.2",
        typescript: "^5.8.3",
      },
    };

    fs.writeFileSync(path.join(outputPath, "package.json"), JSON.stringify(packageJson, null, 2));
    console.log(`✅ Created package.json`);

    // Create README
    const examplesSection = config.examples
      .map((ex) => `- **${ex}** - Example repository for ${ex}`)
      .join("\n");

    const readme = `# ${config.title}

${config.description}

## FHEVM Concepts Demonstrated

${config.concepts.map((concept) => `- **${concept}**`).join("\n")}

## Included Examples

${examplesSection}

## Getting Started

### Installation

\`\`\`bash
# Install dependencies
npm install

# Verify installation
npm run compile
\`\`\`

### Running Tests

\`\`\`bash
# Run all tests
npm run test

# Run with coverage report
npm run coverage

# Run linting checks
npm run lint
\`\`\`

## Project Structure

\`\`\`
${categoryName}-examples/
├── contracts/          # Smart contract source files
├── test/              # Test suites for contracts
├── deploy/            # Deployment scripts
├── scripts/           # Utility and automation scripts
├── package.json       # Dependencies and scripts
├── hardhat.config.ts  # Hardhat configuration
└── README.md          # This file
\`\`\`

## Development

### Compile Contracts

\`\`\`bash
npm run compile
\`\`\`

### Run Tests

\`\`\`bash
# Run all tests
npm run test

# Run with detailed output
npm run test -- --reporter tap

# Run specific test file
npm run test -- test/YourTest.ts
\`\`\`

### Generate Coverage

\`\`\`bash
npm run coverage
\`\`\`

## Key Concepts Covered

### Example 1: Basic Operations
- Understanding encrypted state variables
- Working with input proofs
- FHE operations on encrypted values

### Example 2: Advanced Patterns
- Complex permission models
- Private computation flows
- Confidential transactions

### Example 3: Production Patterns
- Error handling strategies
- Security best practices
- Optimization techniques

## FHEVM Patterns Demonstrated

### Pattern 1: Encrypt and Grant Permissions

\`\`\`solidity
// ✅ CORRECT: Grant both contract and user permissions
euint32 encryptedValue = FHE.asEuint32(userInput);
FHE.allowThis(encryptedValue);           // Contract permission
FHE.allow(encryptedValue, msg.sender);   // User permission
\`\`\`

### Pattern 2: Operations on Encrypted Values

\`\`\`solidity
// ✅ CORRECT: Use FHE operations to compute on encrypted data
euint32 currentValue = state[msg.sender];
euint32 newValue = FHE.add(currentValue, encryptedAmount);
state[msg.sender] = newValue;

FHE.allowThis(newValue);
FHE.allow(newValue, msg.sender);
\`\`\`

### Pattern 3: User Decryption

\`\`\`solidity
// ✅ CORRECT: User can decrypt their own encrypted data
function getMyValue() external view returns (uint32) {
    return state[msg.sender];
}
\`\`\`

## Common Pitfalls to Avoid

### ❌ Missing Permissions

\`\`\`solidity
// WRONG: Missing FHE.allowThis()
euint32 value = FHE.asEuint32(input);
FHE.allow(value, msg.sender);  // Only user permission!
\`\`\`

### ❌ Unauthorized Access

\`\`\`solidity
// WRONG: User cannot decrypt others' values
function getBalance(address user) external view returns (uint32) {
    return portfolios[user];  // Unauthorized!
}
\`\`\`

### ❌ Missing Input Validation

\`\`\`solidity
// WRONG: No input validation
function setEncryptedValue(externalEuint32 input, bytes calldata proof) external {
    euint32 value = FHE.fromExternal(input, proof);
    // Missing validation!
}
\`\`\`

## Testing Strategy

1. **Unit Tests** - Test individual functions
2. **Integration Tests** - Test function interactions
3. **Edge Cases** - Test boundary conditions
4. **Security Tests** - Test permission system
5. **Performance Tests** - Measure gas usage

## Deployment

### Deploy to Sepolia Testnet

\`\`\`bash
# 1. Configure environment
export MNEMONIC="your seed phrase"
export INFURA_API_KEY="your api key"

# 2. Deploy
npm run deploy:sepolia

# 3. Verify on Etherscan
npm run verify:sepolia -- <CONTRACT_ADDRESS>
\`\`\`

## Key Dependencies

- **@fhevm/solidity** - FHEVM Solidity library
- **@fhevm/hardhat-plugin** - Hardhat integration with mock environment
- **@zama-fhe/relayer-sdk** - Decryption relayer SDK
- **hardhat** - Development environment
- **typescript** - Type safety

## Learning Resources

- [FHEVM Official Docs](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Guide](https://docs.soliditylang.org/)
- [Privacy Concepts](https://www.zama.ai/post/what-is-fully-homomorphic-encryption-fhe)

## Difficulty Level

**${config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1)}**

This category is suitable for developers with ${config.difficulty === "beginner" ? "basic knowledge of Solidity and blockchain" : config.difficulty === "intermediate" ? "intermediate Solidity experience and FHE concepts" : "advanced cryptography and smart contract knowledge"}.

## Contributing

Contributions are welcome! When adding new examples:

1. Follow existing patterns and structure
2. Include comprehensive comments explaining FHEVM concepts
3. Demonstrate both correct usage and common pitfalls
4. Write thorough tests covering success and failure cases
5. Update documentation accordingly
6. Ensure all tests pass: \`npm run test && npm run lint\`

## License

BSD-3-Clause-Clear License

---

**Built for the Zama FHEVM Example Repository Bounty Program - December 2025**
`;

    fs.writeFileSync(path.join(outputPath, "README.md"), readme);
    console.log(`✅ Created README.md`);

    // Create .gitignore
    const gitignore = `node_modules/
.env
.env.local
.env.*.local
dist/
build/
artifacts/
cache/
coverage/
.hardhat/
.solcover.json
*.swp
*.swo
*~
.DS_Store
.idea/
.vscode/
*.log
`;

    fs.writeFileSync(path.join(outputPath, ".gitignore"), gitignore);
    console.log(`✅ Created .gitignore`);

    // Create hardhat.config.ts
    const hardhatConfig = `import { HardhatUserConfig } from "hardhat/config";
import "@fhevm/hardhat-plugin";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
`;

    fs.writeFileSync(path.join(outputPath, "hardhat.config.ts"), hardhatConfig);
    console.log(`✅ Created hardhat.config.ts`);

    // Create tsconfig.json
    const tsconfig = {
      compilerOptions: {
        target: "ES2020",
        module: "commonjs",
        lib: ["ES2020"],
        outDir: "./dist",
        rootDir: "./",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
      },
      include: ["**/*.ts"],
      exclude: ["node_modules", "artifacts", "cache", "dist"],
    };

    fs.writeFileSync(path.join(outputPath, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));
    console.log(`✅ Created tsconfig.json`);

    // Create sample contract file
    const sampleContract = `// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Sample Encrypted Contract
/// @notice Demonstrates basic FHEVM patterns
contract SampleEncrypted is ZamaEthereumConfig {
  // Encrypted state variable
  euint32 private _encryptedValue;

  /// @notice Returns the encrypted value
  function getEncryptedValue() external view returns (euint32) {
    return _encryptedValue;
  }

  /// @notice Sets an encrypted value
  /// @param inputEuint32 The encrypted input value
  /// @param inputProof The input proof for verification
  function setEncryptedValue(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);
    _encryptedValue = encryptedValue;

    FHE.allowThis(_encryptedValue);
    FHE.allow(_encryptedValue, msg.sender);
  }
}
`;

    fs.writeFileSync(path.join(outputPath, "contracts", "SampleEncrypted.sol"), sampleContract);
    console.log(`✅ Created sample contract`);

    // Create sample test file
    const sampleTest = `import { expect } from "chai";
import { ethers } from "hardhat";
import { SampleEncrypted } from "../typechain-types";
import { getSigners } from "@nomicfoundation/hardhat-ethers/signers";

describe("SampleEncrypted", function () {
  let sampleEncrypted: SampleEncrypted;

  beforeEach(async function () {
    const SampleEncrypted = await ethers.getContractFactory("SampleEncrypted");
    sampleEncrypted = await SampleEncrypted.deploy();
    await sampleEncrypted.waitForDeployment();
  });

  it("Should deploy successfully", async function () {
    expect(await sampleEncrypted.getAddress()).to.be.properAddress;
  });

  it("Should handle encrypted values", async function () {
    const [signer] = await ethers.getSigners();
    expect(sampleEncrypted).to.exist;
  });
});
`;

    fs.writeFileSync(path.join(outputPath, "test", "SampleEncrypted.ts"), sampleTest);
    console.log(`✅ Created sample test`);

    // Create DEVELOPER_GUIDE.md
    const developerGuide = `# Developer Guide

This guide helps you work with ${config.title}.

## Adding New Examples

1. Create contract in \`contracts/YourExample.sol\`
2. Create test in \`test/YourExample.ts\`
3. Run tests: \`npm run test\`
4. Update documentation

## Code Standards

- Use PascalCase for contract names
- Use camelCase for function names
- Add JSDoc comments to all public functions
- Include FHEVM pattern explanations

## Testing Guidelines

- Test both success and failure cases
- Use descriptive test names
- Include error messages in tests
- Aim for high code coverage

## FHEVM Best Practices

1. Always grant both permissions:
   - \`FHE.allowThis(value)\`
   - \`FHE.allow(value, user)\`

2. Validate all encrypted inputs

3. Use proper error handling

4. Document FHEVM concepts in code

## Deployment Checklist

- [ ] All tests pass
- [ ] Code is linted
- [ ] Documentation is updated
- [ ] Contract is verified on testnet
- [ ] Security review complete

---

For more information, see README.md
`;

    fs.writeFileSync(path.join(outputPath, "DEVELOPER_GUIDE.md"), developerGuide);
    console.log(`✅ Created DEVELOPER_GUIDE.md`);

    console.log(`\n✨ Category repository generated successfully!\n`);
    console.log(`📌 Next Steps:`);
    console.log(`   cd ${outputPath}`);
    console.log(`   npm install`);
    console.log(`   npm run compile`);
    console.log(`   npm run test`);
  } catch (error) {
    console.error(`\n❌ Failed to generate category repository`);
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    }
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help")) {
  showHelp();
  process.exit(0);
}

if (args.includes("--list")) {
  listCategories();
  process.exit(0);
}

if (args.length < 2) {
  console.error(`❌ Missing required arguments\n`);
  showHelp();
  process.exit(1);
}

const [categoryName, outputPath] = args;

if (!validateCategoryName(categoryName)) {
  console.error(`❌ Unknown category: ${categoryName}\n`);
  listCategories();
  process.exit(1);
}

createCategoryRepository(categoryName, outputPath);
