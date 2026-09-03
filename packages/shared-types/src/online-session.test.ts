import { describe, expect, it } from 'vitest';
import type {
  KickOnlineSessionResult,
  OnlineSessionListItem,
  OnlineSessionListResult,
} from './online-session.js';

describe('online-session types', () => {
  it('OnlineSessionListItem 包含会话字段', () => {
    const item: OnlineSessionListItem = {
      tokenId: 'jti-1',
      userId: '1',
      username: 'admin',
      ip: '127.0.0.1',
      userAgent: 'jest',
      loginAt: '2026-09-03T00:00:00.000Z',
    };

    expect(item.tokenId).toBe('jti-1');
    expect(item.username).toBe('admin');
  });

  it('OnlineSessionListResult 含 currentTokenId', () => {
    const result: OnlineSessionListResult = {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      currentTokenId: 'current-jti',
    };

    expect(result.currentTokenId).toBe('current-jti');
  });

  it('KickOnlineSessionResult 表示成功', () => {
    const result: KickOnlineSessionResult = { success: true };
    expect(result.success).toBe(true);
  });
});
