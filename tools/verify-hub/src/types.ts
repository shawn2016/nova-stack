export type VerifyConclusion = 'pass' | 'fail' | 'incomplete';
export type VerifyStatus = 'pass' | 'fail' | 'skip';
export type VerifyDisposition = 'executed' | 'skipped' | 'blocked' | 'waived' | 'not-run';
export type AcceptanceStatus = 'pass' | 'fail' | 'skipped' | 'not-run' | 'blocked' | 'waived';

export type VerifyEvidence = {
  kind: 'command' | 'artifact' | 'screenshot' | 'log' | 'manual';
  name?: string;
  path?: string;
  contentType?: string;
  command?: string;
  exitCode?: number;
  capturedAt?: string;
};

export type VerifyError = {
  message?: string;
  stack?: string;
  snippet?: string;
  location?: { file?: string; line?: number; column?: number };
};

export type VerifyCase = {
  id: string;
  tierId?: string;
  module?: string;
  title?: string;
  status: VerifyStatus;
  disposition?: VerifyDisposition;
  page?: string;
  scenario?: string;
  tags?: string[];
  durationMs?: number;
  error?: VerifyError;
  attachments?: Array<{ name?: string; path?: string; contentType?: string }>;
  evidence?: VerifyEvidence[];
  retestCommand?: string;
  suggestedFiles?: string[];
};

export type VerifyTier = {
  id: string;
  title?: string;
  status: VerifyStatus;
  disposition?: VerifyDisposition;
  skipReason?: string;
  durationMs?: number;
  command?: string;
  exitCode?: number;
  evidence?: VerifyEvidence[];
};

export type AcceptanceItem = {
  id: string;
  description: string;
  required: boolean;
  status: AcceptanceStatus;
  linkedCases?: string[];
  evidence?: Array<{
    status: AcceptanceStatus;
    linkedCases?: string[];
    selector?: Record<string, unknown>;
  }>;
  waiver?: { approvedBy?: string; reason?: string; expiresAt?: string };
};

export type VerifyReport = {
  schema: 'nova.verify-report.v1';
  runId: string;
  project: string;
  conclusion?: VerifyConclusion;
  startedAt: string;
  finishedAt: string;
  durationMs?: number;
  git?: { branch?: string; commit?: string; dirty?: boolean };
  provenance?: {
    changeId?: string;
    runRole?: 'builder' | 'verifier';
    parentRunId?: string;
    branch?: string;
    commit?: string;
    dirty?: boolean;
    environment?: Record<string, unknown>;
  };
  summary?: { total?: number; passed?: number; failed?: number; skipped?: number };
  tiers?: VerifyTier[];
  cases?: VerifyCase[];
  acceptance?: {
    contractPath?: string | null;
    items?: AcceptanceItem[];
    summary?: { total?: number; passed?: number; failed?: number; incomplete?: number; waived?: number };
  };
  coverage?: {
    modules?: { tested?: number; total?: number; items?: Array<Record<string, unknown>> };
    gaps?: {
      modulesMissingBrowserSpec?: Array<{ id: string; name: string; adminPages?: unknown[] }>;
      adminPages?: { total?: number; untested?: number };
    };
    [key: string]: unknown;
  };
};

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

/** 兼容旧报告：没有 conclusion 时按失败数推导。 */
export function getReportConclusion(report: VerifyReport): VerifyConclusion {
  return report.conclusion ?? ((report.summary?.failed ?? 0) > 0 ? 'fail' : 'pass');
}

/** 校验 Hub ingest 所需的最小 v1 协议，保留新增字段的向前兼容性。 */
export function validateVerifyReport(value: unknown): string | null {
  if (!value || typeof value !== 'object') return 'report body is required';
  const report = value as Partial<VerifyReport>;
  if (report.schema !== 'nova.verify-report.v1') return 'Invalid schema, expected nova.verify-report.v1';
  if (!report.runId || typeof report.runId !== 'string') return 'runId is required';
  if (!report.project || typeof report.project !== 'string') return 'project is required';
  if (!report.startedAt || !report.finishedAt) return 'startedAt and finishedAt are required';
  if (!report.summary || !Array.isArray(report.tiers) || !Array.isArray(report.cases)) {
    return 'summary, tiers and cases are required';
  }
  if (report.conclusion && !['pass', 'fail', 'incomplete'].includes(report.conclusion)) {
    return 'Invalid conclusion';
  }
  return null;
}
