#!/usr/bin/env node

import { Command } from 'commander';
import { execSync } from 'child_process';
import { RuleOptions } from '../core/rule.js';
import { Analyzer } from '../core/analyzer.js';
import { ConsoleReporter } from '../reporter/reporter.js';
import { PrometheusLabelsRule } from '../rules/prometheusLabelsRule.js';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface ArgusConfig {
  rules: {
    'prometheus-labels'?: RuleOptions;
  };
}

const program = new Command();

program
  .name('argus')
  .description('A vigilant TypeScript static analysis tool')
  .version('1.0.0')
  .option('-c, --config <path>', 'path to config file', './argus.config.json')
  .hook('preAction', () => {
    // Hook implementation
  });

function loadConfig(): ArgusConfig {
  const configPath = path.join(process.cwd(), '.argus.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config as ArgusConfig;
  }
  return { rules: { 'prometheus-labels': { enabled: true } } };
}

async function expandGlobs(patterns: string[]): Promise<string[]> {
  const files: string[] = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern);
    files.push(...matches);
  }
  return files;
}

async function runAnalysis(patterns: string[]): Promise<boolean> {
  const files = await expandGlobs(patterns);
  if (files.length === 0) {
    console.log('No files found to analyze');
    return true;
  }

  const config = loadConfig();
  const reporter = new ConsoleReporter();
  const analyzer = new Analyzer(reporter);

  analyzer.addRule(new PrometheusLabelsRule({
    enabled: true,
    queryIdentifier: 'default_query',
    ...config.rules?.['prometheus-labels']
  }));

  return analyzer.analyzeFiles(files);
}

program
  .command('check')
  .description('Run analysis on specified files')
  .argument('[files...]', 'Files to analyze')
  .action(async (files: string[]) => {
    const success = await runAnalysis(files.length ? files : ['src/**/*.ts']);
    process.exit(success ? 0 : 1);
  });

program
  .command('check-staged')
  .description('Run analysis on git staged files')
  .action(async () => {
    const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACMR')
      .toString()
      .split('\n')
      .filter(file => file.endsWith('.ts'));

    if (stagedFiles.length === 0) {
      console.log('No staged TypeScript files to analyze');
      process.exit(0);
    }

    const success = await runAnalysis(stagedFiles);
    process.exit(success ? 0 : 1);
  });

program.parse(); 