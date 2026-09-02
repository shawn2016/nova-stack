import { ArticleEntity } from './article.entity';
import { MemberUserEntity } from './member-user.entity';
import { SysMenuEntity } from './sys-menu.entity';
import { SysPermissionEntity } from './sys-permission.entity';
import { SysRoleEntity } from './sys-role.entity';
import { SysRolePermissionEntity } from './sys-role-permission.entity';
import { SysUserEntity } from './sys-user.entity';
import { SysUserRoleEntity } from './sys-user-role.entity';

export { ArticleEntity } from './article.entity';
export { MemberUserEntity } from './member-user.entity';
export { SysMenuEntity } from './sys-menu.entity';
export { SysPermissionEntity } from './sys-permission.entity';
export { SysRoleEntity } from './sys-role.entity';
export { SysRolePermissionEntity } from './sys-role-permission.entity';
export { SysUserEntity } from './sys-user.entity';
export { SysUserRoleEntity } from './sys-user-role.entity';

/** 全部 RBAC / Member 实体，供 TypeORM 与测试加载 */
export const entities = [
  SysUserEntity,
  SysRoleEntity,
  SysPermissionEntity,
  SysMenuEntity,
  SysUserRoleEntity,
  SysRolePermissionEntity,
  MemberUserEntity,
  ArticleEntity,
];
