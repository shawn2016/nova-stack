import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { buildRetestSpec } from './retest.js';
import { getReportConclusion, validateVerifyReport, type VerifyReport } from './types.js';

const dbPath = join(tmpdir(), `nova-verify-hub-${randomUUID()}.db`);
process.env.VERIFY_HUB_DB_PATH = dbPath;
const { closeDb, getRun, upsertRun } = await import('./db.js');

const baseReport: VerifyReport = {
  schema: 'nova.verify-report.v1',
  runId: 'run-1',
  project: 'nova-stack',
  startedAt: '2026-09-04T00:00:00.000Z',
  finishedAt: '2026-09-04T00:00:01.000Z',
  summary: { total: 1, passed: 1, failed: 0, skipped: 0 },
  tiers: [{ id: 'static', status: 'pass' }],
  cases: [{ id: 'static:suite', tierId: 'static', status: 'pass' }],
};

after(() => {
  closeDb();
  rmSync(dbPath, { force: true });
});

test('旧 v1 报告保持兼容并推导 pass', () => {
  assert.equal(validateVerifyReport(baseReport), null);
  assert.equal(getReportConclusion(baseReport), 'pass');
  upsertRun(baseReport);
  assert.equal(getRun(baseReport.runId)?.status, 'pass');
});

test('新报告的 incomplete 结论写入索引列', () => {
  const report = { ...baseReport, runId: 'run-2', conclusion: 'incomplete' as const };
  upsertRun(report);
  assert.equal(getRun(report.runId)?.status, 'incomplete');
});

test('复测仅接受白名单 tier 并绑定 verifier 上下文', () => {
  const spec = buildRetestSpec(
    { tier: 'static', parentRunId: 'run-1', changeId: 'verify-loop-mvp' },
    ['static', 'api-e2e'],
  );
  assert.deepEqual(spec.args, [
    'verify',
    '--tier',
    'static',
    '--role',
    'verifier',
    '--parent-run',
    'run-1',
    '--change',
    'verify-loop-mvp',
  ]);
  assert.throws(() => buildRetestSpec({ tier: 'rm -rf /' }, ['static']), /不允许的 tier/);
});

test('case 复测从父报告解析 tier', () => {
  const spec = buildRetestSpec(
    { caseId: 'static:suite', parentRunId: 'run-1' },
    ['static'],
    baseReport,
  );
  assert.equal(spec.tier, 'static');
});
