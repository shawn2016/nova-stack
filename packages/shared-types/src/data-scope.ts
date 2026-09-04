/** 数据权限范围 */
export type DataScope = 1 | 2 | 3 | 4 | 5;

export const DATA_SCOPE_ALL = 1 as const;
export const DATA_SCOPE_CUSTOM = 2 as const;
export const DATA_SCOPE_DEPT = 3 as const;
export const DATA_SCOPE_DEPT_AND_CHILD = 4 as const;
export const DATA_SCOPE_SELF = 5 as const;

export const DATA_SCOPE_LABELS: Record<DataScope, string> = {
  1: '全部数据',
  2: '自定义部门',
  3: '本部门',
  4: '本部门及子部门',
  5: '仅本人',
};

export type DataScopeFilter =
  | { type: 'all' }
  | { type: 'self'; userId: string }
  | { type: 'depts'; deptIds: string[] }
  | { type: 'none' };
