type VerifyCase = {
  id: string;
  tierId?: string;
  module?: string;
  title?: string;
  status?: string;
  error?: { message?: string; stack?: string };
  retestCommand?: string;
  suggestedFiles?: string[];
};

type VerifyReport = {
  runId: string;
  project?: string;
  git?: { branch?: string; commit?: string; dirty?: boolean };
  cases?: VerifyCase[];
};

/** 为失败用例生成可复制给 AI 的 Markdown 修复包 */
export function buildAiFixBundle(report: VerifyReport, caseItem: VerifyCase): string {
  const files = (caseItem.suggestedFiles ?? []).map((f) => `- \`${f}\``).join('\n') || '- （见错误栈与模块路径自行定位）';
  return `# Verify 失败修复上下文

## 项目
- 项目：${report.project ?? 'unknown'}
- Run ID：\`${report.runId}\`
- Git：${report.git?.branch ?? '?'} @ \`${(report.git?.commit ?? '').slice(0, 8)}\`${report.git?.dirty ? ' (dirty)' : ''}

## 失败用例
- Tier：\`${caseItem.tierId ?? '?'}\`
- 模块：\`${caseItem.module ?? 'unknown'}\`
- Case ID：\`${caseItem.id}\`
- 标题：${caseItem.title ?? caseItem.id}

## 错误
\`\`\`
${caseItem.error?.message ?? '未知错误'}
${caseItem.error?.stack ?? ''}
\`\`\`

## 建议查看文件
${files}

## 复测命令
\`\`\`bash
${caseItem.retestCommand ?? 'pnpm verify'}
\`\`\`

## 项目规范
请先阅读仓库根目录 \`AGENTS.md\` 与 \`docs/standards/ai-checklist.md\`，修复后执行复测命令确认通过。
`;
}

/** 为报告内所有失败 case 生成 AI 包索引 */
export function buildAiFixBundles(report: VerifyReport): Array<{ caseId: string; markdown: string }> {
  return (report.cases ?? [])
    .filter((c) => c.status === 'fail')
    .map((c) => ({ caseId: c.id, markdown: buildAiFixBundle(report, c) }));
}
