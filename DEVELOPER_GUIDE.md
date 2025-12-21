# Developer Guide - FHEVM Privacy Trading Examples

This guide provides comprehensive instructions for developers who want to add new examples, update dependencies, or maintain this FHEVM example repository.

## 📋 Table of Contents

- [Quick Setup](#quick-setup)
- [Adding New Examples](#adding-new-examples)
- [Creating Categories](#creating-categories)
- [Updating Dependencies](#updating-dependencies)
- [Maintenance Tasks](#maintenance-tasks)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Standards](#documentation-standards)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Setup

### Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd RealPrivacyTrading

# Install dependencies
npm install

# Verify setup
npm run compile
npm run test
```

### Required Tools

- **Node.js**: 20.x or higher
- **npm**: 7.x or higher
- **TypeScript**: 5.x
- **Hardhat**: 2.26.x
- **Git**: For version control

## 📝 Adding New Examples

### Step 1: Create Contract

Create your contract in the appropriate category folder:

```bash
# For basic examples
contracts/basic/YourExample.sol

# For advanced examples
contracts/trading/YourExample.sol
```

**Contract Template:**

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Your Example Contract
/// @notice Brief description
/// @dev Detailed explanation of FHEVM concepts demonstrated
contract YourExample is ZamaEthereumConfig {
    // Your implementation

    /// @notice Function description
    /// @param inputEuint32 Encrypted input
    /// @param inputProof Zero-knowledge proof
    function yourFunction(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        // ✅ CORRECT PATTERN: Decrypt and verify
        euint32 value = FHE.fromExternal(inputEuint32, inputProof);

        // Your logic here

        // ✅ CRITICAL: Grant permissions
        FHE.allowThis(value);
        FHE.allow(value, msg.sender);
    }
}
```

### Step 2: Create Test File

Create comprehensive tests in the corresponding test directory:

```bash
# For basic examples
test/basic/YourExample.ts

# For advanced examples
test/trading/YourExample.ts
```

**Test Template:**

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { YourExample } from "../typechain-types";

describe("YourExample", function () {
  let contract: YourExample;
  let owner: any;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("YourExample");
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });

  describe("✅ Success Cases", function () {
    it("Should execute function correctly", async function () {
      // Test implementation
    });
  });

  describe("❌ Common Pitfalls", function () {
    it("Should fail when missing permissions", async function () {
      // Test failure case
    });
  });
});
```

### Step 3: Update Automation Scripts

Add your example to all three automation scripts:

#### create-fhevm-example.ts

```typescript
const EXAMPLES_CONFIG: Record<string, ExampleConfig> = {
  // ... existing examples
  'your-example': {
    name: 'your-example',
    title: 'Your Example Title',
    description: 'Brief description of your example',
    concepts: ['Concept 1', 'Concept 2'],
    difficulty: 'intermediate',
  },
};
```

#### create-fhevm-category.ts

If creating a new category:

```typescript
const CATEGORIES_CONFIG: Record<string, CategoryConfig> = {
  // ... existing categories
  'your-category': {
    name: 'your-category',
    title: 'Your Category Title',
    description: 'Category description',
    examples: ['your-example-1', 'your-example-2'],
    concepts: ['Concept 1', 'Concept 2'],
    difficulty: 'advanced',
  },
};
```

#### generate-docs.ts

```typescript
const DOCS_CONFIG: Record<string, DocumentationConfig> = {
  // ... existing examples
  'your-example': {
    name: 'your-example',
    title: 'Your Example Title',
    description: 'Detailed description',
    contractFile: 'contracts/category/YourExample.sol',
    testFile: 'test/category/YourExample.ts',
    chapter: 'your-chapter',
  },
};
```

### Step 4: Generate Documentation

```bash
# Generate docs for your example
npm run generate-docs your-example

# Verify documentation
cat examples/your-example.md
```

### Step 5: Test Example Generation

```bash
# Generate standalone repository
npm run create-example your-example ./test-output/your-example

# Test the generated repository
cd test-output/your-example
npm install
npm run compile
npm run test
```

### Step 6: Update Main README

Add your example to the main README.md under the appropriate section.

## 🏗️ Creating Categories

Categories group related examples together. To create a new category:

### 1. Create Directory Structure

```bash
mkdir -p contracts/your-category
mkdir -p test/your-category
```

### 2. Add Multiple Contracts

Create 2-3 related examples in the category:

```
contracts/your-category/
├── Example1.sol
├── Example2.sol
└── Example3.sol
```

### 3. Create Tests

```
test/your-category/
├── Example1.ts
├── Example2.ts
└── Example3.ts
```

### 4. Update Category Script

Add category configuration to `create-fhevm-category.ts`.

### 5. Test Category Generation

```bash
npm run create-category your-category ./test-output/category-test
cd test-output/category-test
npm install && npm run test
```

## 🔄 Updating Dependencies

### When FHEVM Updates

When `@fhevm/solidity` or `@fhevm/hardhat-plugin` releases a new version:

#### Step 1: Update Base Template

```bash
# Update package.json
npm install @fhevm/solidity@latest
npm install --save-dev @fhevm/hardhat-plugin@latest

# Test compilation
npm run compile
```

#### Step 2: Test All Examples

```bash
# Run all tests
npm run test

# Check coverage
npm run coverage
```

#### Step 3: Fix Breaking Changes

If there are breaking changes:

1. Review FHEVM changelog
2. Update affected contracts
3. Update tests
4. Regenerate documentation

```bash
# Regenerate all docs
npm run generate-all-docs
```

#### Step 4: Update Template

Update `fhevm-hardhat-template/package.json` with new versions.

### Dependency Update Checklist

- [ ] Update package.json versions
- [ ] Run `npm install`
- [ ] Run `npm run compile`
- [ ] Run `npm run test`
- [ ] Fix any compilation errors
- [ ] Fix any test failures
- [ ] Update documentation
- [ ] Test example generation
- [ ] Update DEVELOPER_GUIDE.md (this file)
- [ ] Commit changes

## 🧪 Testing Guidelines

### Test Structure

Each test file should include:

1. **Setup**: Contract deployment and initialization
2. **Success Cases**: Test correct usage patterns
3. **Failure Cases**: Test common pitfalls
4. **Edge Cases**: Test boundary conditions
5. **Integration Tests**: Test contract interactions

### Writing Tests

```typescript
describe("ContractName", function () {
  // Setup
  beforeEach(async function () {
    // Deploy and initialize
  });

  describe("✅ Success Cases", function () {
    it("Should [expected behavior]", async function () {
      // Arrange
      // Act
      // Assert
    });
  });

  describe("❌ Common Pitfalls", function () {
    it("Should fail when [condition]", async function () {
      await expect(/* action */).to.be.reverted;
    });
  });

  describe("🔍 Edge Cases", function () {
    it("Should handle [edge case]", async function () {
      // Test boundary conditions
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- test/basic/FHECounter.ts

# Run with gas reporting
REPORT_GAS=true npm run test

# Run with coverage
npm run coverage
```

### Test Quality Checklist

- [ ] Tests pass consistently
- [ ] Both success and failure cases tested
- [ ] Edge cases covered
- [ ] Descriptive test names
- [ ] Comments explain FHEVM patterns
- [ ] No hardcoded addresses or values
- [ ] Proper cleanup in afterEach
- [ ] Coverage above 90%

## 📚 Documentation Standards

### Contract Documentation

Use NatSpec comments:

```solidity
/// @title Contract Title
/// @notice Brief user-facing description
/// @dev Technical details for developers
contract Example {
    /// @notice What the function does
    /// @param paramName Description of parameter
    /// @return Description of return value
    /// @dev Implementation notes and FHEVM patterns
    function example(uint256 paramName) external returns (uint256) {
        // Implementation
    }
}
```

### Test Documentation

Include explanatory comments:

```typescript
describe("Feature", function () {
  it("Should demonstrate correct pattern", async function () {
    // ✅ CORRECT PATTERN: Explain why this is correct
    const encrypted = await encrypt(value);
    await contract.process(encrypted);

    // Verify result
    expect(result).to.equal(expected);
  });

  it("Should fail with common mistake", async function () {
    // ❌ COMMON PITFALL: Explain the mistake
    // Missing FHE.allowThis() causes this to fail
    await expect(contract.badFunction()).to.be.reverted;
  });
});
```

### README Documentation

Each example should have a README covering:

1. **Overview**: What the example demonstrates
2. **Concepts**: FHEVM concepts covered
3. **Quick Start**: Installation and basic usage
4. **Code Walkthrough**: Detailed explanation
5. **Common Pitfalls**: Mistakes to avoid
6. **Resources**: Links to learn more

## 🐛 Troubleshooting

### Common Issues

#### Compilation Errors

```bash
# Clean and rebuild
npm run clean
npm install
npm run compile
```

#### Test Failures

```bash
# Check FHEVM mock setup
# Verify permissions are granted
# Check input proof generation
```

#### Script Errors

```bash
# Verify TypeScript compilation
npm run build:ts

# Check script permissions
chmod +x scripts/*.ts
```

#### Missing Dependencies

```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

1. Check [FHEVM Documentation](https://docs.zama.ai/fhevm)
2. Review [existing examples](./contracts)
3. Search [Zama Discord](https://discord.com/invite/zama)
4. Open GitHub issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Expected vs actual behavior

## 🔧 Maintenance Tasks

### Weekly

- [ ] Run all tests
- [ ] Check for security updates
- [ ] Review open issues

### Monthly

- [ ] Update dependencies
- [ ] Regenerate documentation
- [ ] Review and update examples
- [ ] Check for FHEVM updates

### Quarterly

- [ ] Major dependency updates
- [ ] Add new examples based on community requests
- [ ] Review and improve documentation
- [ ] Performance optimization

## 📦 Release Checklist

Before releasing a new version:

- [ ] All tests pass
- [ ] Documentation is up-to-date
- [ ] Examples generate correctly
- [ ] No prohibited references (, , )
- [ ] README reflects current state
- [ ] DEVELOPER_GUIDE is current
- [ ] Version numbers updated
- [ ] Git tags created
- [ ] Release notes written

## 🤝 Contributing

### Code Standards

1. **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
2. **TypeScript**: Use Prettier and ESLint
3. **Tests**: Maintain high coverage
4. **Documentation**: Keep inline docs current

### Pull Request Process

1. Create feature branch
2. Implement changes
3. Write/update tests
4. Update documentation
5. Run full test suite
6. Submit PR with description

### Review Criteria

- Code quality and style
- Test coverage
- Documentation completeness
- FHEVM pattern correctness
- Security considerations

## 📚 Resources

### Essential Reading

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Solidity Documentation](https://docs.soliditylang.org/)

### Community

- [Zama Discord](https://discord.com/invite/zama)
- [Zama Forum](https://community.zama.ai/)
- [GitHub Discussions](https://github.com/zama-ai/fhevm/discussions)

### Tools

- [Hardhat VSCode Extension](https://hardhat.org/hardhat-vscode)
- [Solidity Extension](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity)
- [Remix IDE](https://remix.ethereum.org/)

---

**Last Updated**: December 2025
**Maintainer**: FHEVM Examples Team
**License**: BSD-3-Clause-Clear
