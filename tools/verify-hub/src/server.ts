import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { buildAiFixBundles } from './ai-bundle.js';
import { buildRetestSpec, type RetestInput } from './retest.js';
import { getReportConclusion, validateVerifyReport, type VerifyReport } from './types.js';
import {
  deleteAllRuns,
  deleteRun,
  getCumulativeMatrix,
  getRun,
  getStats,
  keepLatestRuns,
  listRuns,
  upsertRun,
} from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.VERIFY_HUB_PORT ?? 9470);
const TOKEN = process.env.VERIFY_HUB_TOKEN ?? 'dev-local-token';
const PROJECT_ROOT = process.env.VERIFY_PROJECT_ROOT ?? join(__dirname, '..', '..', '..');
const ALLOW_RETEST = process.env.VERIFY_HUB_ALLOW_RETEST !== '0';
const verifyConfig = parseYaml(readFileSync(join(PROJECT_ROOT, '.verify', 'config.yaml'), 'utf8')) as {
  tiers?: Array<{ id: string }>;
};
const ALLOWED_TIERS = (verifyConfig.tiers ?? []).map((tier) => tier.id);

const app = Fastify({ logger: true });

await app.register(fastifyStatic, {
  root: join(__dirname, '..', 'public'),
  prefix: '/',
});

function assertToken(authHeader?: string): boolean {
  if (!authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return token === TOKEN || authHeader === TOKEN;
}

function parseReportSummary(reportJson: string) {
  try {
    const report = JSON.parse(reportJson) as VerifyReport;
    return {
      modulesTested: report.coverage?.modules?.tested ?? 0,
      modulesTotal: report.coverage?.modules?.total ?? 0,
      failedCases: report.summary?.failed ?? 0,
      gapCount: report.coverage?.gaps?.modulesMissingBrowserSpec?.length ?? 0,
      conclusion: getReportConclusion(report),
      changeId: report.provenance?.changeId,
      runRole: report.provenance?.runRole,
      parentRunId: report.provenance?.parentRunId,
      acceptance: report.acceptance?.summary,
    };
  } catch {
    return { modulesTested: 0, modulesTotal: 0, failedCases: 0, gapCount: 0, conclusion: 'fail' as const };
  }
}

app.addHook('onRequest', async (request, reply) => {
  const needsAuth =
    (request.method === 'POST' && request.url === '/api/runs') ||
    (request.method === 'DELETE' && request.url.startsWith('/api/runs')) ||
    (request.method === 'POST' && request.url === '/api/retest');
  if (!needsAuth) return;
  const header = (request.headers['x-verify-token'] as string | undefined) ?? request.headers.authorization;
  if (!assertToken(header)) {
    return reply.code(401).send({ message: 'Unauthorized' });
  }
});

app.get('/api/config', async () => ({
  token: TOKEN,
  allowRetest: ALLOW_RETEST,
  projectRoot: PROJECT_ROOT,
  allowedTiers: ALLOWED_TIERS,
}));

app.post('/api/runs', async (request, reply) => {
  const body = request.body as VerifyReport;
  const validationError = validateVerifyReport(body);
  if (validationError) return reply.code(400).send({ message: validationError });
  upsertRun(body);
  const summary = body.summary;
  return reply.code(201).send({
    id: body.runId,
    status: getReportConclusion(body),
    conclusion: getReportConclusion(body),
    summary,
    url: `http://localhost:${PORT}/?run=${body.runId}`,
  });
});

app.get('/api/runs', async (request) => {
  const limit = Number((request.query as { limit?: string }).limit ?? 30);
  const rows = listRuns(limit);
  return {
    items: rows.map((row) => {
      const extra = parseReportSummary(row.report_json);
      return {
        id: row.id,
        project: row.project,
        status: row.status,
        startedAt: row.started_at,
        durationMs: row.duration_ms,
        summary: {
          total: row.summary_total,
          passed: row.summary_passed,
          failed: row.summary_failed,
          skipped: row.summary_skipped,
        },
        ...extra,
      };
    }),
  };
});

app.get('/api/runs/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const row = getRun(id);
  if (!row) return reply.code(404).send({ message: 'Run not found' });
  const report = JSON.parse(row.report_json) as Record<string, unknown>;
  const aiFixBundles = buildAiFixBundles(report as Parameters<typeof buildAiFixBundles>[0]);
  return { ...report, aiFixBundles };
});

app.delete('/api/runs/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const ok = deleteRun(id);
  if (!ok) return reply.code(404).send({ message: 'Run not found' });
  return { deleted: id };
});

app.delete('/api/runs', async (request) => {
  const body = (request.body ?? {}) as { all?: boolean; keepLatest?: number };
  if (body.all) {
    const count = deleteAllRuns();
    return { deleted: count, mode: 'all' };
  }
  const keep = body.keepLatest ?? 10;
  const count = keepLatestRuns(keep);
  return { deleted: count, mode: 'keepLatest', keep };
});

app.get('/api/stats', async () => getStats());

app.get('/api/coverage/cumulative', async (request) => {
  const limit = Number((request.query as { limit?: string }).limit ?? 50);
  return getCumulativeMatrix(limit);
});

app.post('/api/retest', async (request, reply) => {
  const body = (request.body ?? {}) as RetestInput;
  const parentRow = body.parentRunId ? getRun(body.parentRunId) : undefined;
  const parentReport = parentRow ? (JSON.parse(parentRow.report_json) as VerifyReport) : undefined;
  let spec;
  try {
    spec = buildRetestSpec(body, ALLOWED_TIERS, parentReport);
  } catch (error) {
    return reply.code(400).send({ message: error instanceof Error ? error.message : '复测参数无效' });
  }

  if (!ALLOW_RETEST) {
    return {
      started: false,
      command: spec.command,
      hint: '已复制命令，请在项目根目录终端执行（VERIFY_HUB_ALLOW_RETEST=0）',
    };
  }

  const child = spawn('pnpm', spec.args, {
    cwd: PROJECT_ROOT,
    detached: true,
    stdio: 'ignore',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      VERIFY_PARENT_RUN_ID: body.parentRunId ?? '',
      VERIFY_CHANGE: body.changeId ?? parentReport?.provenance?.changeId ?? '',
      VERIFY_RUN_ROLE: 'verifier',
    },
  });
  child.unref();

  return reply.code(202).send({
    started: true,
    command: spec.command,
    pid: child.pid,
    cwd: PROJECT_ROOT,
    parentRunId: body.parentRunId,
  });
});

await app.listen({ port: PORT, host: '0.0.0.0' });
console.log(`Verify Hub listening on http://localhost:${PORT}`);
