#!/usr/bin/env node
/**
 * 扫描 Admin 页面 Vue 源码，输出页面能力清单（写 E2E 前给 AI / 人对照）
 *
 * 用法：
 *   pnpm verify:scan-pages
 *   pnpm verify:scan-pages --path /system/user
 *   pnpm verify:scan-pages --json
 */
import { loadInventory, loadScenarioCatalog, scanPageCapabilitiesFromVue, adminPathToViewFile } from './verify-inventory.mjs';

const args = process.argv.slice(2);
const pathArg = args.includes('--path') ? args[args.indexOf('--path') + 1] : null;
const asJson = args.includes('--json');

const inventory = loadInventory();
const catalog = loadScenarioCatalog();
const scenarioDefs = catalog.scenarios ?? {};

const pages = [];
for (const mod of inventory.modules ?? []) {
  for (const page of mod.adminPages ?? []) {
    if (pathArg && page.path !== pathArg) continue;
    const capabilityIds = page.capabilities ?? page.expectedScenarios ?? scanPageCapabilitiesFromVue(page.path);
    pages.push({
      path: page.path,
      name: page.name,
      moduleId: mod.id,
      viewFile: adminPathToViewFile(page.path),
      capabilities: capabilityIds.map((id) => ({
        id,
        name: scenarioDefs[id]?.name ?? id,
        description: scenarioDefs[id]?.description ?? '',
      })),
    });
  }
}

if (asJson) {
  console.log(JSON.stringify({ pages }, null, 2));
  process.exit(0);
}

if (!pages.length) {
  console.log(pathArg ? `未找到页面：${pathArg}` : 'inventory 中无 adminPages');
  process.exit(1);
}

console.log('# Admin 页面能力扫描\n');
console.log('写 Browser E2E 时请为每个场景添加 tag：`@page:<path>` `@scenario:<id>`\n');

for (const p of pages) {
  console.log(`## ${p.name} (\`${p.path}\`)`);
  console.log(`- 模块：${p.moduleId}`);
  console.log(`- 源码：\`${p.viewFile.replace(/.*nova‑stack\//, '')}\``);
  console.log('- 期望覆盖场景：');
  for (const c of p.capabilities) {
    console.log(`  - \`${c.id}\` ${c.name}${c.description ? ` — ${c.description}` : ''}`);
  }
  console.log('');
}

console.log('详见 docs/standards/e2e-scenarios.md');
