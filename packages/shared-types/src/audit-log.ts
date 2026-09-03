/** 登录日志列表项 */
export interface LoginLogListItem {
  id: string;
  username: string;
  userId?: string | null;
  ip: string;
  userAgent?: string | null;
  status: number;
  message?: string | null;
  createdAt: string;
}

/** 操作日志列表项 */
export interface OperLogListItem {
  id: string;
  userId: string;
  username: string;
  module: string;
  action: string;
  method: string;
  path: string;
  ip: string;
  requestSummary?: string | null;
  status: number;
  errorMsg?: string | null;
  durationMs: number;
  createdAt: string;
}

/** 登录日志列表查询参数 */
export interface LoginLogListQuery {
  page?: number;
  pageSize?: number;
  username?: string;
  status?: number;
  startTime?: string;
  endTime?: string;
}

/** 操作日志列表查询参数 */
export interface OperLogListQuery {
  page?: number;
  pageSize?: number;
  username?: string;
  module?: string;
  status?: number;
  startTime?: string;
  endTime?: string;
}
