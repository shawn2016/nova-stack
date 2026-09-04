/**
 * 解析测试清单、Jest/Playwright 报告，生成模块与 API 覆盖数据
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

/** 加载模块清单 */
export function loadInventory() {
  const raw = readFileSync(join(rootDir, '.verify', 'inventory.yaml'), 'utf8');
  return parseYaml(raw);
}

/** 扫描 server e2e 中声明的 API 路由 */
export function scanApiEndpoints() {
  const testRoot = join(rootDir, 'server', 'test');
  const endpoints = new Map();

  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.endsWith('.e2e-spec.ts')) continue;
      const rel = full.replace(`${testRoot}/`, '').replace(/\.e2e-spec\.ts$/, '');
      const moduleId = rel.split('/')[0];
      const content = readFileSync(full, 'utf8');
      const re = /\.(get|post|put|patch|delete)\(\s*[`'"](\/api[^`'"]+)[`'"]/gi;
      let match;
      while ((match = re.exec(content)) !== null) {
        const method = match[1].toUpperCase();
        const path = match[2].replace(/\$\{[^}]+\}/g, ':id');
        const key = `${method} ${path}`;
        if (!endpoints.has(key)) {
          endpoints.set(key, { method, path, module: moduleId, testFiles: new Set() });
        }
        endpoints.get(key).testFiles.add(rel);
      }
    }
  }

  walk(testRoot);
  return [...endpoints.values()].map((item) => ({
    method: item.method,
    path: item.path,
    module: item.module,
    testFiles: [...item.testFiles],
  }));
}

/** 解析 Jest e2e JSON 报告为 case 列表 */
export function parseJestE2eReport(reportPath) {
  if (!existsSync(reportPath)) return { cases: [], suiteCount: 0, testCount: 0 };
  const data = JSON.parse(readFileSync(reportPath, 'utf8'));
  const cases = [];

  for (const fileResult of data.testResults ?? []) {
    const rel = fileResult.name.replace(/.*\/server\/test\//, '').replace(/\.e2e-spec\.ts$/, '');
    const moduleId = rel.split('/')[0];
    for (const assertion of fileResult.assertionResults ?? []) {
      const status =
        assertion.status === 'passed' ? 'pass' : assertion.status === 'pending' ? 'skip' : 'fail';
      cases.push({
        id: `api-e2e:${rel}:${assertion.title}`,
        tierId: 'api-e2e',
        module: moduleId,
        title: assertion.fullName.replace(/^.*\.e2e-spec\.ts /, ''),
        status,
        durationMs: Math.round(assertion.duration ?? 0),
        retestCommand: 'pnpm verify --tier api-e2e',
        suiteFile: rel,
      });
    }
  }

  return {
    cases,
    suiteCount: data.testResults?.length ?? 0,
    testCount: data.numTotalTests ?? cases.length,
    passed: data.numPassedTests ?? 0,
    failed: data.numFailedTests ?? 0,
  };
}

/** 解析 Playwright JSON 报告 */
export function parsePlaywrightReport(reportPath) {
  if (!existsSync(reportPath)) return { cases: [], testCount: 0 };
  const data = JSON.parse(readFileSync(reportPath, 'utf8'));
  const cases = [];

  function walkSuites(suites, titles = []) {
    for (const suite of suites ?? []) {
      const nextTitles = [...titles, suite.title].filter(Boolean);
      for (const spec of suite.specs ?? []) {
        for (const test of spec.tests ?? []) {
          const result = test.results?.[0];
          const status =
            test.status === 'expected' ? 'pass' : test.status === 'skipped' ? 'skip' : 'fail';
          const tags = (spec.tags ?? []).map((t) => (t.startsWith('@') ? t : `@${t}`));
          const moduleTag = tags.find((t) => t.startsWith('@module:'));
          cases.push({
            id: `browser-smoke:${spec.id ?? spec.title}`,
            tierId: 'browser-smoke',
            module: moduleTag?.replace('@module:', '') ?? 'browser-smoke',
            title: spec.title,
            status,
            durationMs: Math.round(result?.duration ?? 0),
            retestCommand: 'pnpm verify --tier browser-smoke',
            tags,
          });
        }
      }
      walkSuites(suite.suites, nextTitles);
    }
  }

  walkSuites(data.suites);
  return { cases, testCount: cases.length };
}

/** 根据 case 结果汇总模块与 API 覆盖 */
export function buildCoverage(inventory, allCases, apiCatalog, executedTierIds) {
  const modules = inventory.modules ?? [];

  const moduleItems = modules.map((mod) => {
    const relatedCases = allCases.filter((c) => {
      if (mod.apiSuites?.includes(c.module)) return true;
      if (mod.apiSuites?.some((s) => c.suiteFile === s || c.suiteFile?.startsWith(`${s}/`))) {
        return true;
      }
      if (c.module === mod.id) return true;
      if (c.tags?.some((t) => mod.browserTags?.includes(t))) return true;
      return false;
    });

    const executed = relatedCases.some((c) => executedTierIds.includes(c.tierId));
    const failed = relatedCases.some((c) => c.status === 'fail');
    const passed = relatedCases.length > 0 && !failed;

    let status = 'not-run';
    if (executed) status = failed ? 'fail' : passed ? 'pass' : 'partial';

    return {
      id: mod.id,
      name: mod.name,
      apiSuites: mod.apiSuites ?? [],
      browserTags: mod.browserTags ?? [],
      testCount: relatedCases.length,
      passed: relatedCases.filter((c) => c.status === 'pass').length,
      failed: relatedCases.filter((c) => c.status === 'fail').length,
      status,
      layers: [...new Set(relatedCases.map((c) => c.tierId).filter(Boolean))],
    };
  });

  const testedModules = moduleItems.filter(
    (m) => m.layers.length > 0 && m.layers.some((l) => executedTierIds.includes(l)),
  );

  return {
    modules: {
      total: modules.length,
      tested: testedModules.length,
      passed: testedModules.filter((m) => m.status === 'pass').length,
      failed: testedModules.filter((m) => m.status === 'fail').length,
      items: moduleItems,
    },
    apis: {
      totalInCatalog: apiCatalog.length,
      uniqueEndpoints: apiCatalog.length,
      testCases: allCases.filter((c) => c.tierId === 'api-e2e').length,
      byModule: Object.entries(
        apiCatalog.reduce((acc, api) => {
          acc[api.module] = (acc[api.module] ?? 0) + 1;
          return acc;
        }, {}),
      )
        .map(([module, count]) => ({ module, endpoints: count }))
        .sort((a, b) => b.endpoints - a.endpoints),
      items: apiCatalog,
    },
    testCases: {
      total: allCases.length,
      passed: allCases.filter((c) => c.status === 'pass').length,
      failed: allCases.filter((c) => c.status === 'fail').length,
      skipped: allCases.filter((c) => c.status === 'skip').length,
      byTier: executedTierIds.reduce((acc, tierId) => {
        acc[tierId] = allCases.filter((c) => c.tierId === tierId).length;
        return acc;
      }, {}),
    },
  };
}
