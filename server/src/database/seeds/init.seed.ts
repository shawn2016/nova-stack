import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import {
  MemberUserEntity,
  SysMenuEntity,
  SysPermissionEntity,
  SysRoleEntity,
  SysRolePermissionEntity,
  SysUserEntity,
  SysUserRoleEntity,
} from '../entities';

const SUPER_ADMIN_ROLE_CODE = 'super_admin';
const ADMIN_USERNAME = 'admin';
const DEV_MEMBER_PHONE = '13800138000';

interface PermissionSeed {
  name: string;
  code: string;
  type: string;
}

interface MenuSeed {
  name: string;
  path: string | null;
  component: string | null;
  icon: string | null;
  type: string;
  permissionCode: string | null;
  sort: number;
  children?: MenuSeed[];
}

const PERMISSION_SEEDS: PermissionSeed[] = [
  { name: '用户列表', code: 'system:user:list', type: 'api' },
  { name: '用户新增', code: 'system:user:create', type: 'api' },
  { name: '用户编辑', code: 'system:user:update', type: 'api' },
  { name: '用户删除', code: 'system:user:delete', type: 'api' },
  { name: '角色列表', code: 'system:role:list', type: 'api' },
  { name: '角色新增', code: 'system:role:create', type: 'api' },
  { name: '角色编辑', code: 'system:role:update', type: 'api' },
  { name: '角色删除', code: 'system:role:delete', type: 'api' },
  { name: '菜单列表', code: 'system:menu:list', type: 'api' },
  { name: '菜单新增', code: 'system:menu:create', type: 'api' },
  { name: '菜单编辑', code: 'system:menu:update', type: 'api' },
  { name: '菜单删除', code: 'system:menu:delete', type: 'api' },
];

const MENU_SEEDS: MenuSeed[] = [
  {
    name: '系统管理',
    path: '/system',
    component: null,
    icon: 'Setting',
    type: 'directory',
    permissionCode: null,
    sort: 1,
    children: [
      {
        name: '用户管理',
        path: '/system/user',
        component: 'system/user/index',
        icon: 'User',
        type: 'menu',
        permissionCode: 'system:user:list',
        sort: 1,
      },
      {
        name: '角色管理',
        path: '/system/role',
        component: 'system/role/index',
        icon: 'UserFilled',
        type: 'menu',
        permissionCode: 'system:role:list',
        sort: 2,
      },
      {
        name: '菜单管理',
        path: '/system/menu',
        component: 'system/menu/index',
        icon: 'Menu',
        type: 'menu',
        permissionCode: 'system:menu:list',
        sort: 3,
      },
    ],
  },
];

async function upsertPermission(
  repo: Repository<SysPermissionEntity>,
  seed: PermissionSeed,
): Promise<SysPermissionEntity> {
  let permission = await repo.findOne({ where: { code: seed.code } });
  if (!permission) {
    permission = repo.create(seed);
  } else {
    permission.name = seed.name;
    permission.type = seed.type;
  }
  return repo.save(permission);
}

async function upsertMenuTree(
  repo: Repository<SysMenuEntity>,
  seeds: MenuSeed[],
  parentId = '0',
): Promise<void> {
  for (const seed of seeds) {
    let menu = await repo.findOne({
      where: { name: seed.name, parentId },
    });

    if (!menu) {
      menu = repo.create({
        parentId,
        name: seed.name,
        path: seed.path,
        component: seed.component,
        icon: seed.icon,
        type: seed.type,
        permissionCode: seed.permissionCode,
        sort: seed.sort,
        visible: 1,
        status: 1,
      });
    } else {
      menu.path = seed.path;
      menu.component = seed.component;
      menu.icon = seed.icon;
      menu.type = seed.type;
      menu.permissionCode = seed.permissionCode;
      menu.sort = seed.sort;
      menu.visible = 1;
      menu.status = 1;
    }

    menu = await repo.save(menu);

    if (seed.children?.length) {
      await upsertMenuTree(repo, seed.children, menu.id);
    }
  }
}

/** 初始化 RBAC 与开发会员 seed 数据（幂等） */
export async function runInitSeed(dataSource: DataSource): Promise<void> {
  const roleRepo = dataSource.getRepository(SysRoleEntity);
  const permissionRepo = dataSource.getRepository(SysPermissionEntity);
  const menuRepo = dataSource.getRepository(SysMenuEntity);
  const userRepo = dataSource.getRepository(SysUserEntity);
  const userRoleRepo = dataSource.getRepository(SysUserRoleEntity);
  const rolePermissionRepo = dataSource.getRepository(SysRolePermissionEntity);
  const memberRepo = dataSource.getRepository(MemberUserEntity);

  let superAdminRole = await roleRepo.findOne({
    where: { code: SUPER_ADMIN_ROLE_CODE },
  });
  if (!superAdminRole) {
    superAdminRole = await roleRepo.save(
      roleRepo.create({
        name: '超级管理员',
        code: SUPER_ADMIN_ROLE_CODE,
        status: 1,
        sort: 0,
      }),
    );
  }

  const permissions: SysPermissionEntity[] = [];
  for (const seed of PERMISSION_SEEDS) {
    permissions.push(await upsertPermission(permissionRepo, seed));
  }

  await upsertMenuTree(menuRepo, MENU_SEEDS);

  for (const permission of permissions) {
    const exists = await rolePermissionRepo.findOne({
      where: { roleId: superAdminRole.id, permissionId: permission.id },
    });
    if (!exists) {
      await rolePermissionRepo.save(
        rolePermissionRepo.create({
          roleId: superAdminRole.id,
          permissionId: permission.id,
        }),
      );
    }
  }

  let adminUser = await userRepo.findOne({ where: { username: ADMIN_USERNAME } });
  if (!adminUser) {
    adminUser = await userRepo.save(
      userRepo.create({
        username: ADMIN_USERNAME,
        passwordHash: await bcrypt.hash('admin123', 10),
        nickname: '超级管理员',
        avatar: null,
        status: 1,
      }),
    );
  }

  const adminRoleLink = await userRoleRepo.findOne({
    where: { userId: adminUser.id, roleId: superAdminRole.id },
  });
  if (!adminRoleLink) {
    await userRoleRepo.save(
      userRoleRepo.create({
        userId: adminUser.id,
        roleId: superAdminRole.id,
      }),
    );
  }

  const nodeEnv = process.env.NODE_ENV ?? 'development';
  if (nodeEnv !== 'production') {
    let member = await memberRepo.findOne({ where: { phone: DEV_MEMBER_PHONE } });
    if (!member) {
      await memberRepo.save(
        memberRepo.create({
          phone: DEV_MEMBER_PHONE,
          passwordHash: await bcrypt.hash('member123', 10),
          nickname: '测试会员',
          avatar: null,
          status: 1,
        }),
      );
    }
  }
}
