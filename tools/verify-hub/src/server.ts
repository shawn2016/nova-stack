import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAiFixBundles } from './ai-bundle.js';
import { getRun, getStats, listRuns, upsertRun } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.VERIFY_HUB_PORT ?? 9470);
const TOKEN = process.env.VERIFY_HUB_TOKEN ?? 'dev-local-token';

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

app.addHook('onRequest', async (request, reply) => {
  if (request.method !== 'POST' || request.url !== '/api/runs') return;
  const header = (request.headers['x-verify-token'] as string | undefined) ?? request.headers.authorization;
  if (!assertToken(header)) {
    return reply.code(401).send({ message: 'Unauthorized' });
  }
});

app.post('/api/runs', async (request, reply) => {
  const body = request.body as Record<string, unknown>;
  if (body?.schema !== 'nova.verify-report.v1') {
    return reply.code(400).send({ message: 'Invalid schema, expected nova.verify-report.v1' });
  }
  if (!body.runId || typeof body.runId !== 'string') {
    return reply.code(400).send({ message: 'runId is required' });
  }
  upsertRun(body);
  const summary = body.summary as Record<string, number> | undefined;
  return reply.code(201).send({
    id: body.runId,
    status: (summary?.failed ?? 0) > 0 ? 'fail' : 'pass',
    summary,
    url: `http://localhost:${PORT}/?run=${body.runId}`,
  });
});

app.get('/api/runs', async (request) => {
  const limit = Number((request.query as { limit?: string }).limit ?? 20);
  const rows = listRuns(limit);
  return {
    items: rows.map((row) => ({
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
    })),
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

app.get('/api/stats', async () => getStats());

await app.listen({ port: PORT, host: '0.0.0.0' });
console.log(`Verify Hub listening on http://localhost:${PORT}`);
