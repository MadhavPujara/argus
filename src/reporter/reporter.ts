import { RuleViolation } from '../core/rule.js';

export interface Reporter {
  report(violation: RuleViolation): void;
}

export class ConsoleReporter implements Reporter {
  report(violation: RuleViolation): void {
    console.log(`${violation.file}:${violation.line}:${violation.column} - ${violation.severity}: ${violation.message} (${violation.rule})`);
  }
} 