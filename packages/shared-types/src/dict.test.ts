import { describe, expect, it } from 'vitest';
import type {
  CreateDictDataDto,
  CreateDictTypeDto,
  DictDataListItem,
  DictOption,
  DictTypeListItem,
  UpdateDictDataDto,
  UpdateDictTypeDto,
} from './dict.js';

describe('dict types', () => {
  it('DictTypeListItem 包含类型列表字段', () => {
    const item: DictTypeListItem = {
      id: '1',
      name: '用户状态',
      code: 'user_status',
      status: 1,
      remark: null,
      createdAt: '2026-09-03T00:00:00.000Z',
    };

    expect(item.code).toBe('user_status');
    expect(item.status).toBe(1);
  });

  it('DictDataListItem 包含数据列表字段与可选 typeCode', () => {
    const item: DictDataListItem = {
      id: '1',
      typeId: '10',
      typeCode: 'user_status',
      label: '启用',
      value: '1',
      sort: 0,
      status: 1,
    };

    expect(item.typeCode).toBe('user_status');
    expect(item.value).toBe('1');
  });

  it('DictOption 包含 label、value、sort', () => {
    const option: DictOption = {
      label: '启用',
      value: '1',
      sort: 0,
    };

    expect(option.label).toBe('启用');
    expect(option.sort).toBe(0);
  });

  it('CreateDictTypeDto 与 UpdateDictTypeDto 字段符合设计', () => {
    const create: CreateDictTypeDto = {
      name: '用户状态',
      code: 'user_status',
      status: 1,
      remark: '示例',
    };
    const update: UpdateDictTypeDto = { name: '用户状态（新）', status: 0 };

    expect(create.code).toBe('user_status');
    expect(update.status).toBe(0);
    expect('code' in update).toBe(false);
  });

  it('CreateDictDataDto 与 UpdateDictDataDto 字段符合设计', () => {
    const create: CreateDictDataDto = {
      typeId: '10',
      label: '启用',
      value: '1',
      sort: 0,
      status: 1,
    };
    const update: UpdateDictDataDto = { label: '已启用', sort: 1 };

    expect(create.typeId).toBe('10');
    expect(update.label).toBe('已启用');
    expect('typeId' in update).toBe(false);
  });
});
