# Argus

> Named after the all-seeing giant of Greek mythology, Argus is a vigilant TypeScript static analysis tool that keeps watch over your database query patterns.

A static analysis tool for TypeScript codebases that enforces database query monitoring patterns, specifically focusing on Prometheus labels validation. Like its mythological namesake with a hundred eyes, Argus watches over your codebase to ensure proper monitoring practices.

## Features

- Validates database query patterns with the vigilance of Argus
- Enforces Prometheus labels in database queries
- Git hooks integration for pre-commit validation
- Configurable rules and severity levels
- TypeScript AST-based analysis

## Installation

### As a Development Dependency

```bash
# Using pnpm (recommended)
pnpm add -D @irev/argus

# Using npm
npm install --save-dev @irev/argus

# Using yarn
yarn add --dev @irev/argus
```

## Usage

### Configuration

Create an `.argus.json` file in your project root (previously `.code-review.json`):

```json
{
  "rules": {
    "prometheus-labels": {
      "severity": "error",
      "queryIdentifier": "get_users"  // Required: The exact identifier that should be used
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["**/*.test.ts"]
}
```

### Command Line

```bash
# Check specific files
pnpm argus check src/file1.ts src/file2.ts

# Check all TypeScript files (uses include/exclude from config)
pnpm argus check

# Check only staged files
pnpm argus check-staged
```

### Git Hooks Integration

The tool automatically installs git hooks using Husky. Add this to your package.json:

```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "husky": {
    "hooks": {
      "pre-commit": "pnpm argus check-staged"
    }
  }
}
```

### Example Usage

```typescript
// ❌ Bad: Missing prometheusLabels
async function badQuery1() {
  return this.query('SELECT * FROM users');
}

// ❌ Bad: Empty prometheusLabels
async function badQuery2() {
  return this.query('SELECT * FROM users', {
    prometheusLabels: {}
  });
}

// ❌ Bad: Wrong identifier
async function badQuery3() {
  return this.query('SELECT * FROM users', {
    prometheusLabels: {
      query: 'wrong_identifier'
    }
  });
}

// ✅ Good: Correct configuration
async function goodQuery() {
  return this.query('SELECT * FROM users', {
    prometheusLabels: {
      query: 'get_users'  // Matches queryIdentifier in config
    }
  });
}
```

## Development

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/argus.git
cd argus
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the project:
```bash
pnpm build
```

### Development Commands

```bash
# Build the project
pnpm build

# Run tests
pnpm test

# Lint the codebase
pnpm lint

# Try the tool on sample files
pnpm argus check src/example/sample.ts
```

### Project Structure

```
argus/
├── src/
│   ├── core/           # Core analysis engine (Argus's eyes)
│   ├── rules/          # Rule implementations (what Argus watches for)
│   ├── cli/            # CLI interface
│   └── example/        # Example files
├── tests/              # Test files
└── .argus.json        # Tool configuration
```

### Adding New Rules

Each rule acts as one of Argus's eyes, watching for specific patterns in your code.

1. Create a new rule file in `src/rules/`
2. Extend the base `Rule` class
3. Implement the `analyze` method
4. Register the rule in `src/core/analyzer.ts`

Example:
```typescript
export class MyNewRule extends Rule {
  async analyze(file: string): Promise<RuleViolation[]> {
    // Implementation
  }
}
```

### Testing

The project uses Jest for testing. Run tests with:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC 