export interface OnlineSessionListItem {
  tokenId: string;
  userId: string;
  username: string;
  ip: string;
  userAgent: string | null;
  loginAt: string;
}

export interface OnlineSessionListResult {
  list: OnlineSessionListItem[];
  total: number;
  page: number;
  pageSize: number;
  currentTokenId: string;
}

export interface KickOnlineSessionResult {
  success: true;
}
