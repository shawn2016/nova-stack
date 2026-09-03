#!/usr/bin/env node
/**
 * 从 modood/Administrative-divisions-of-China 生成 flat seed JSON
 * 运行: node scripts/build-china-regions-seed.mjs
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(
  __dirname,
  '../server/src/database/seeds/data/china-regions.flat.json',
);

const res = await fetch(
  'https://raw.githubusercontent.com/modood/Administrative-divisions-of-China/master/dist/pca-code.json',
);
if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
const tree = await res.json();

const flat = [];
let sort = 0;

function walk(nodes, parentCode = '0', level = 1) {
  for (const node of nodes) {
    flat.push({
      code: node.code,
      name: node.name,
      parentCode,
      level,
      sort: sort++,
    });
    if (node.children?.length) {
      walk(node.children, node.code, level + 1);
    }
  }
}

walk(tree);
writeFileSync(OUT, JSON.stringify(flat));
console.log(`Wrote ${flat.length} regions to ${OUT}`);
