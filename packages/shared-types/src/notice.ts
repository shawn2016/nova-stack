/** 通知公告列表项（管理端） */
export interface NoticeListItem {
  id: string;
  title: string;
  content: string;
  type: 1 | 2;
  status: 0 | 1;
  publisherId: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 我的公告（含已读状态） */
export interface NoticeMyListItem {
  id: string;
  title: string;
  content: string;
  type: 1 | 2;
  publisherId: string;
  publishedAt: string;
  isRead: boolean;
  readAt: string | null;
}

export interface CreateNoticeDto {
  title: string;
  content: string;
  type: 1 | 2;
}

export interface UpdateNoticeDto {
  title?: string;
  content?: string;
  type?: 1 | 2;
}

/** 站内消息列表项 */
export interface MessageListItem {
  id: string;
  senderId: string;
  receiverId: string;
  title: string;
  content: string;
  isRead: 0 | 1;
  readAt: string | null;
  createdAt: string;
}

export interface CreateMessageDto {
  receiverId: string;
  title: string;
  content: string;
}

export interface UnreadCountResult {
  count: number;
}
