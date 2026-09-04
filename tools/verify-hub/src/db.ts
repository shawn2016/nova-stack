import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
const dbPath = join(dataDir, 'hub.db');

export type RunRow = {
  id: string;
  project: string;
  status: string;
  summary_total: number;
  summary_passed: number;
  summary_failed: number;
  summary_skipped: number;
  started_at: string;
  finished_at: string;
  duration_ms: number;
  report_json: string;
};

let db: Database.Database | null = null;

/** 初始化 SQLite 并建表 */
export function getDb(): Database.Database {
  if (db) return db;
  mkdirSync(dataDir, { recursive: true });
  db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      project TEXT NOT NULL,
      status TEXT NOT NULL,
      summary_total INTEGER NOT NULL DEFAULT 0,
      summary_passed INTEGER NOT NULL DEFAULT 0,
      summary_failed INTEGER NOT NULL DEFAULT 0,
      summary_skipped INTEGER NOT NULL DEFAULT 0,
      started_at TEXT NOT NULL,
      finished_at TEXT NOT NULL,
      duration_ms INTEGER NOT NULL DEFAULT 0,
      report_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_runs_started ON runs(started_at DESC);
  `);
  return db;
}

/** 写入或覆盖一次验证运行 */
export function upsertRun(report: Record<string, unknown>): void {
  const database = getDb();
  const summary = (report.summary ?? {}) as Record<string, number>;
  database
    .prepare(
      `INSERT INTO runs (
        id, project, status, summary_total, summary_passed, summary_failed, summary_skipped,
        started_at, finished_at, duration_ms, report_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        project = excluded.project,
        status = excluded.status,
        summary_total = excluded.summary_total,
        summary_passed = excluded.summary_passed,
        summary_failed = excluded.summary_failed,
        summary_skipped = excluded.summary_skipped,
        started_at = excluded.started_at,
        finished_at = excluded.finished_at,
        duration_ms = excluded.duration_ms,
        report_json = excluded.report_json`,
    )
    .run(
      report.runId,
      report.project,
      summary.failed > 0 ? 'fail' : 'pass',
      summary.total ?? 0,
      summary.passed ?? 0,
      summary.failed ?? 0,
      summary.skipped ?? 0,
      report.startedAt,
      report.finishedAt,
      report.durationMs ?? 0,
      JSON.stringify(report),
    );
}

/** 分页查询运行列表 */
export function listRuns(limit = 20): RunRow[] {
  return getDb()
    .prepare('SELECT * FROM runs ORDER BY started_at DESC LIMIT ?')
    .all(limit) as RunRow[];
}

/** 按 id 查询单次运行 */
export function getRun(id: string): RunRow | undefined {
  return getDb().prepare('SELECT * FROM runs WHERE id = ?').get(id) as RunRow | undefined;
}

/** 删除单次运行 */
export function deleteRun(id: string): boolean {
  const result = getDb().prepare('DELETE FROM runs WHERE id = ?').run(id);
  return result.changes > 0;
}

/** 删除全部运行记录 */
export function deleteAllRuns(): number {
  const result = getDb().prepare('DELETE FROM runs').run();
  return result.changes;
}

/** 仅保留最近 N 条 */
export function keepLatestRuns(keep = 10): number {
  const database = getDb();
  const rows = database
    .prepare('SELECT id FROM runs ORDER BY started_at DESC LIMIT -1 OFFSET ?')
    .all(keep) as Array<{ id: string }>;
  if (!rows.length) return 0;
  const placeholders = rows.map(() => '?').join(',');
  const result = database.prepare(`DELETE FROM runs WHERE id IN (${placeholders})`).run(...rows.map((r) => r.id));
  return result.changes;
}

/** 累计覆盖矩阵：合并最近 N 次 run 的模块状态 */
export function getCumulativeMatrix(limit = 50) {
  const rows = listRuns(limit);
  const moduleMap = new Map<
    string,
    {
      id: string;
      name: string;
      everPassed: boolean;
      everFailed: boolean;
      lastStatus: string;
      runCount: number;
      hasApiSuiteOnDisk?: boolean;
      hasBrowserSpecOnDisk?: boolean;
      missingLayers?: string[];
    }
  >();

  for (const row of [...rows].reverse()) {
    const report = JSON.parse(row.report_json) as {
      coverage?: {
        modules?: { items?: Array<Record<string, unknown>> };
        gaps?: Record<string, unknown>;
      };
    };
    for (const mod of report.coverage?.modules?.items ?? []) {
      const id = mod.id as string;
      const prev = moduleMap.get(id) ?? {
        id,
        name: mod.name as string,
        everPassed: false,
        everFailed: false,
        lastStatus: 'not-run',
        runCount: 0,
      };
      prev.runCount += 1;
      prev.lastStatus = mod.status as string;
      if (mod.status === 'pass') prev.everPassed = true;
      if (mod.status === 'fail') prev.everFailed = true;
      prev.hasApiSuiteOnDisk = mod.hasApiSuiteOnDisk as boolean;
      prev.hasBrowserSpecOnDisk = mod.hasBrowserSpecOnDisk as boolean;
      prev.missingLayers = mod.missingLayers as string[];
      moduleMap.set(id, prev);
    }
  }

  return {
    runSampleSize: rows.length,
    modules: [...moduleMap.values()],
  };
}

/** 汇总统计 */
export function getStats() {
  const database = getDb();
  const total = (database.prepare('SELECT COUNT(*) AS c FROM runs').get() as { c: number }).c;
  const recent = database
    .prepare(
      `SELECT status FROM runs ORDER BY started_at DESC LIMIT 20`,
    )
    .all() as Array<{ status: string }>;
  const passCount = recent.filter((r) => r.status === 'pass').length;
  const passRate = recent.length ? Math.round((passCount / recent.length) * 100) : 0;
  const avgDuration = (
    database.prepare('SELECT AVG(duration_ms) AS avg FROM runs').get() as { avg: number | null }
  ).avg;
  const failedCases = database
    .prepare('SELECT report_json FROM runs ORDER BY started_at DESC LIMIT 50')
    .all()
    .flatMap((row) => {
      const report = JSON.parse((row as { report_json: string }).report_json) as {
        cases?: Array<{ module?: string; status?: string }>;
      };
      return (report.cases ?? []).filter((c) => c.status === 'fail');
    });
  const moduleCounts = failedCases.reduce<Record<string, number>>((acc, c) => {
    const key = c.module || 'unknown';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const topFailedModules = Object.entries(moduleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([module, count]) => ({ module, count }));

  return {
    totalRuns: total,
    recentPassRate: passRate,
    avgDurationMs: Math.round(avgDuration ?? 0),
    topFailedModules,
  };
}
