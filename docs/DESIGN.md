# Code Review Tool Design Notes

## Core Purpose
Static analysis tool focusing on TypeScript codebase validation with emphasis on database query monitoring patterns.

## Architecture

### 1. Core Components
- **Analyzer Engine**: Main orchestrator for running analysis
- **Rule Engine**: Processes and executes rules
- **File Parser**: TypeScript AST parsing and traversal
- **Reporter**: VSCode-compatible terminal output

### 2. Rule System
#### Base Implementation
- Abstract rule class with common functionality
- Rule registry for dynamic rule loading
- Severity levels: error, warning, info, hint

#### Initial Rule: PrometheusLabelsRule
Validates database query patterns:
```typescript
{
  options: {
    queryIdentifier: string;      // Required
    prometheusLabels: {          // Required
      query: string;             // Must match queryIdentifier
    }
  }
}
```

Validation Requirements:
- Must have prometheusLabels object
- prometheusLabels cannot be empty
- prometheusLabels.query must match queryIdentifier exactly
- Applies to all iRevBase method calls

### 3. Configuration
Format (JSON):
```json
{
  "rules": {
    "prometheus-labels": {
      "severity": "error"
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["**/*.test.ts"]
}
```

### 4. CLI Interface
Commands:
- `check`: Run analysis on specified files
- `check-staged`: Run analysis on git staged files only

Output Format:
```
file:///path/to/file.ts:10:5 - error: Missing prometheusLabels in database query
```

### 5. Git Integration
- Husky for git hooks
- Pre-commit hook configuration
- Staged files analysis support

### 6. Future Extensibility Points
- AI Provider Integration (Claude/OpenAI)
- VSCode Extension
- Additional Rule Types
- Custom Reporter Formats
- Rule Auto-fixing Capability

## Technical Stack
- TypeScript
- Node.js
- pnpm
- TypeScript Compiler API (for AST)
- Jest (testing)
- Husky (git hooks)
- Commander.js (CLI)

## Development Phases
1. Core Framework Setup
2. PrometheusLabels Rule Implementation
3. CLI & Reporter
4. Git Integration
5. Testing Framework
6. Documentation

## Testing Strategy
- Unit tests for individual components
- Integration tests for rule execution
- Snapshot tests for AST parsing
- E2E tests for CLI functionality 