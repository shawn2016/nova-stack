import { ArticleEntity } from './article.entity';
import { MemberUserEntity } from './member-user.entity';
import { SysConfigEntity } from './sys-config.entity';
import { SysDictDataEntity } from './sys-dict-data.entity';
import { SysDictTypeEntity } from './sys-dict-type.entity';
import { SysLoginLogEntity } from './sys-login-log.entity';
import { SysMenuEntity } from './sys-menu.entity';
import { SysOperLogEntity } from './sys-oper-log.entity';
import { SysPermissionEntity } from './sys-permission.entity';
import { SysRoleEntity } from './sys-role.entity';
import { SysRolePermissionEntity } from './sys-role-permission.entity';
import { SysUserEntity } from './sys-user.entity';
import { SysUserRoleEntity } from './sys-user-role.entity';

export { ArticleEntity } from './article.entity';
export { MemberUserEntity } from './member-user.entity';
export { SysConfigEntity } from './sys-config.entity';
export { SysDictDataEntity } from './sys-dict-data.entity';
export { SysDictTypeEntity } from './sys-dict-type.entity';
export { SysLoginLogEntity } from './sys-login-log.entity';
export { SysMenuEntity } from './sys-menu.entity';
export { SysOperLogEntity } from './sys-oper-log.entity';
export { SysPermissionEntity } from './sys-permission.entity';
export { SysRoleEntity } from './sys-role.entity';
export { SysRolePermissionEntity } from './sys-role-permission.entity';
export { SysUserEntity } from './sys-user.entity';
export { SysUserRoleEntity } from './sys-user-role.entity';

/** 全部 RBAC / Member / Dict 实体，供 TypeORM 与测试加载 */
export const entities = [
  SysUserEntity,
  SysRoleEntity,
  SysPermissionEntity,
  SysMenuEntity,
  SysUserRoleEntity,
  SysRolePermissionEntity,
  MemberUserEntity,
  ArticleEntity,
  SysConfigEntity,
  SysDictTypeEntity,
  SysDictDataEntity,
  SysLoginLogEntity,
  SysOperLogEntity,
];
