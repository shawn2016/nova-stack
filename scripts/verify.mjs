#!/usr/bin/env node
/**
 * Verify Runner：按 tier 执行验证、生成 verify-report.v1 并上报 Hub
 */
import { execSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import {
  buildCoverage,
  loadInventory,
  parseJestE2eReport,
  parsePlaywrightReport,
  scanApiEndpoints,
} from './verify-inventory.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const configPath = join(rootDir, '.verify', 'config.yaml');
const jestReportPath = join(rootDir, '.verify', 'jest-e2e-report.json');
const playwrightReportPath = join(rootDir, '.verify', 'playwright-report.json');

function loadConfig() {
  return parseYaml(readFileSync(configPath, 'utf8'));
}

function parseArgs(argv) {
  const tiers = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--tier' && argv[i + 1]) {
      tiers.push(argv[i + 1]);
      i += 1;
    }
  }
  return { onlyTiers: tiers };
}

function getGitInfo() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
    const commit = execSync('git rev-parse HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
    const dirty = execSync('git status --porcelain', { cwd: rootDir, encoding: 'utf8' }).trim().length > 0;
    return { branch, commit, dirty };
  } catch {
    return { branch: 'unknown', commit: 'unknown', dirty: false };
  }
}

function runCommand(command, cwd = rootDir) {
  const started = Date.now();
  const result = spawnSync(command, {
    cwd,
    shell: true,
    encoding: 'utf8',
    env: process.env,
  });
  const durationMs = Date.now() - started;
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  const status = result.status === 0 ? 'pass' : 'fail';
  return { status, durationMs, output, exitCode: result.status ?? 1 };
}

function summarizeCases(cases) {
  return cases.reduce(
    (acc, c) => {
      acc.total += 1;
      if (c.status === 'pass') acc.passed += 1;
      else if (c.status === 'fail') acc.failed += 1;
      else acc.skipped += 1;
      return acc;
    },
    { total: 0, passed: 0, failed: 0, skipped: 0 },
  );
}

async function uploadReport(config, report) {
  const url = `${config.hub.url.replace(/\/$/, '')}/api/runs`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Verify-Token': config.hub.token,
    },
    body: JSON.stringify(report),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Hub upload failed (${response.status}): ${text}`);
  }
  return response.json();
}

function collectTierCases(tier, result) {
  if (tier.id === 'api-e2e') {
    const parsed = parseJestE2eReport(jestReportPath);
    if (parsed.cases.length) return parsed.cases;
  }
  if (tier.id === 'browser-smoke') {
    const parsed = parsePlaywrightReport(playwrightReportPath);
    if (parsed.cases.length) return parsed.cases;
  }
  if (tier.id === 'static') {
    return [
      {
        id: 'static:suite',
        tierId: 'static',
        module: 'static',
        title: 'shared-types 测试与构建',
        status: result.status,
        durationMs: result.durationMs,
        retestCommand: 'pnpm verify --tier static',
        error:
          result.status === 'fail'
            ? { message: result.output.slice(-2000) || `exit ${result.exitCode}` }
            : undefined,
      },
    ];
  }

  return [
    {
      id: `${tier.id}:suite`,
      tierId: tier.id,
      module: tier.id,
      title: tier.title ?? tier.id,
      status: result.status,
      durationMs: result.durationMs,
      error:
        result.status === 'fail'
          ? { message: result.output.slice(-4000) || `Command exited with ${result.exitCode}` }
          : undefined,
      retestCommand: `pnpm verify --tier ${tier.id}`,
    },
  ];
}

async function main() {
  const config = loadConfig();
  const inventory = loadInventory();
  const apiCatalog = scanApiEndpoints();
  const { onlyTiers } = parseArgs(process.argv.slice(2));
  const runId = randomUUID();
  const startedAt = new Date().toISOString();
  const tiers = config.tiers.filter((tier) => !onlyTiers.length || onlyTiers.includes(tier.id));

  const reportTiers = [];
  const cases = [];
  const executedTierIds = [];

  for (const tier of tiers) {
    if (tier.skipEnv && process.env[tier.skipEnv] === '1') {
      reportTiers.push({
        id: tier.id,
        title: tier.title,
        status: 'skip',
        durationMs: 0,
        command: tier.command,
      });
      cases.push({
        id: `${tier.id}:skipped`,
        tierId: tier.id,
        module: tier.id,
        title: `${tier.title ?? tier.id}（已跳过）`,
        status: 'skip',
        durationMs: 0,
        retestCommand: `pnpm verify --tier ${tier.id}`,
      });
      continue;
    }

    console.log(`\n▶ Tier [${tier.id}] ${tier.title ?? ''}`);
    const result = runCommand(tier.command);
    executedTierIds.push(tier.id);
    reportTiers.push({
      id: tier.id,
      title: tier.title,
      status: result.status,
      durationMs: result.durationMs,
      command: tier.command,
    });

    cases.push(...collectTierCases(tier, result));
    console.log(result.status === 'pass' ? '  ✓ pass' : '  ✗ fail');
  }

  const coverage = buildCoverage(inventory, cases, apiCatalog, executedTierIds);
  const finishedAt = new Date().toISOString();
  const durationMs = reportTiers.reduce((sum, t) => sum + (t.durationMs ?? 0), 0);
  const report = {
    schema: 'nova.verify-report.v1',
    runId,
    project: config.project,
    startedAt,
    finishedAt,
    durationMs,
    git: getGitInfo(),
    tiers: reportTiers,
    cases,
    summary: summarizeCases(cases),
    coverage,
  };

  const reportsDir = join(rootDir, '.verify', 'reports');
  mkdirSync(reportsDir, { recursive: true });
  const localPath = join(reportsDir, `${runId}.json`);
  writeFileSync(localPath, JSON.stringify(report, null, 2));
  console.log(`\n本地报告: ${localPath}`);
  console.log(
    `覆盖: 模块 ${coverage.modules.tested}/${coverage.modules.total} · API 用例 ${coverage.apis.testCases} 条 · 场景 ${coverage.scenarios?.summary?.totalTested ?? 0}/${coverage.scenarios?.summary?.totalExpected ?? 0}（${coverage.scenarios?.summary?.coveragePct ?? 0}%）`,
  );

  try {
    const uploaded = await uploadReport(config, report);
    console.log(`Hub 报告: ${uploaded.url ?? config.hub.url}`);
  } catch (error) {
    console.error(`\n⚠ Hub 上报失败: ${error instanceof Error ? error.message : error}`);
    console.error('请确认 Hub 已启动: pnpm verify:hub');
  }

  console.log(
    `\nSummary: ${report.summary.passed}/${report.summary.total} passed, ${report.summary.failed} failed, ${report.summary.skipped} skipped`,
  );
  process.exit(report.summary.failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
