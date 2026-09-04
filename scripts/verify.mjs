#!/usr/bin/env node
/**
 * Verify Runner：按 tier 执行验证、生成 verify-report.v1 并上报 Hub
 */
import { execSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import {
  deriveConclusion,
  evaluateAcceptance,
  loadVerificationContract,
} from './verify-contract.mjs';
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
  let changeId;
  let runRole;
  let parentRunId;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--tier' && argv[i + 1]) {
      tiers.push(argv[i + 1]);
      i += 1;
    } else if (argv[i] === '--change' && argv[i + 1]) {
      changeId = argv[++i];
    } else if (argv[i] === '--role' && argv[i + 1]) {
      runRole = argv[++i];
    } else if (argv[i] === '--parent-run' && argv[i + 1]) {
      parentRunId = argv[++i];
    }
  }
  return { onlyTiers: tiers, changeId, runRole, parentRunId };
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

/** 解析 Comet/vibecoding change；显式参数和环境变量优先 */
function resolveChangeId(explicitChangeId, git) {
  if (explicitChangeId || process.env.VERIFY_CHANGE) {
    return explicitChangeId ?? process.env.VERIFY_CHANGE;
  }
  const selectionPath = join(rootDir, '.comet', 'current-change.json');
  if (existsSync(selectionPath)) {
    try {
      const selection = JSON.parse(readFileSync(selectionPath, 'utf8'));
      if (!selection.branch || selection.branch === git.branch) return selection.change;
    } catch {
      // 非 Comet 或选择文件无效时，继续使用分支推断。
    }
  }
  return git.branch.startsWith('comet/') ? git.branch.slice('comet/'.length) : undefined;
}

function runCommand(command, cwd = rootDir) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(command, {
      cwd,
      shell: true,
      env: process.env,
    });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', (error) => {
      resolve({
        status: 'fail',
        disposition: 'blocked',
        durationMs: Date.now() - started,
        output: error.message,
        exitCode: 1,
      });
    });
    child.on('close', (code) => {
      const durationMs = Date.now() - started;
      const output = `${stdout}${stderr}`.trim();
      resolve({
        status: code === 0 ? 'pass' : 'fail',
        disposition: 'executed',
        durationMs,
        output,
        exitCode: code ?? 1,
      });
    });
  });
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

function buildTierPhases(tiers) {
  if (tiers.length <= 1) return [tiers];
  const byId = new Map(tiers.map((tier) => [tier.id, tier]));
  const phases = [];
  if (byId.has('static')) phases.push([byId.get('static')]);
  const parallelSlow = ['api-e2e', 'browser-smoke'].flatMap((id) => (byId.has(id) ? [byId.get(id)] : []));
  if (parallelSlow.length) phases.push(parallelSlow);
  const scheduled = new Set(phases.flat().map((tier) => tier.id));
  const rest = tiers.filter((tier) => !scheduled.has(tier.id));
  if (rest.length) phases.push(rest);
  return phases.length ? phases : [tiers];
}

function formatDuration(durationMs) {
  return durationMs >= 1000 ? `${(durationMs / 1000).toFixed(1)}s` : `${durationMs}ms`;
}

async function executeTier(tier) {
  if (tier.skipEnv && process.env[tier.skipEnv] === '1') {
    return {
      executed: false,
      tierReport: {
        id: tier.id,
        title: tier.title,
        status: 'skip',
        disposition: 'skipped',
        skipReason: tier.skipEnv,
        durationMs: 0,
        command: tier.command,
      },
      cases: [
        {
          id: `${tier.id}:skipped`,
          tierId: tier.id,
          module: tier.id,
          title: `${tier.title ?? tier.id}（已跳过）`,
          status: 'skip',
          disposition: 'skipped',
          skipReason: tier.skipEnv,
          durationMs: 0,
          retestCommand: `pnpm verify --tier ${tier.id}`,
        },
      ],
    };
  }

  console.log(`\n▶ Tier [${tier.id}] ${tier.title ?? ''}`);
  const result = await runCommand(tier.command);
  console.log(`${result.status === 'pass' ? '  ✓ pass' : '  ✗ fail'} (${formatDuration(result.durationMs)})`);
  return {
    executed: true,
    tierReport: {
      id: tier.id,
      title: tier.title,
      status: result.status,
      disposition: result.disposition,
      durationMs: result.durationMs,
      command: tier.command,
      exitCode: result.exitCode,
      evidence: [{ kind: 'command', command: tier.command, exitCode: result.exitCode }],
    },
    cases: collectTierCases(tier, result),
  };
}

async function runTierPhases(tiers) {
  const reportTiers = [];
  const cases = [];
  const executedTierIds = [];
  const phases = buildTierPhases(tiers);

  for (const phase of phases) {
    const results =
      phase.length === 1
        ? [await executeTier(phase[0])]
        : await Promise.all(phase.map((tier) => executeTier(tier)));

    for (const result of results) {
      reportTiers.push(result.tierReport);
      cases.push(...result.cases);
      if (result.executed) executedTierIds.push(result.tierReport.id);
    }
  }

  return { reportTiers, cases, executedTierIds };
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
        title: 'Runner/Hub 检查与 shared-types 测试构建',
        status: result.status,
        disposition: result.disposition,
        durationMs: result.durationMs,
        retestCommand: 'pnpm verify --tier static',
        evidence: [
          {
            kind: 'command',
            command: tier.command,
            exitCode: result.exitCode,
          },
        ],
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
      disposition: result.disposition,
      durationMs: result.durationMs,
      evidence: [{ kind: 'command', command: tier.command, exitCode: result.exitCode }],
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
  const args = parseArgs(process.argv.slice(2));
  const { onlyTiers } = args;
  const runId = randomUUID();
  const startedAt = new Date().toISOString();
  const tiers = config.tiers.filter((tier) => !onlyTiers.length || onlyTiers.includes(tier.id));
  const git = getGitInfo();
  const changeId = resolveChangeId(args.changeId, git);
  const contract = loadVerificationContract(changeId, rootDir);

  const runStarted = Date.now();
  const { reportTiers, cases, executedTierIds } = await runTierPhases(tiers);

  const coverage = buildCoverage(inventory, cases, apiCatalog, executedTierIds);
  const acceptance = evaluateAcceptance(contract, reportTiers, cases);
  const summary = summarizeCases(cases);
  const requiredTierIds = config.tiers.filter((tier) => tier.required !== false).map((tier) => tier.id);
  const conclusion = deriveConclusion({ summary, tiers: reportTiers, acceptance, requiredTierIds });
  const finishedAt = new Date().toISOString();
  const durationMs = Date.now() - runStarted;
  const report = {
    schema: 'nova.verify-report.v1',
    runId,
    project: config.project,
    startedAt,
    finishedAt,
    durationMs,
    git,
    provenance: {
      changeId,
      runRole: args.runRole ?? process.env.VERIFY_RUN_ROLE ?? 'builder',
      parentRunId: args.parentRunId ?? process.env.VERIFY_PARENT_RUN_ID,
      branch: git.branch,
      commit: git.commit,
      dirty: git.dirty,
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        packageManager: process.env.npm_config_user_agent,
      },
    },
    tiers: reportTiers,
    cases,
    summary,
    acceptance,
    conclusion,
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
  console.log(`Conclusion: ${report.conclusion}${changeId ? ` · change ${changeId}` : ''}`);
  const isFullRun = onlyTiers.length === 0;
  process.exit(report.conclusion === 'fail' ? 1 : isFullRun && report.conclusion === 'incomplete' ? 2 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
