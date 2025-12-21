# FHEVM Hardhat Template

A complete Hardhat template for developing FHEVM (Fully Homomorphic Encryption Virtual Machine) smart contracts.

## Features

- ✅ Pre-configured Hardhat setup with FHEVM
- ✅ TypeScript support
- ✅ Testing framework with Chai matchers
- ✅ Deployment scripts with hardhat-deploy
- ✅ Linting and formatting
- ✅ Type generation with TypeChain

## Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to local network
npm run deploy:localhost
```

## Project Structure

```
fhevm-hardhat-template/
├── contracts/       # Solidity contracts
├── test/           # Test files
├── deploy/         # Deployment scripts
├── scripts/        # Utility scripts
├── hardhat.config.ts
├── package.json
└── README.md
```

## Available Commands

```bash
npm run compile          # Compile contracts
npm run test             # Run tests
npm run clean            # Clean build artifacts
npm run deploy:localhost # Deploy to local network
npm run lint            # Run linters
npm run prettier:write  # Format code
```

## FHEVM Concepts

This template is ready for building privacy-preserving smart contracts using:
- Encrypted state variables
- FHE operations (add, sub, mul, etc.)
- Permission management
- Input proofs

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)

## License

BSD-3-Clause-Clear
