import { describe, expect, it } from 'vitest';
import type {
  LoginLogListItem,
  LoginLogListQuery,
  OperLogListItem,
  OperLogListQuery,
} from './audit-log.js';

describe('audit-log types', () => {
  it('LoginLogListItem 包含登录日志列表字段', () => {
    const item: LoginLogListItem = {
      id: '1',
      username: 'admin',
      userId: '10',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      status: 1,
      message: 'success',
      createdAt: '2026-09-03T00:00:00.000Z',
    };

    expect(item.username).toBe('admin');
    expect(item.status).toBe(1);
  });

  it('OperLogListItem 包含操作日志列表字段', () => {
    const item: OperLogListItem = {
      id: '1',
      userId: '10',
      username: 'admin',
      module: 'users',
      action: 'create',
      method: 'POST',
      path: '/users',
      ip: '127.0.0.1',
      requestSummary: '{"username":"test"}',
      status: 1,
      errorMsg: null,
      durationMs: 42,
      createdAt: '2026-09-03T00:00:00.000Z',
    };

    expect(item.module).toBe('users');
    expect(item.durationMs).toBe(42);
  });

  it('LoginLogListQuery 支持分页与筛选', () => {
    const query: LoginLogListQuery = {
      page: 1,
      pageSize: 20,
      username: 'admin',
      status: 1,
      startTime: '2026-09-01T00:00:00.000Z',
      endTime: '2026-09-03T23:59:59.999Z',
    };

    expect(query.username).toBe('admin');
    expect(query.status).toBe(1);
  });

  it('OperLogListQuery 支持 module 筛选', () => {
    const query: OperLogListQuery = {
      page: 1,
      pageSize: 20,
      username: 'admin',
      module: 'dict',
      status: 0,
      startTime: '2026-09-01T00:00:00.000Z',
      endTime: '2026-09-03T23:59:59.999Z',
    };

    expect(query.module).toBe('dict');
    expect(query.status).toBe(0);
  });
});
