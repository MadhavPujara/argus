import { RuleViolation } from '../core/rule';

export interface Reporter {
  report(violation: RuleViolation): void;
  reportError(file: string, error: Error): void;
}

export class ConsoleReporter implements Reporter {
  report(violation: RuleViolation): void {
    const { file, line, column, severity, message, rule } = violation;
    console.log(`${file}:${line}:${column} - ${severity}: ${message} (${rule})`);
  }

  reportError(file: string, error: Error): void {
    console.error(`Error processing ${file}:`, error.message);
  }
} 