import { DataSource } from 'typeorm';
import {
  SysPermissionEntity,
  SysRoleEntity,
  SysRolePermissionEntity,
} from '../../src/database/entities';

const AUDIT_PERMISSIONS = [
  { name: '登录日志列表', code: 'system:audit:login:list', type: 'api' },
  { name: '操作日志列表', code: 'system:audit:oper:list', type: 'api' },
];

/** e2e 内联写入审计查询权限并授予 super_admin（Task 4 seed 前临时使用） */
export async function seedAuditPermissions(dataSource: DataSource): Promise<void> {
  const roleRepo = dataSource.getRepository(SysRoleEntity);
  const permissionRepo = dataSource.getRepository(SysPermissionEntity);
  const rolePermissionRepo = dataSource.getRepository(SysRolePermissionEntity);

  const superAdminRole = await roleRepo.findOne({
    where: { code: 'super_admin' },
  });
  if (!superAdminRole) {
    return;
  }

  for (const seed of AUDIT_PERMISSIONS) {
    let permission = await permissionRepo.findOne({ where: { code: seed.code } });
    if (!permission) {
      permission = await permissionRepo.save(permissionRepo.create(seed));
    }

    const link = await rolePermissionRepo.findOne({
      where: { roleId: superAdminRole.id, permissionId: permission.id },
    });
    if (!link) {
      await rolePermissionRepo.save(
        rolePermissionRepo.create({
          roleId: superAdminRole.id,
          permissionId: permission.id,
        }),
      );
    }
  }
}
