export type Severity = 'error' | 'warning' | 'info' | 'hint';

export interface RuleViolation {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: Severity;
  rule: string;
}

export interface RuleOptions {
  severity?: Severity;
  [key: string]: unknown;
}

export abstract class Rule {
  protected name: string;
  protected severity: Severity;
  protected options: RuleOptions;

  constructor(name: string, options: RuleOptions = {}) {
    this.name = name;
    this.severity = options.severity || 'error';
    this.options = options;
  }

  abstract analyze(file: string): Promise<RuleViolation[]>;
} 