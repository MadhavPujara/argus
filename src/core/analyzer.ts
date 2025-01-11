import { Rule } from './rule.js';
import { Reporter } from '../reporter/reporter.js';
import { RuleViolation } from './rule.js';

export class Analyzer {
  private rules: Rule[] = [];
  private reporter: Reporter;

  constructor(reporter: Reporter) {
    this.reporter = reporter;
  }

  addRule(rule: Rule): void {
    this.rules.push(rule);
  }

  async analyzeFiles(files: string[]): Promise<boolean> {
    let hasViolations = false;

    for (const file of files) {
      const violations: RuleViolation[] = [];
      for (const rule of this.rules) {
        violations.push(...await rule.analyze(file));
      }
      if (violations.length > 0) {
        hasViolations = true;
        violations.forEach((violation: RuleViolation) => this.reporter.report(violation));
      }
    }

    return !hasViolations;
  }
} 