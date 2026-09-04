import { describe, expect, it } from 'vitest';
import type {
  CreateDeptDto,
  DeptListItem,
  DeptSettings,
  DeptTreeNode,
  UpdateDeptDto,
} from './dept.js';

describe('dept types', () => {
  it('DeptListItem 包含部门列表字段', () => {
    const item: DeptListItem = {
      id: '1',
      parentId: '0',
      name: '总公司',
      sort: 0,
      leader: '张三',
      phone: '13800000000',
      status: 1,
      createdAt: '2026-09-03T00:00:00.000Z',
    };

    expect(item.name).toBe('总公司');
    expect(item.status).toBe(1);
  });

  it('DeptTreeNode 支持嵌套 children', () => {
    const node: DeptTreeNode = {
      id: '1',
      parentId: '0',
      name: '总公司',
      sort: 0,
      leader: null,
      phone: null,
      status: 1,
      children: [
        {
          id: '2',
          parentId: '1',
          name: '研发部',
          sort: 1,
          leader: null,
          phone: null,
          status: 1,
        },
      ],
    };

    expect(node.children).toHaveLength(1);
  });

  it('CreateDeptDto 与 DeptSettings 字段符合设计', () => {
    const create: CreateDeptDto = {
      parentId: '0',
      name: '测试部门',
      sort: 0,
      status: 1,
    };
    const update: UpdateDeptDto = { name: '测试部门（新）', status: 0 };
    const settings: DeptSettings = {
      moduleEnabled: true,
      userBindingEnabled: false,
    };

    expect(create.parentId).toBe('0');
    expect(update.status).toBe(0);
    expect(settings.userBindingEnabled).toBe(false);
  });
});
