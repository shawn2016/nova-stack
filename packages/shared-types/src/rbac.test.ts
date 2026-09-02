import { describe, expect, it } from 'vitest';
import type {
  AssignRolePermissionsDto,
  AssignUserRolesDto,
  CreateMenuDto,
  CreateRoleDto,
  CreateUserDto,
  SysMenuListItem,
  SysRoleDetail,
  SysUserDetail,
  UpdateMenuDto,
  UpdateRoleDto,
  UpdateUserDto,
} from './rbac.js';

describe('rbac types', () => {
  it('CreateUserDto 包含 username、password 与可选 nickname、status', () => {
    const dto: CreateUserDto = {
      username: 'testuser',
      password: 'pass123',
      nickname: '测试用户',
      status: 1,
    };

    expect(dto.username).toBe('testuser');
    expect(dto.password).toBe('pass123');
    expect(dto.nickname).toBe('测试用户');
    expect(dto.status).toBe(1);
  });

  it('UpdateUserDto 不含 password，仅 nickname 与 status', () => {
    const dto: UpdateUserDto = {
      nickname: '新昵称',
      status: 0,
    };

    expect(dto.nickname).toBe('新昵称');
    expect(dto.status).toBe(0);
    expect('password' in dto).toBe(false);
  });

  it('AssignUserRolesDto 包含 roleIds 数组', () => {
    const dto: AssignUserRolesDto = { roleIds: [1, 2] };
    expect(dto.roleIds).toEqual([1, 2]);
  });

  it('CreateRoleDto 与 UpdateRoleDto 包含角色字段', () => {
    const create: CreateRoleDto = {
      name: '编辑员',
      code: 'editor',
      status: 1,
      sort: 10,
    };
    const update: UpdateRoleDto = { name: '高级编辑员', sort: 5 };

    expect(create.code).toBe('editor');
    expect(update.name).toBe('高级编辑员');
  });

  it('AssignRolePermissionsDto 包含 permissionCodes 数组', () => {
    const dto: AssignRolePermissionsDto = {
      permissionCodes: ['system:user:list', 'system:user:create'],
    };
    expect(dto.permissionCodes).toHaveLength(2);
  });

  it('SysUserDetail 包含角色与审计字段', () => {
    const user: SysUserDetail = {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      avatar: '',
      status: 1,
      roleIds: [1],
      roleCodes: ['super_admin'],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    expect(user.roleCodes).toContain('super_admin');
    expect(user.createdAt).toBeDefined();
  });

  it('SysRoleDetail 包含 permissionCodes', () => {
    const role: SysRoleDetail = {
      id: 1,
      name: '超级管理员',
      code: 'super_admin',
      status: 1,
      sort: 0,
      permissionCodes: ['system:user:list'],
    };

    expect(role.permissionCodes).toContain('system:user:list');
  });

  it('SysMenuListItem 与 CreateMenuDto 包含完整菜单字段', () => {
    const menu: SysMenuListItem = {
      id: 1,
      parentId: 0,
      name: '系统管理',
      path: '/system',
      component: '',
      icon: 'ri:settings-3-line',
      type: 'directory',
      permissionCode: '',
      sort: 1,
      visible: 1,
      status: 1,
    };
    const create: CreateMenuDto = {
      parentId: 0,
      name: '新菜单',
      path: '/new',
      type: 'menu',
      permissionCode: 'system:user:list',
    };

    expect(menu.type).toBe('directory');
    expect(create.type).toBe('menu');
  });

  it('UpdateMenuDto 字段均为可选', () => {
    const dto: UpdateMenuDto = { name: '重命名菜单' };
    expect(dto.name).toBe('重命名菜单');
    expect(dto.path).toBeUndefined();
  });
});
