import * as ts from 'typescript';
import { Rule, RuleViolation, RuleOptions } from '../core/rule.js';

interface PrometheusLabelsRuleOptions extends RuleOptions {
  queryIdentifier: string;
  enabled?: boolean;
}

export class PrometheusLabelsRule extends Rule {
  private queryIdentifier: string;
  protected severity: 'error' | 'warning' = 'error';
  protected name: string = 'prometheus-labels';

  constructor(options: PrometheusLabelsRuleOptions) {
    super('prometheus-labels', options);
    if (!options.queryIdentifier) {
      throw new Error('queryIdentifier is required in PrometheusLabelsRule options');
    }
    this.queryIdentifier = options.queryIdentifier;
  }

  async analyze(file: string): Promise<RuleViolation[]> {
    const violations: RuleViolation[] = [];
    
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      noEmit: true
    };

    const host = ts.createCompilerHost(compilerOptions);
    const program = ts.createProgram([file], compilerOptions, host);
    const checker = program.getTypeChecker();
    const sourceFile = program.getSourceFile(file);

    if (!sourceFile) {
      throw new Error(`Could not parse file: ${file}`);
    }

    const visit = (node: ts.Node): void => {
      if (ts.isCallExpression(node)) {
        const signature = checker.getResolvedSignature(node);
        if (signature) {
          const configArg = node.arguments[1];
          if (configArg && this.hasQueryConfiguration(configArg.getText())) {
            this.checkQueryCall(node, sourceFile, violations);
          }
        }
      }
      ts.forEachChild(node, visit);
    };

    ts.forEachChild(sourceFile, visit);
    return violations;
  }

  private hasQueryConfiguration(configText: string): boolean {
    return configText.includes('options') && configText.includes('queryIdentifier');
  }

  private checkQueryCall(
    node: ts.CallExpression,
    sourceFile: ts.SourceFile,
    violations: RuleViolation[]
  ): void {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    const location = { file: sourceFile.fileName, line: line + 1, column: character + 1 };

    if (node.arguments.length < 2) {
      violations.push({
        ...location,
        message: 'Query is missing configuration',
        severity: this.severity,
        rule: this.name
      });
      return;
    }

    const configArg = node.arguments[1];
    const configText = configArg.getText();
    const hasQueryId = configText.includes('queryIdentifier');
    const hasPromLabels = configText.includes('prometheusLabels');

    if (hasQueryId && !hasPromLabels) {
      violations.push({
        ...location,
        message: 'Query has queryIdentifier but missing prometheusLabels configuration',
        severity: 'error',
        rule: this.name
      });
      return;
    }

    if (!hasQueryId || !hasPromLabels) {
      return;
    }

    const queryIdMatch = configText.match(/queryIdentifier:\s*['"]([^'"]+)['"]/);
    const promLabelsMatch = configText.match(/prometheusLabels:\s*{\s*query:\s*['"]([^'"]+)['"]/);

    if (!queryIdMatch || !promLabelsMatch) {
      return;
    }

    const queryId = queryIdMatch[1];
    const promLabelsId = promLabelsMatch[1];

    if (queryId !== promLabelsId) {
      violations.push({
        ...location,
        message: `Query identifier (${queryId}) does not match prometheusLabels query (${promLabelsId})`,
        severity: 'warning',
        rule: this.name
      });
    }
  }

  private isQueryIdentifierValid(queryId: string, prometheusLabels: Record<string, string>): boolean {
    return prometheusLabels.query_identifier === queryId;
  }
} 