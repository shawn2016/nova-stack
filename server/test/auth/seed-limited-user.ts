import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import {
  SysPermissionEntity,
  SysRoleEntity,
  SysRolePermissionEntity,
  SysUserEntity,
  SysUserRoleEntity,
} from '../../src/database/entities';

/** 创建仅有 system:user:list 权限的测试用户（e2e 403 场景） */
export async function seedLimitedUser(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(SysUserEntity);
  const roleRepo = dataSource.getRepository(SysRoleEntity);
  const permissionRepo = dataSource.getRepository(SysPermissionEntity);
  const userRoleRepo = dataSource.getRepository(SysUserRoleEntity);
  const rolePermissionRepo = dataSource.getRepository(SysRolePermissionEntity);

  let role = await roleRepo.findOne({ where: { code: 'limited_user' } });
  if (!role) {
    role = await roleRepo.save(
      roleRepo.create({
        name: '受限用户',
        code: 'limited_user',
        status: 1,
        sort: 99,
      }),
    );
  }

  const listPermission = await permissionRepo.findOne({
    where: { code: 'system:user:list' },
  });
  if (listPermission) {
    const link = await rolePermissionRepo.findOne({
      where: { roleId: role.id, permissionId: listPermission.id },
    });
    if (!link) {
      await rolePermissionRepo.save(
        rolePermissionRepo.create({
          roleId: role.id,
          permissionId: listPermission.id,
        }),
      );
    }
  }

  let user = await userRepo.findOne({ where: { username: 'limited' } });
  if (!user) {
    user = await userRepo.save(
      userRepo.create({
        username: 'limited',
        passwordHash: await bcrypt.hash('limited123', 10),
        nickname: '受限管理员',
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
