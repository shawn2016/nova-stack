import { describe, expect, it } from 'vitest';
import {
  DATA_SCOPE_ALL,
  DATA_SCOPE_CUSTOM,
  DATA_SCOPE_DEPT,
  DATA_SCOPE_DEPT_AND_CHILD,
  DATA_SCOPE_LABELS,
  DATA_SCOPE_SELF,
  type DataScope,
  type DataScopeFilter,
} from './data-scope.js';

describe('data-scope types', () => {
  it('DataScope 枚举值符合设计', () => {
    const scopes: DataScope[] = [
      DATA_SCOPE_ALL,
      DATA_SCOPE_CUSTOM,
      DATA_SCOPE_DEPT,
      DATA_SCOPE_DEPT_AND_CHILD,
      DATA_SCOPE_SELF,
    ];
    expect(scopes).toEqual([1, 2, 3, 4, 5]);
    expect(DATA_SCOPE_LABELS[3]).toBe('本部门');
  });

  it('DataScopeFilter 联合类型', () => {
    const all: DataScopeFilter = { type: 'all' };
    const self: DataScopeFilter = { type: 'self', userId: '1' };
    const depts: DataScopeFilter = { type: 'depts', deptIds: ['2', '3'] };
    expect(all.type).toBe('all');
    expect(self.userId).toBe('1');
    expect(depts.deptIds).toHaveLength(2);
  });
});
