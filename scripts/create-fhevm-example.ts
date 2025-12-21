/**
 * FHEVM Example Repository Generator
 *
 * This script generates standalone FHEVM example repositories from templates.
 * It can be used to scaffold new example projects with proper structure and configuration.
 *
 * Usage:
 *   npx ts-node scripts/create-fhevm-example.ts <example-name> <output-path>
 *
 * Example:
 *   npx ts-node scripts/create-fhevm-example.ts real-privacy-trading ./examples/my-trading-app
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface ExampleConfig {
  name: string;
  title: string;
  description: string;
  concepts: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

const EXAMPLES_CONFIG: Record<string, ExampleConfig> = {
  "fhe-counter": {
    name: "fhe-counter",
    title: "FHE Counter",
    description: "Simple encrypted counter demonstrating basic FHE operations",
    concepts: ["Encrypted state", "FHE.add", "FHE.sub", "Permission management"],
    difficulty: "beginner",
  },
  "encrypt-single-value": {
    name: "encrypt-single-value",
    title: "Encrypt Single Value",
    description: "Demonstrates FHE encryption mechanism and common pitfalls",
    concepts: ["Input proofs", "Encryption", "Permission system", "Common mistakes"],
    difficulty: "beginner",
  },
  "encrypt-multiple-values": {
    name: "encrypt-multiple-values",
    title: "Encrypt Multiple Values",
    description: "Shows how to encrypt and handle multiple values in a single transaction",
    concepts: ["Batch encryption", "Multiple values", "Permission management"],
    difficulty: "beginner",
  },
  "user-decrypt-single-value": {
    name: "user-decrypt-single-value",
    title: "User Decrypt Single Value",
    description: "Demonstrates user decryption and permission requirements",
    concepts: ["User decryption", "View functions", "Access control", "Permissions"],
    difficulty: "beginner",
  },
  "user-decrypt-multiple-values": {
    name: "user-decrypt-multiple-values",
    title: "User Decrypt Multiple Values",
    description: "Shows how to decrypt multiple encrypted values for a user",
    concepts: ["Batch decryption", "Multiple values", "Access control", "Selective access"],
    difficulty: "intermediate",
  },
  "fhe-arithmetic": {
    name: "fhe-arithmetic",
    title: "FHE Arithmetic Operations",
    description: "Demonstrates arithmetic operations on encrypted values",
    concepts: ["FHE.add", "FHE.sub", "FHE.mul", "Chaining operations"],
    difficulty: "intermediate",
  },
  "access-control": {
    name: "access-control",
    title: "Access Control with FHE",
    description: "Demonstrates access control patterns with encrypted values",
    concepts: ["FHE.allow", "FHE.allowThis", "FHE.allowTransient", "Role-based access"],
    difficulty: "intermediate",
  },
  "real-privacy-trading": {
    name: "real-privacy-trading",
    title: "Real Privacy Trading",
    description: "Privacy-preserving decentralized trading platform demonstrating FHEVM concepts",
    concepts: [
      "Encrypted state variables",
      "Private computation",
      "Access control patterns",
      "Confidential transactions",
    ],
    difficulty: "advanced",
  },
};

function showHelp(): void {
  console.log(`
FHEVM Example Repository Generator
====================================

Usage:
  npx ts-node scripts/create-fhevm-example.ts <example-name> <output-path>

Arguments:
  <example-name>   Name of the example to generate
  <output-path>    Output directory path

Examples:
  npx ts-node scripts/create-fhevm-example.ts real-privacy-trading ./examples/trading
  npx ts-node scripts/create-fhevm-example.ts fhe-counter ./examples/counter

Available Examples:
${Object.entries(EXAMPLES_CONFIG)
  .map(
    ([key, config]) => `
  • ${key}
    Title: ${config.title}
    Description: ${config.description}
    Difficulty: ${config.difficulty}
    Concepts: ${config.concepts.join(", ")}
  `
  )
  .join("")}

Options:
  --help           Show this help message
  --list           List all available examples

For more information, see README.md
  `);
}

function listExamples(): void {
  console.log("\nAvailable FHEVM Examples:\n");
  Object.entries(EXAMPLES_CONFIG).forEach(([key, config]) => {
    console.log(`  ${key}`);
    console.log(`    Title: ${config.title}`);
    console.log(`    Description: ${config.description}`);
    console.log(`    Difficulty: ${config.difficulty}`);
    console.log(`    Concepts: ${config.concepts.join(", ")}`);
    console.log("");
  });
}

function validateExampleName(name: string): boolean {
  return name in EXAMPLES_CONFIG;
}

function createExampleRepository(exampleName: string, outputPath: string): void {
  const config = EXAMPLES_CONFIG[exampleName];

  if (!config) {
    console.error(`❌ Unknown example: ${exampleName}`);
    console.error(`Run with --list to see available examples\n`);
    process.exit(1);
  }

  console.log(`\n📋 Generating ${config.title} Example Repository`);
  console.log(`📍 Output: ${outputPath}`);
  console.log(`🎯 Concepts: ${config.concepts.join(", ")}\n`);

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
      name: exampleName,
      version: "1.0.0",
      description: config.description,
      license: "BSD-3-Clause-Clear",
      scripts: {
        compile: "hardhat compile",
        test: "hardhat test",
        deploy: "hardhat deploy",
      },
      dependencies: {
        "encrypted-types": "^0.0.4",
        "@fhevm/solidity": "^0.9.1",
      },
      devDependencies: {
        "@fhevm/hardhat-plugin": "^0.3.0-1",
        hardhat: "^2.26.0",
        typescript: "^5.8.3",
      },
    };

    fs.writeFileSync(path.join(outputPath, "package.json"), JSON.stringify(packageJson, null, 2));
    console.log(`✅ Created package.json`);

    // Create README
    const readme = `# ${config.title}

${config.description}

## FHEVM Concepts Demonstrated

${config.concepts.map((concept) => `- **${concept}**`).join("\n")}

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy
npm run deploy
\`\`\`

## Difficulty Level

${config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1)}

## Learn More

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org)
- [Solidity Documentation](https://docs.soliditylang.org/)

---

Generated by FHEVM Examples Generator
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
`;

    fs.writeFileSync(path.join(outputPath, ".gitignore"), gitignore);
    console.log(`✅ Created .gitignore`);

    // Create hardhat.config.ts
    const hardhatConfig = `import { HardhatUserConfig } from "hardhat/config";
import "@fhevm/hardhat-plugin";

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
  },
};

export default config;
`;

    fs.writeFileSync(path.join(outputPath, "hardhat.config.ts"), hardhatConfig);
    console.log(`✅ Created hardhat.config.ts`);

    console.log(`\n✨ Example repository generated successfully!\n`);
    console.log(`📌 Next Steps:`);
    console.log(`   cd ${outputPath}`);
    console.log(`   npm install`);
    console.log(`   npm run compile`);
    console.log(`   npm run test`);
  } catch (error) {
    console.error(`\n❌ Failed to generate example repository`);
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
  listExamples();
  process.exit(0);
}

if (args.length < 2) {
  console.error(`❌ Missing required arguments\n`);
  showHelp();
  process.exit(1);
}

const [exampleName, outputPath] = args;

if (!validateExampleName(exampleName)) {
  console.error(`❌ Unknown example: ${exampleName}\n`);
  listExamples();
  process.exit(1);
}

createExampleRepository(exampleName, outputPath);
