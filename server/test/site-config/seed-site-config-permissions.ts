import { DataSource } from 'typeorm';
import {
  SysPermissionEntity,
  SysRoleEntity,
  SysRolePermissionEntity,
} from '../../src/database/entities';

const SUPER_ADMIN_ROLE_CODE = 'super_admin';

const SITE_CONFIG_PERMISSIONS = [
  { name: '站点配置列表', code: 'system:config:list', type: 'api' },
  { name: '站点配置新增', code: 'system:config:create', type: 'api' },
  { name: '站点配置编辑', code: 'system:config:update', type: 'api' },
  { name: '站点配置删除', code: 'system:config:delete', type: 'api' },
];

/** e2e 内联写入 system:config:* 权限并授予 super_admin（正式 seed 在 Task 3） */
export async function seedSiteConfigPermissions(
  dataSource: DataSource,
): Promise<void> {
  const roleRepo = dataSource.getRepository(SysRoleEntity);
  const permissionRepo = dataSource.getRepository(SysPermissionEntity);
  const rolePermissionRepo = dataSource.getRepository(SysRolePermissionEntity);

  const superAdminRole = await roleRepo.findOne({
    where: { code: SUPER_ADMIN_ROLE_CODE },
  });
  if (!superAdminRole) {
    return;
  }

  for (const seed of SITE_CONFIG_PERMISSIONS) {
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
