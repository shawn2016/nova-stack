import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveConclusion, evaluateAcceptance } from './verify-contract.mjs';

const contract = {
  path: '.verify/contracts/demo.yaml',
  items: [
    {
      id: 'AC-STATIC',
      description: '静态检查通过',
      required: true,
      evidence: [{ type: 'tier', tierId: 'static' }],
    },
    {
      id: 'AC-LOGIN',
      description: '登录路径通过',
      required: true,
      evidence: [{ type: 'scenario', page: '/auth/login', scenario: 'auth' }],
    },
  ],
};

test('全部 required 证据通过时结论为 pass', () => {
  const tiers = [{ id: 'static', status: 'pass' }];
  const cases = [{ id: 'login', tierId: 'browser-smoke', page: '/auth/login', scenario: 'auth', status: 'pass' }];
  const acceptance = evaluateAcceptance(contract, tiers, cases);

  assert.equal(acceptance.summary.passed, 2);
  assert.equal(
    deriveConclusion({
      summary: { failed: 0 },
      tiers,
      acceptance,
      requiredTierIds: ['static'],
    }),
    'pass',
  );
});

test('required tier 未执行时结论为 incomplete', () => {
  const acceptance = evaluateAcceptance(contract, [], []);
  assert.equal(acceptance.items[0].status, 'not-run');
  assert.equal(
    deriveConclusion({
      summary: { failed: 0 },
      tiers: [],
      acceptance,
      requiredTierIds: ['static'],
    }),
    'incomplete',
  );
});

test('任一 required 证据失败时结论为 fail', () => {
  const tiers = [{ id: 'static', status: 'fail' }];
  const acceptance = evaluateAcceptance(contract, tiers, []);
  assert.equal(acceptance.items[0].status, 'fail');
  assert.equal(
    deriveConclusion({
      summary: { failed: 1 },
      tiers,
      acceptance,
      requiredTierIds: ['static'],
    }),
    'fail',
  );
});
