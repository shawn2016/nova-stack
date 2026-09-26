import { describe, expect, it } from 'vitest';
import type {
  CreateMessageDto,
  CreateNoticeDto,
  MessageListItem,
  NoticeListItem,
  NoticeMyListItem,
  UpdateNoticeDto,
} from './notice.js';

describe('notice types', () => {
  it('NoticeListItem 包含公告管理字段', () => {
    const item: NoticeListItem = {
      id: '1',
      title: '系统维护',
      content: '今晚维护',
      type: 1,
      status: 1,
      publisherId: '10',
      publishedAt: '2026-09-03T00:00:00.000Z',
      createdAt: '2026-09-03T00:00:00.000Z',
      updatedAt: '2026-09-03T00:00:00.000Z',
    };

    expect(item.status).toBe(1);
  });

  it('NoticeMyListItem 包含 isRead', () => {
    const item: NoticeMyListItem = {
      id: '1',
      title: '公告',
      content: '内容',
      type: 2,
      publisherId: '10',
      publishedAt: '2026-09-03T00:00:00.000Z',
      isRead: false,
      readAt: null,
    };

    expect(item.isRead).toBe(false);
  });

  it('MessageListItem 与 DTO 字段符合设计', () => {
    const message: MessageListItem = {
      id: '1',
      senderId: '10',
      receiverId: '11',
      title: 'Hi',
      content: 'msg',
      isRead: 0,
      readAt: null,
      createdAt: '2026-09-03T00:00:00.000Z',
    };
    const create: CreateNoticeDto = {
      title: '标题',
      content: '正文',
      type: 1,
    };
    const send: CreateMessageDto = {
      receiverId: '11',
      title: 'Hi',
      content: 'msg',
    };
    const update: UpdateNoticeDto = { title: '新标题' };

    expect(message.isRead).toBe(0);
    expect(create.type).toBe(1);
    expect(send.receiverId).toBe('11');
    expect('type' in update).toBe(false);
  });
});
