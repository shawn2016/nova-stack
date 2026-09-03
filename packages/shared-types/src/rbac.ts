/** 系统用户列表项 */
export interface SysUserListItem {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  status: 0 | 1;
  deptId: string | null;
  deptName: string | null;
  roleIds: string[];
  roleCodes: string[];
}

/** 系统用户详情 */
export interface SysUserDetail extends SysUserListItem {
  createdAt: string;
  updatedAt: string;
}

/** 创建用户请求 */
export interface CreateUserDto {
  username: string;
  password: string;
  nickname?: string;
  status?: 0 | 1;
  deptId?: string | null;
}

/** 更新用户请求（MVP 不含改密码） */
export interface UpdateUserDto {
  nickname?: string;
  status?: 0 | 1;
  deptId?: string | null;
}

/** 分配用户角色请求 */
export interface AssignUserRolesDto {
  roleIds: string[];
}

/** 角色列表项 */
export interface SysRoleListItem {
  id: string;
  name: string;
  code: string;
  status: 0 | 1;
  sort: number;
}

/** 角色详情 */
export interface SysRoleDetail extends SysRoleListItem {
  permissionCodes: string[];
}

/** 创建角色请求 */
export interface CreateRoleDto {
  name: string;
  code: string;
  status?: 0 | 1;
  sort?: number;
}

/** 更新角色请求 */
export interface UpdateRoleDto {
  name?: string;
  code?: string;
  status?: 0 | 1;
  sort?: number;
}

/** 分配角色权限请求 */
export interface AssignRolePermissionsDto {
  permissionCodes: string[];
}

/** 菜单管理列表项 */
export interface SysMenuListItem {
  id: string;
  parentId: string;
  name: string;
  path: string;
  component: string;
  icon: string;
  type: 'directory' | 'menu' | 'button';
  permissionCode: string;
  sort: number;
  visible: 0 | 1;
  status: 0 | 1;
}

/** 创建菜单请求 */
export interface CreateMenuDto {
  parentId?: string;
  name: string;
  path?: string;
  component?: string;
  icon?: string;
  type: 'directory' | 'menu' | 'button';
  permissionCode?: string;
  sort?: number;
  visible?: 0 | 1;
  status?: 0 | 1;
}

/** 更新菜单请求 */
export interface UpdateMenuDto {
  parentId?: string;
  name?: string;
  path?: string;
  component?: string;
  icon?: string;
  type?: 'directory' | 'menu' | 'button';
  permissionCode?: string;
  sort?: number;
  visible?: 0 | 1;
  status?: 0 | 1;
}
