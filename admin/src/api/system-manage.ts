import type {
  AssignRolePermissionsDto,
  AssignUserRolesDto,
  CreateMenuDto,
  CreateRoleDto,
  CreateUserDto,
  PaginationResult,
  SysMenuListItem,
  SysRoleDetail,
  SysRoleListItem,
  SysUserDetail,
  SysUserListItem,
  UpdateMenuDto,
  UpdateRoleDto,
  UpdateUserDto,
} from '@nova/shared-types'
import { request } from './request'

export interface UserListQuery {
  username?: string
  status?: 0 | 1
  current?: number
  size?: number
}

export interface RoleListQuery {
  name?: string
  code?: string
  status?: 0 | 1
  current?: number
  size?: number
}

function filterPaginated<T>(
  result: PaginationResult<T>,
  predicate: (item: T) => boolean,
): PaginationResult<T> {
  const list = result.list.filter(predicate)
  return {
    list,
    total: list.length,
    page: 1,
    pageSize: list.length || 1,
  }
}

function toTableResponse<T>(result: PaginationResult<T>) {
  return {
    records: result.list,
    total: result.total,
    current: result.page,
    size: result.pageSize,
  }
}

export function fetchUserList(params: UserListQuery = {}) {
  const { username, status } = params
  return request<PaginationResult<SysUserListItem>>({
    url: '/users',
    method: 'GET',
  }).then((result) => {
    if (!username && status === undefined) {
      return toTableResponse(result)
    }
    return toTableResponse(
      filterPaginated(result, (item) => {
        const matchUsername = !username || item.username.includes(username)
        const matchStatus = status === undefined || item.status === status
        return matchUsername && matchStatus
      }),
    )
  })
}

export function fetchUserDetail(id: number) {
  return request<SysUserDetail>({
    url: `/users/${id}`,
    method: 'GET',
  })
}

export function createUser(data: CreateUserDto) {
  return request<SysUserDetail>({
    url: '/users',
    method: 'POST',
    data,
  })
}

export function updateUser(id: number, data: UpdateUserDto) {
  return request<SysUserDetail>({
    url: `/users/${id}`,
    method: 'PUT',
    data,
  })
}

export function deleteUser(id: number) {
  return request<{ success: true }>({
    url: `/users/${id}`,
    method: 'DELETE',
  })
}

export function assignUserRoles(id: number, data: AssignUserRolesDto) {
  return request<SysUserDetail>({
    url: `/users/${id}/roles`,
    method: 'PUT',
    data,
  })
}

export function fetchRoleList(params: RoleListQuery = {}) {
  const { name, code, status } = params
  return request<PaginationResult<SysRoleListItem>>({
    url: '/roles',
    method: 'GET',
  }).then((result) => {
    if (!name && !code && status === undefined) {
      return toTableResponse(result)
    }
    return toTableResponse(
      filterPaginated(result, (item) => {
        const matchName = !name || item.name.includes(name)
        const matchCode = !code || item.code.includes(code)
        const matchStatus = status === undefined || item.status === status
        return matchName && matchCode && matchStatus
      }),
    )
  })
}

export function fetchRoleDetail(id: number) {
  return request<SysRoleDetail>({
    url: `/roles/${id}`,
    method: 'GET',
  })
}

export function createRole(data: CreateRoleDto) {
  return request<SysRoleDetail>({
    url: '/roles',
    method: 'POST',
    data,
  })
}

export function updateRole(id: number, data: UpdateRoleDto) {
  return request<SysRoleDetail>({
    url: `/roles/${id}`,
    method: 'PUT',
    data,
  })
}

export function deleteRole(id: number) {
  return request<{ success: true }>({
    url: `/roles/${id}`,
    method: 'DELETE',
  })
}

export function assignRolePermissions(id: number, data: AssignRolePermissionsDto) {
  return request<SysRoleDetail>({
    url: `/roles/${id}/permissions`,
    method: 'PUT',
    data,
  })
}

export function fetchMenuList() {
  return request<PaginationResult<SysMenuListItem>>({
    url: '/menus',
    method: 'GET',
  }).then((result) => result.list)
}

export function createMenu(data: CreateMenuDto) {
  return request<SysMenuListItem>({
    url: '/menus',
    method: 'POST',
    data,
  })
}

export function updateMenu(id: number, data: UpdateMenuDto) {
  return request<SysMenuListItem>({
    url: `/menus/${id}`,
    method: 'PUT',
    data,
  })
}

export function deleteMenu(id: number) {
  return request<{ success: true }>({
    url: `/menus/${id}`,
    method: 'DELETE',
  })
}
