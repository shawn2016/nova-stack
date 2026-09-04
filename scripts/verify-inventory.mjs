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

/** 去除 Playwright 错误信息中的 ANSI 颜色码 */
function stripAnsi(text = '') {
  return text.replace(/\u001b\[[0-9;]*m/g, '');
}

/** 从 Playwright result 提取错误与附件 */
function extractPlaywrightFailure(result) {
  if (!result || result.status === 'passed' || result.status === 'skipped') return undefined;

  const primary = result.error ?? result.errors?.[0];
  const message = stripAnsi(primary?.message ?? primary?.text ?? '');
  const stack = stripAnsi(primary?.stack ?? '');

  const attachments = (result.attachments ?? []).map((item) => ({
    name: item.name,
    path: item.path?.replace(`${rootDir}/`, '') ?? '',
    contentType: item.contentType,
  }));

  const location = result.errorLocation ?? primary?.location;

  return {
    message: message || (result.status === 'timedOut' ? '测试超时' : '未知错误'),
    stack,
    location: location
      ? {
          file: location.file?.replace(`${rootDir}/`, '') ?? location.file,
          line: location.line,
          column: location.column,
        }
      : undefined,
    snippet: result.error?.snippet ? stripAnsi(result.error.snippet) : undefined,
    attachments,
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
            result?.status === 'passed' || test.status === 'expected'
              ? 'pass'
              : result?.status === 'skipped' || test.status === 'skipped'
                ? 'skip'
                : 'fail';
          const tags = (spec.tags ?? []).map((t) => (t.startsWith('@') ? t : `@${t}`));
          const moduleTag = tags.find((t) => t.startsWith('@module:'));
          const { page, scenario } = parseCaseScenarioTags(tags);
          const failure = extractPlaywrightFailure(result);
          const specFile = spec.file?.replace(/^.*\/e2e\/specs\//, '').replace(/^\.\.\//, '');

          cases.push({
            id: `browser-smoke:${spec.id ?? spec.title}`,
            tierId: 'browser-smoke',
            module: moduleTag?.replace('@module:', '') ?? 'browser-smoke',
            title: spec.title,
            status,
            durationMs: Math.round(result?.duration ?? 0),
            retestCommand: 'pnpm verify --tier browser-smoke',
            tags,
            page,
            scenario,
            error: failure
              ? { message: failure.message, stack: failure.stack, snippet: failure.snippet, location: failure.location }
              : undefined,
            attachments: failure?.attachments,
            suggestedFiles: failure?.location?.file ? [failure.location.file] : specFile ? [`e2e/specs/${specFile}`] : [],
          });
        }
      }
      walkSuites(suite.suites, nextTitles);
    }
  }

  walkSuites(data.suites);
  return { cases, testCount: cases.length };
}

/** 扫描 e2e 目录中已声明的 @module 标签 */
export function scanBrowserModuleTags() {
  const e2eRoot = join(rootDir, 'e2e', 'specs');
  if (!existsSync(e2eRoot)) return [];
  const tags = new Set();
  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.endsWith('.spec.ts')) continue;
      const content = readFileSync(full, 'utf8');
      const re = /@module:([\w-]+)/g;
      let match;
      while ((match = re.exec(content)) !== null) tags.add(match[1]);
    }
  }
  walk(e2eRoot);
  return [...tags];
}

/** 加载场景目录 */
export function loadScenarioCatalog() {
  const raw = readFileSync(join(rootDir, '.verify', 'scenario-catalog.yaml'), 'utf8');
  return parseYaml(raw);
}

/** Admin 路由 → Vue 文件路径 */
export function adminPathToViewFile(adminPath) {
  const rel = adminPath.replace(/^\//, '');
  return join(rootDir, 'admin/src/views', rel, 'index.vue');
}

/** 从 Vue 页面源码推断应具备的能力（供 AI 写 E2E 前对照） */
export function scanPageCapabilitiesFromVue(adminPath) {
  const viewFile = adminPathToViewFile(adminPath);
  if (!existsSync(viewFile)) {
    return adminPath.startsWith('/auth/') ? ['auth'] : ['list'];
  }
  const content = readFileSync(viewFile, 'utf8');
  const caps = new Set(['list']);

  if (adminPath.startsWith('/auth/login')) {
    return ['auth'];
  }

  if (/#search|ArtSearchBar|@search|Search v-model|modules\/.*-search/.test(content)) {
    caps.add('search');
  }
  if (/showDialog\s*\(\s*['"]add|openDialog\s*\(\s*['"]add|新增/.test(content)) {
    caps.add('create');
  }
  if (/showDialog\s*\(\s*['"]edit|openDialog\s*\(\s*['"]edit|dialogType.*edit|编辑/.test(content)) {
    caps.add('update');
  }
  if (/delete|Delete|handleDelete|删除/.test(content)) {
    caps.add('delete');
  }
  if (/:tabs=|\w+_TABS\s*=|AUDIT_LOG_TABS/.test(content)) {
    caps.add('tabs');
  }
  if (/ElUpload|上传图片|handleUpload/.test(content)) {
    caps.add('upload');
  }

  return [...caps];
}

/** 从 Playwright case tags 提取 page / scenario */
function parseCaseScenarioTags(tags = []) {
  const normalized = tags.map((t) => (t.startsWith('@') ? t : `@${t}`));
  return {
    page: normalized.find((t) => t.startsWith('@page:'))?.replace('@page:', ''),
    scenario: normalized.find((t) => t.startsWith('@scenario:'))?.replace('@scenario:', ''),
  };
}

/** 页面 × 场景矩阵：Vue 扫描期望 vs E2E 实际 */
export function buildScenarioMatrix(inventory, browserCases, catalog) {
  const scenarioDefs = catalog?.scenarios ?? {};
  const pages = [];

  for (const mod of inventory.modules ?? []) {
    for (const page of mod.adminPages ?? []) {
      const declared = page.capabilities ?? page.expectedScenarios;
      const expectedIds = declared?.length ? declared : scanPageCapabilitiesFromVue(page.path);
      const pageCases = browserCases.filter((c) => {
        const { page: casePage } = parseCaseScenarioTags(c.tags);
        return casePage === page.path;
      });

      const testedMap = new Map();
      for (const c of pageCases) {
        const { scenario } = parseCaseScenarioTags(c.tags);
        if (!scenario) continue;
        testedMap.set(scenario, {
          id: scenario,
          name: scenarioDefs[scenario]?.name ?? scenario,
          testTitle: c.title,
          status: c.status,
        });
      }

      const expected = expectedIds.map((id) => ({
        id,
        name: scenarioDefs[id]?.name ?? id,
        description: scenarioDefs[id]?.description ?? '',
      }));

      const passedExpected = expected.filter(
        (e) => testedMap.has(e.id) && testedMap.get(e.id)?.status === 'pass',
      ).length;

      pages.push({
        path: page.path,
        name: page.name,
        moduleId: mod.id,
        moduleName: mod.name,
        viewFile: adminPathToViewFile(page.path).replace(`${rootDir}/`, ''),
        expected,
        tested: [...testedMap.values()],
        gaps: expected
          .filter((e) => !testedMap.has(e.id) || testedMap.get(e.id)?.status !== 'pass')
          .map((e) => ({ id: e.id, name: e.name })),
        coveragePct: expected.length ? Math.round((passedExpected / expected.length) * 100) : 0,
      });
    }
  }

  const totalExpected = pages.reduce((n, p) => n + p.expected.length, 0);
  const totalTested = pages.reduce(
    (n, p) => n + p.expected.filter((e) => p.tested.some((t) => t.id === e.id && t.status === 'pass')).length,
    0,
  );
  const totalGaps = pages.reduce((n, p) => n + p.gaps.length, 0);

  return {
    summary: {
      pages: pages.length,
      totalExpected,
      totalTested,
      totalGaps,
      coveragePct: totalExpected ? Math.round((totalTested / totalExpected) * 100) : 0,
      note: '期望能力来自 Vue 页面扫描；已测场景来自 E2E 的 @page + @scenario 标签',
    },
    items: pages.sort((a, b) => a.coveragePct - b.coveragePct || a.path.localeCompare(b.path)),
  };
}

/** 扫描 server/test 下存在的 API 套件目录 */
export function scanApiSuitesOnDisk() {
  const testRoot = join(rootDir, 'server', 'test');
  return readdirSync(testRoot).filter((name) => {
    const full = join(testRoot, name);
    return statSync(full).isDirectory();
  });
}

/** 根据 case 结果汇总模块与 API 覆盖，并计算缺口（ReportPortal 式 期望 vs 实际） */
export function buildCoverage(inventory, allCases, apiCatalog, executedTierIds) {
  const modules = inventory.modules ?? [];
  const browserModulesOnDisk = scanBrowserModuleTags();
  const apiSuitesOnDisk = scanApiSuitesOnDisk();

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

    const hasApiSuiteOnDisk = (mod.apiSuites ?? []).some((s) => apiSuitesOnDisk.includes(s));
    const hasBrowserSpecOnDisk = browserModulesOnDisk.includes(mod.id);
    const apiExecutedThisRun =
      executedTierIds.includes('api-e2e') &&
      relatedCases.some((c) => c.tierId === 'api-e2e' && c.status !== 'skip');
    const browserExecutedThisRun =
      executedTierIds.includes('browser-smoke') &&
      relatedCases.some((c) => c.tierId === 'browser-smoke' && c.status !== 'skip');

    const expectedLayers = mod.expectedLayers ?? ['api-e2e'];
    const expectsBrowser = Boolean(mod.adminPages?.length || mod.browserTags?.length);
    // 本次 run 未覆盖的层（与「磁盘缺 spec」分开：仅已有资产但未执行）
    const missingLayers = expectedLayers.filter((layer) => {
      if (layer === 'api-e2e') return hasApiSuiteOnDisk && !apiExecutedThisRun;
      if (layer === 'browser-e2e') return expectsBrowser && hasBrowserSpecOnDisk && !browserExecutedThisRun;
      return false;
    });

    return {
      id: mod.id,
      name: mod.name,
      apiSuites: mod.apiSuites ?? [],
      browserTags: mod.browserTags ?? [],
      adminPages: mod.adminPages ?? [],
      expectedLayers,
      missingLayers,
      hasApiSuiteOnDisk,
      hasBrowserSpecOnDisk,
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

  const adminPagesTotal = moduleItems.reduce((n, m) => n + (m.adminPages?.length ?? 0), 0);
  const adminPagesWithBrowserSpec = moduleItems.filter((m) => m.hasBrowserSpecOnDisk).reduce(
    (n, m) => n + (m.adminPages?.length ?? 0),
    0,
  );

  const catalog = loadScenarioCatalog();
  const browserCases = allCases.filter((c) => c.tierId === 'browser-smoke');
  const scenarios = buildScenarioMatrix(inventory, browserCases, catalog);

  return {
    modules: {
      total: modules.length,
      tested: testedModules.length,
      passed: testedModules.filter((m) => m.status === 'pass').length,
      failed: testedModules.filter((m) => m.status === 'fail').length,
      withApiE2eOnDisk: moduleItems.filter((m) => m.hasApiSuiteOnDisk).length,
      withBrowserSpecOnDisk: moduleItems.filter((m) => m.hasBrowserSpecOnDisk).length,
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
    gaps: {
      modulesMissingApiSuite: moduleItems.filter((m) => (m.apiSuites?.length ?? 0) > 0 && !m.hasApiSuiteOnDisk).map((m) => ({ id: m.id, name: m.name })),
      modulesMissingBrowserSpec: moduleItems.filter(
        (m) => (m.adminPages?.length || m.browserTags?.length) && !m.hasBrowserSpecOnDisk,
      ).map((m) => ({ id: m.id, name: m.name, adminPages: m.adminPages })),
      modulesMissingLayersThisRun: moduleItems.filter((m) => m.missingLayers.length > 0).map((m) => ({
        id: m.id,
        name: m.name,
        missingLayers: m.missingLayers,
      })),
      adminPages: {
        total: adminPagesTotal,
        withBrowserSpec: adminPagesWithBrowserSpec,
        untested: adminPagesTotal - adminPagesWithBrowserSpec,
      },
      browserModulesOnDisk,
      apiSuitesOnDisk,
    },
    scenarios,
  };
}
