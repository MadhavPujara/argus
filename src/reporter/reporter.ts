import { RuleViolation } from '../core/rule.js';
import chalk from 'chalk';

export interface Reporter {
  report(violation: RuleViolation): void;
}

export class ConsoleReporter implements Reporter {
  report(violation: RuleViolation): void {
    const location = chalk.gray(`${violation.file}:${violation.line}:${violation.column}`);
    const severity = violation.severity === 'error' 
      ? chalk.red.bold(violation.severity.toUpperCase())
      : chalk.yellow.bold(violation.severity.toUpperCase());
    const message = chalk.white(violation.message);
    const rule = chalk.blue(`[${violation.rule}]`);

    console.log(`${location} ${severity} ${rule}\n  → ${message}`);
  }
} 