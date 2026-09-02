import { DataSource } from 'typeorm';
import {
  SysPermissionEntity,
  SysRoleEntity,
  SysRolePermissionEntity,
} from '../../src/database/entities';

const DICT_PERMISSIONS = [
  { name: '字典类型列表', code: 'system:dict:type:list', type: 'api' },
  { name: '字典类型新增', code: 'system:dict:type:create', type: 'api' },
  { name: '字典类型编辑', code: 'system:dict:type:update', type: 'api' },
  { name: '字典类型删除', code: 'system:dict:type:delete', type: 'api' },
  { name: '字典数据列表', code: 'system:dict:data:list', type: 'api' },
  { name: '字典数据新增', code: 'system:dict:data:create', type: 'api' },
  { name: '字典数据编辑', code: 'system:dict:data:update', type: 'api' },
  { name: '字典数据删除', code: 'system:dict:data:delete', type: 'api' },
];

/** e2e 用：为 super_admin 注入字典权限（Task 3 seed 前临时方案） */
export async function seedDictPermissions(dataSource: DataSource): Promise<void> {
  const roleRepo = dataSource.getRepository(SysRoleEntity);
  const permissionRepo = dataSource.getRepository(SysPermissionEntity);
  const rolePermissionRepo = dataSource.getRepository(SysRolePermissionEntity);

  const superAdmin = await roleRepo.findOne({ where: { code: 'super_admin' } });
  if (!superAdmin) {
    return;
  }

  for (const seed of DICT_PERMISSIONS) {
    let permission = await permissionRepo.findOne({ where: { code: seed.code } });
    if (!permission) {
      permission = await permissionRepo.save(permissionRepo.create(seed));
    }

    const link = await rolePermissionRepo.findOne({
      where: { roleId: superAdmin.id, permissionId: permission.id },
    });
    if (!link) {
      await rolePermissionRepo.save(
        rolePermissionRepo.create({
          roleId: superAdmin.id,
          permissionId: permission.id,
        }),
      );
    }
  }
}
