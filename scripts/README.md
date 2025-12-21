# FHEVM Automation Scripts

This directory contains TypeScript scripts for automating common FHEVM development tasks.

## Available Scripts

### 1. Create FHEVM Example (`create-fhevm-example.ts`)

Generates standalone FHEVM example repositories with complete project structure, configuration, and documentation.

**Usage:**
```bash
npx ts-node scripts/create-fhevm-example.ts <example-name> <output-path>
```

**Examples:**
```bash
# Generate Real Privacy Trading example
npx ts-node scripts/create-fhevm-example.ts real-privacy-trading ./examples/trading

# Generate FHE Counter example
npx ts-node scripts/create-fhevm-example.ts fhe-counter ./examples/counter

# List available examples
npx ts-node scripts/create-fhevm-example.ts --list

# Show help
npx ts-node scripts/create-fhevm-example.ts --help
```

**What it creates:**
- Complete project directory structure
- `package.json` with FHEVM dependencies
- `hardhat.config.ts` configuration
- `.gitignore` file
- Initial `README.md`
- Ready-to-use Hardhat project

**Output Structure:**
```
output-path/
├── contracts/           # Smart contract source files
├── test/               # Test files
├── deploy/             # Deployment scripts
├── scripts/            # Utility scripts
├── package.json        # Project dependencies
├── hardhat.config.ts   # Hardhat configuration
├── README.md           # Project documentation
└── .gitignore          # Git ignore patterns
```

### 2. Generate Documentation (`generate-docs.ts`)

Generates GitBook-compatible documentation from smart contracts and tests.

**Usage:**
```bash
# Generate docs for specific example
npx ts-node scripts/generate-docs.ts <example-name>

# Generate docs for all examples
npx ts-node scripts/generate-docs.ts --all

# Show help
npx ts-node scripts/generate-docs.ts --help
```

**Examples:**
```bash
# Generate docs for Real Privacy Trading
npx ts-node scripts/generate-docs.ts real-privacy-trading

# Generate docs for all examples
npx ts-node scripts/generate-docs.ts --all
```

**What it creates:**
- Markdown documentation files in `examples/` directory
- GitBook-compatible format with chapters
- Code examples and explanations
- Use case documentation
- Error handling guides
- Learning resources

**Output Files:**
```
examples/
├── README.md                    # Documentation index
├── real-privacy-trading.md      # Example documentation
└── ...                          # Other example docs
```

## Adding New Examples

To add a new FHEVM example:

1. **Define the example** in the configuration:
   - Add entry to `EXAMPLES_CONFIG` in `create-fhevm-example.ts`
   - Add entry to `DOCS_CONFIG` in `generate-docs.ts`

2. **Create the example:**
   ```bash
   npx ts-node scripts/create-fhevm-example.ts your-example ./examples/your-example
   cd examples/your-example
   npm install
   ```

3. **Implement the contract** in `contracts/YourExample.sol`

4. **Write comprehensive tests** in `test/YourExample.ts`

5. **Generate documentation:**
   ```bash
   npx ts-node scripts/generate-docs.ts your-example
   ```

6. **Update the main README** with reference to new example

## npm Scripts

The following npm scripts are configured for common tasks:

```bash
# Create example (using npm)
npm run create-example real-privacy-trading ./examples/trading

# Generate documentation (using npm)
npm run generate-docs real-privacy-trading
npm run generate-all-docs

# Show available commands
npm run help:create
npm run help:docs
```

## Example Configuration Format

### create-fhevm-example.ts

```typescript
interface ExampleConfig {
  name: string;                    // Unique identifier
  title: string;                   // Display name
  description: string;             // Short description
  concepts: string[];              // Key FHEVM concepts
  difficulty: "beginner" | "intermediate" | "advanced";
}
```

### generate-docs.ts

```typescript
interface DocumentationConfig {
  name: string;                    // Example identifier
  title: string;                   // Documentation title
  description: string;             // Full description
  contractFile: string;            // Path to main contract
  testFile: string;               // Path to test file
  chapter: string;                // GitBook chapter identifier
}
```

## Best Practices

### When Creating Examples

1. **Follow naming conventions:**
   - Use kebab-case for example names: `my-privacy-example`
   - Use PascalCase for contract names: `MyPrivacyExample`
   - Use camelCase for functions: `myFunction()`

2. **Include comprehensive documentation:**
   - Add JSDoc comments to all public functions
   - Explain FHEVM-specific patterns
   - Document common pitfalls

3. **Write thorough tests:**
   - Test both success and failure cases
   - Use ✅/❌ markers for clarity
   - Include integration tests

4. **Provide learning resources:**
   - Link to FHEVM documentation
   - Explain concepts from first principles
   - Show before/after examples

### When Generating Documentation

1. **Organize by difficulty level:**
   - Beginner: Basic operations and patterns
   - Intermediate: Complex use cases
   - Advanced: Novel patterns and optimizations

2. **Include multiple formats:**
   - Code snippets
   - Text explanations
   - Diagrams (if applicable)
   - External links

3. **Keep documentation updated:**
   - Regenerate when examples change
   - Update with new FHEVM features
   - Fix typos and clarify explanations

## Troubleshooting

### Script fails with "Cannot find module"

**Solution:** Install dependencies first:
```bash
npm install
```

### "Unknown example" error

**Solution:** Check available examples:
```bash
npx ts-node scripts/create-fhevm-example.ts --list
npx ts-node scripts/generate-docs.ts --list  # if implemented
```

### Documentation not generated

**Solution:** Ensure output directory exists:
```bash
mkdir -p examples/
npm run generate-docs real-privacy-trading
```

### TypeScript compilation errors

**Solution:** Clear cache and rebuild:
```bash
npm run clean
npm install
npm run compile
```

## Future Enhancements

Planned additions to automation scripts:

- [ ] Example testing automation
- [ ] Batch example generation
- [ ] Documentation versioning
- [ ] Example difficulty assessment
- [ ] Concept relationship mapping
- [ ] Interactive example creation wizard
- [ ] Automated code style enforcement
- [ ] Example migration tools

## Contributing

To contribute improvements to these scripts:

1. Follow existing code patterns
2. Include error handling
3. Add console logging for user feedback
4. Document new features in this README
5. Test with multiple example types

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [GitBook Format Guide](https://docs.gitbook.com/)

---

**Built for the Zama FHEVM Bounty Program - December 2025**
