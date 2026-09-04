import type { PaginationParams, PaginationResult } from './index.js';

export type IpBlacklistSource = 'manual' | 'auto';

export interface IpBlacklistListItem {
  id: string;
  ip: string;
  source: IpBlacklistSource;
  status: number;
  expiresAt: string | null;
  remark: string | null;
  createdBy: string | null;
  createdAt: string;
}

export type IpBlacklistListResult = PaginationResult<IpBlacklistListItem>;

export interface IpBlacklistListQuery extends PaginationParams {
  keyword?: string;
  source?: IpBlacklistSource;
  status?: number;
}

export interface CreateIpBlacklistDto {
  ip: string;
  remark?: string;
  /** ISO8601；省略或 null 表示永久封禁 */
  expiresAt?: string | null;
}

export interface UpdateIpBlacklistStatusDto {
  status: number;
}
