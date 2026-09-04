/**
 * Verify Contract：将 change 验收项映射到真实 tier/case/scenario 证据。
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';

const STATUS_PRIORITY = ['fail', 'blocked', 'not-run', 'skipped', 'waived', 'pass'];

/** 加载 change 对应的机器可读验证合同 */
export function loadVerificationContract(changeId, rootDir) {
  if (!changeId) return null;
  const path = join(rootDir, '.verify', 'contracts', `${changeId}.yaml`);
  if (!existsSync(path)) return null;
  const contract = parseYaml(readFileSync(path, 'utf8'));
  if (contract?.version !== 1 || !Array.isArray(contract?.items)) {
    throw new Error(`验证合同格式无效: ${path}`);
  }
  return { ...contract, path: path.replace(`${rootDir}/`, '') };
}

function normalizeStatus(item) {
  if (!item) return 'not-run';
  if (item.disposition === 'blocked') return 'blocked';
  if (item.disposition === 'waived') return 'waived';
  if (item.status === 'pass') return 'pass';
  if (item.status === 'fail') return 'fail';
  return item.status === 'skip' || item.disposition === 'skipped' ? 'skipped' : 'not-run';
}

function aggregateStatuses(statuses, mode = 'all') {
  if (!statuses.length) return 'not-run';
  if (mode === 'any' && statuses.includes('pass')) return 'pass';
  if (mode === 'all' && statuses.every((status) => status === 'pass')) return 'pass';
  return STATUS_PRIORITY.find((status) => statuses.includes(status)) ?? 'not-run';
}

function matchEvidence(selector, tiers, cases) {
  if (selector.type === 'tier') {
    const tier = tiers.find((item) => item.id === selector.tierId);
    return {
      status: normalizeStatus(tier),
      linkedCases: cases.filter((item) => item.tierId === selector.tierId).map((item) => item.id),
      selector,
    };
  }

  const matchedCases = cases.filter((item) => {
    if (selector.type === 'case') {
      if (selector.caseId && item.id !== selector.caseId) return false;
      if (selector.tag && !item.tags?.includes(selector.tag)) return false;
      return Boolean(selector.caseId || selector.tag);
    }
    if (selector.type === 'scenario') {
      return item.page === selector.page && item.scenario === selector.scenario;
    }
    return false;
  });

  return {
    status: aggregateStatuses(matchedCases.map(normalizeStatus)),
    linkedCases: matchedCases.map((item) => item.id),
    selector,
  };
}

function activeWaiver(waiver, now) {
  if (!waiver?.approvedBy || !waiver?.reason) return false;
  return !waiver.expiresAt || new Date(waiver.expiresAt).getTime() >= now.getTime();
}

/** 根据本次报告证据计算每条验收项状态 */
export function evaluateAcceptance(contract, tiers, cases, now = new Date()) {
  if (!contract) {
    return {
      contractPath: null,
      items: [],
      summary: { total: 0, passed: 0, failed: 0, incomplete: 0, waived: 0 },
    };
  }

  const items = contract.items.map((item) => {
    const evidence = (item.evidence ?? []).map((selector) => matchEvidence(selector, tiers, cases));
    const waived = activeWaiver(item.waiver, now);
    const status = waived
      ? 'waived'
      : aggregateStatuses(
          evidence.map((entry) => entry.status),
          item.mode ?? 'all',
        );
    return {
      id: item.id,
      description: item.description,
      required: item.required !== false,
      status,
      evidence,
      linkedCases: [...new Set(evidence.flatMap((entry) => entry.linkedCases))],
      waiver: waived ? item.waiver : undefined,
    };
  });

  return {
    contractPath: contract.path,
    items,
    summary: {
      total: items.length,
      passed: items.filter((item) => item.status === 'pass').length,
      failed: items.filter((item) => item.status === 'fail').length,
      incomplete: items.filter((item) => !['pass', 'fail', 'waived'].includes(item.status)).length,
      waived: items.filter((item) => item.status === 'waived').length,
    },
  };
}

/** 由测试结果和 required 验收项推导最终结论 */
export function deriveConclusion({ summary, tiers, acceptance, requiredTierIds = [] }) {
  if ((summary?.failed ?? 0) > 0 || acceptance.items.some((item) => item.required && item.status === 'fail')) {
    return 'fail';
  }

  const requiredTiersComplete = requiredTierIds.every(
    (tierId) => tiers.find((tier) => tier.id === tierId)?.status === 'pass',
  );
  const requiredAcceptanceComplete = acceptance.items.every(
    (item) => !item.required || item.status === 'pass',
  );
  return requiredTiersComplete && requiredAcceptanceComplete ? 'pass' : 'incomplete';
}
