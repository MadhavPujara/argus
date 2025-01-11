import { Rule } from './rule';
import { Reporter } from '../reporter/reporter';

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
    let hasErrors = false;

    for (const file of files) {
      try {
        for (const rule of this.rules) {
          const violations = await rule.analyze(file);
          if (violations.length > 0) {
            hasErrors = true;
            violations.forEach(violation => this.reporter.report(violation));
          }
        }
      } catch (error) {
        this.reporter.reportError(file, error as Error);
        hasErrors = true;
      }
    }

    return !hasErrors;
  }
} 