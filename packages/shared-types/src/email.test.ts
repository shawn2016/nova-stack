import { describe, expect, it } from 'vitest';
import type {
  CreateEmailChannelDto,
  CreateEmailTemplateDto,
  EmailChannelListItem,
  EmailLogListItem,
  SendEmailDto,
  SendEmailResult,
} from './email.js';

describe('email types', () => {
  it('CreateEmailChannelDto 含 provider 与 config', () => {
    const dto: CreateEmailChannelDto = {
      name: 'Mock 通道',
      provider: 'mock',
      config: '{}',
      status: 1,
    };
    expect(dto.provider).toBe('mock');
  });

  it('CreateEmailTemplateDto 含 subject 与 channelId', () => {
    const dto: CreateEmailTemplateDto = {
      code: 'welcome',
      name: '欢迎邮件',
      subject: '欢迎加入 {siteName}',
      content: '您好，欢迎加入 {siteName}！',
      channelId: '1',
    };
    expect(dto.subject).toContain('siteName');
  });

  it('SendEmailDto 含 params', () => {
    const dto: SendEmailDto = {
      to: 'user@example.com',
      templateCode: 'welcome',
      params: { siteName: 'Nova Stack' },
    };
    expect(dto.params.siteName).toBe('Nova Stack');
  });

  it('SendEmailResult 表示发送结果', () => {
    const result: SendEmailResult = {
      logId: '1',
      status: 1,
      subject: '欢迎加入 Nova Stack',
      content: '您好，欢迎加入 Nova Stack！',
      providerMessage: 'mock sent',
    };
    expect(result.status).toBe(1);
  });

  it('EmailLogListItem 字段完整', () => {
    const log: EmailLogListItem = {
      id: '1',
      channelId: '1',
      templateCode: 'welcome',
      to: 'user@example.com',
      subject: '欢迎',
      content: 'test',
      status: 1,
      providerMessage: 'ok',
      sentAt: '2026-09-03T00:00:00.000Z',
      createdAt: '2026-09-03T00:00:00.000Z',
    };
    expect(log.to).toBe('user@example.com');
  });

  it('EmailChannelListItem provider 类型', () => {
    const channel: EmailChannelListItem = {
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
