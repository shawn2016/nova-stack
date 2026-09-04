import type { LoginLogListItem, OperLogListItem, PaginationResult } from '@nova/shared-types'
import { request } from './request'

export interface LoginLogListQuery {
  username?: string
  status?: number
  startTime?: string
  endTime?: string
  current?: number
  size?: number
}

export interface OperLogListQuery {
  username?: string
  module?: string
  status?: number
  startTime?: string
  endTime?: string
  current?: number
  size?: number
}

function toTableResponse<T>(result: PaginationResult<T>) {
  return {
    records: result.list,
    total: result.total,
    current: result.page,
    size: result.pageSize
  }
}

function buildAuditParams(
  params: LoginLogListQuery | OperLogListQuery,
  extra?: Record<string, string | number | undefined>
) {
  const { current = 1, size = 20, username, status, startTime, endTime } = params
  return {
    page: current,
    pageSize: size,
    ...(username ? { username } : {}),
    ...(status !== undefined && status !== null ? { status } : {}),
    ...(startTime ? { startTime } : {}),
    ...(endTime ? { endTime } : {}),
    ...extra
  }
}

export function fetchLoginLogs(params: LoginLogListQuery = {}) {
  return request<PaginationResult<LoginLogListItem>>({
    url: '/audit/login-logs',
    method: 'GET',
    params: buildAuditParams(params)
  }).then(toTableResponse)
}

export function fetchOperLogs(params: OperLogListQuery = {}) {
  const { module, ...rest } = params
  return request<PaginationResult<OperLogListItem>>({
    url: '/audit/oper-logs',
    method: 'GET',
    params: buildAuditParams(rest, module ? { module } : {})
  }).then(toTableResponse)
}
