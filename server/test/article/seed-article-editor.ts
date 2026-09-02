import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import {
  SysPermissionEntity,
  SysRoleEntity,
  SysRolePermissionEntity,
  SysUserEntity,
  SysUserRoleEntity,
} from '../../src/database/entities';

const EDITOR_PERMISSIONS = [
  'content:article:list',
  'content:article:view',
  'content:article:create',
  'content:article:update',
  'content:article:delete',
];

/** 拥有文章编辑权限但无 publish 权限的测试用户（e2e RBAC 场景） */
export async function seedArticleEditorUser(
  dataSource: DataSource,
): Promise<void> {
  const userRepo = dataSource.getRepository(SysUserEntity);
  const roleRepo = dataSource.getRepository(SysRoleEntity);
  const permissionRepo = dataSource.getRepository(SysPermissionEntity);
  const userRoleRepo = dataSource.getRepository(SysUserRoleEntity);
  const rolePermissionRepo = dataSource.getRepository(SysRolePermissionEntity);

  let role = await roleRepo.findOne({ where: { code: 'article_editor' } });
  if (!role) {
    role = await roleRepo.save(
      roleRepo.create({
        name: '文章编辑',
        code: 'article_editor',
        status: 1,
        sort: 98,
      }),
    );
  }

  for (const code of EDITOR_PERMISSIONS) {
    const permission = await permissionRepo.findOne({ where: { code } });
    if (!permission) continue;

    const link = await rolePermissionRepo.findOne({
      where: { roleId: role.id, permissionId: permission.id },
    });
    if (!link) {
      await rolePermissionRepo.save(
        rolePermissionRepo.create({
          roleId: role.id,
          permissionId: permission.id,
        }),
      );
    }
  }

  let user = await userRepo.findOne({ where: { username: 'editor' } });
  if (!user) {
    user = await userRepo.save(
      userRepo.create({
        username: 'editor',
        passwordHash: await bcrypt.hash('editor123', 10),
        nickname: '文章编辑员',
        avatar: null,
        status: 1,
      }),
    );
  }

  const userRole = await userRoleRepo.findOne({
    where: { userId: user.id, roleId: role.id },
  });
  if (!userRole) {
    await userRoleRepo.save(
      userRoleRepo.create({ userId: user.id, roleId: role.id }),
    );
  }
}
