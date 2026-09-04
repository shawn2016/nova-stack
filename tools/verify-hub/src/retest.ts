import type { VerifyReport } from './types.js';

export type RetestInput = {
  tier?: string;
  caseId?: string;
  parentRunId?: string;
  changeId?: string;
};

/** 校验复测目标并构造固定 pnpm verify 参数，拒绝任意 shell 命令。 */
export function buildRetestSpec(
  input: RetestInput,
  allowedTiers: string[],
  parentReport?: VerifyReport,
): { tier?: string; args: string[]; command: string } {
  let tier = input.tier?.trim();
  if (input.caseId) {
    const matchedCase = parentReport?.cases?.find((item) => item.id === input.caseId);
    if (!matchedCase?.tierId) throw new Error('caseId 不存在或未关联 tier');
    if (tier && tier !== matchedCase.tierId) throw new Error('caseId 与 tier 不一致');
    tier = matchedCase.tierId;
  }
  if (tier && !allowedTiers.includes(tier)) throw new Error(`不允许的 tier: ${tier}`);

  const args = ['verify'];
  if (tier) args.push('--tier', tier);
  args.push('--role', 'verifier');
  if (input.parentRunId) args.push('--parent-run', input.parentRunId);
  if (input.changeId) args.push('--change', input.changeId);
  return { tier, args, command: `pnpm ${args.join(' ')}` };
}
