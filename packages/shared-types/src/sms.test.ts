import { describe, expect, it } from 'vitest';
import type {
  CreateSmsChannelDto,
  CreateSmsTemplateDto,
  SendSmsDto,
  SendSmsResult,
  SmsChannelListItem,
  SmsLogListItem,
} from './sms.js';

describe('sms types', () => {
  it('CreateSmsChannelDto 含 provider 与 config', () => {
    const dto: CreateSmsChannelDto = {
      name: 'Mock 通道',
      provider: 'mock',
      config: '{}',
      status: 1,
    };
    expect(dto.provider).toBe('mock');
  });

  it('CreateSmsTemplateDto 含 code 与 channelId', () => {
    const dto: CreateSmsTemplateDto = {
      code: 'login_code',
      name: '登录验证码',
      content: '您的验证码是{code}',
      channelId: '1',
    };
    expect(dto.code).toBe('login_code');
  });

  it('SendSmsDto 含 params', () => {
    const dto: SendSmsDto = {
      phone: '13800138000',
      templateCode: 'login_code',
      params: { code: '123456' },
    };
    expect(dto.params.code).toBe('123456');
  });

  it('SendSmsResult 表示发送结果', () => {
    const result: SendSmsResult = {
      logId: '1',
      status: 1,
      content: '您的验证码是123456',
      providerMessage: 'mock sent',
    };
    expect(result.status).toBe(1);
  });

  it('SmsLogListItem 字段完整', () => {
    const log: SmsLogListItem = {
      id: '1',
      channelId: '1',
      templateCode: 'login_code',
      phone: '13800138000',
      content: 'test',
      status: 1,
      providerMessage: 'ok',
      sentAt: '2026-09-03T00:00:00.000Z',
      createdAt: '2026-09-03T00:00:00.000Z',
    };
    expect(log.phone).toBe('13800138000');
  });

  it('SmsChannelListItem provider 类型', () => {
    const channel: SmsChannelListItem = {
      id: '1',
      name: 'Mock',
      provider: 'mock',
      config: '{}',
      status: 1,
      remark: null,
      createdAt: '2026-09-03T00:00:00.000Z',
      updatedAt: '2026-09-03T00:00:00.000Z',
    };
    expect(channel.provider).toBe('mock');
  });
});
