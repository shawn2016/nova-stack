import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { runInitSeed } from '../../src/database/seeds/init.seed';
import {
  ArticleEntity,
  MemberUserEntity,
  SysDictDataEntity,
  SysDictTypeEntity,
  SysMenuEntity,
  SysPermissionEntity,
  SysRoleEntity,
  SysRolePermissionEntity,
  SysUserEntity,
  SysUserRoleEntity,
} from '../../src/database/entities';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (plain: string) => `bcrypt:${plain}`),
}));

type RepoMock<T extends ObjectLiteral> = jest.Mocked<
  Pick<Repository<T>, 'findOne' | 'create' | 'save'>
>;

interface SeedStores {
  roles: SysRoleEntity[];
  permissions: SysPermissionEntity[];
  menus: SysMenuEntity[];
  users: SysUserEntity[];
  userRoles: SysUserRoleEntity[];
  rolePermissions: SysRolePermissionEntity[];
  members: MemberUserEntity[];
  articles: ArticleEntity[];
  dictTypes: SysDictTypeEntity[];
  dictData: SysDictDataEntity[];
}

function matchesWhere<T extends ObjectLiteral>(
  entity: T,
  where: Partial<T>,
): boolean {
  return Object.entries(where).every(
    ([key, value]) => entity[key as keyof T] === value,
  );
}

function createInMemoryRepo<T extends ObjectLiteral & { id?: string }>(
  store: T[],
  createDefaults?: () => Partial<T>,
): RepoMock<T> {
  let idCounter = 1;

  return {
    findOne: jest.fn(async ({ where }: { where: Partial<T> }) =>
      store.find((item) => matchesWhere(item, where)) ?? null,
    ),
    create: jest.fn((data: Partial<T>) => ({ ...(createDefaults?.() ?? {}), ...data })),
    save: jest.fn(async (entity: T) => {
      const existingIndex = entity.id
        ? store.findIndex((item) => item.id === entity.id)
        : -1;

      const saved = {
        ...entity,
        id: entity.id ?? String(idCounter++),
      } as T;

      if (existingIndex >= 0) {
        store[existingIndex] = saved;
      } else {
        store.push(saved);
      }

      return saved;
    }),
  };
}

function createMockDataSource(stores: SeedStores): DataSource {
  const roleRepo = createInMemoryRepo(stores.roles);
  const permissionRepo = createInMemoryRepo(stores.permissions);
  const menuRepo = createInMemoryRepo(stores.menus);
  const userRepo = createInMemoryRepo(stores.users);
  const userRoleRepo = createInMemoryRepo(stores.userRoles);
  const rolePermissionRepo = createInMemoryRepo(stores.rolePermissions);
  const memberRepo = createInMemoryRepo(stores.members);
  const articleRepo = createInMemoryRepo(stores.articles);
  const dictTypeRepo = createInMemoryRepo(stores.dictTypes);
  const dictDataRepo = createInMemoryRepo(stores.dictData);

  return {
    getRepository: jest.fn((entity) => {
      switch (entity) {
        case SysRoleEntity:
          return roleRepo;
        case SysPermissionEntity:
          return permissionRepo;
        case SysMenuEntity:
          return menuRepo;
        case SysUserEntity:
          return userRepo;
        case SysUserRoleEntity:
          return userRoleRepo;
        case SysRolePermissionEntity:
          return rolePermissionRepo;
        case MemberUserEntity:
          return memberRepo;
        case ArticleEntity:
          return articleRepo;
        case SysDictTypeEntity:
          return dictTypeRepo;
        case SysDictDataEntity:
          return dictDataRepo;
        default:
          throw new Error(`Unexpected entity: ${String(entity)}`);
      }
    }),
  } as unknown as DataSource;
}

function emptyStores(): SeedStores {
  return {
    roles: [],
    permissions: [],
    menus: [],
    users: [],
    userRoles: [],
    rolePermissions: [],
    members: [],
    articles: [],
    dictTypes: [],
    dictData: [],
  };
}

describe('runInitSeed', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.clearAllMocks();
  });

  it('uses bcrypt and links admin to super_admin in non-production', async () => {
    process.env.NODE_ENV = 'development';
    const stores = emptyStores();
    const dataSource = createMockDataSource(stores);

    await runInitSeed(dataSource);

    expect(bcrypt.hash).toHaveBeenCalledWith('admin123', 10);
    expect(bcrypt.hash).toHaveBeenCalledWith('member123', 10);

    const adminUser = stores.users.find((user) => user.username === 'admin');
    expect(adminUser?.passwordHash).toBe('bcrypt:admin123');

    const superAdminRole = stores.roles.find((role) => role.code === 'super_admin');
    expect(superAdminRole).toBeDefined();
    expect(
      stores.userRoles.some(
        (link) =>
          link.userId === adminUser?.id && link.roleId === superAdminRole?.id,
      ),
    ).toBe(true);
  });

  it('seeds permissions, menus, and role-permission links', async () => {
    process.env.NODE_ENV = 'development';
    const stores = emptyStores();
    const dataSource = createMockDataSource(stores);

    await runInitSeed(dataSource);

    expect(stores.permissions.length).toBe(26);
    expect(stores.permissions.some((p) => p.code === 'system:user:list')).toBe(true);
    expect(stores.permissions.some((p) => p.code === 'content:article:list')).toBe(true);
    expect(stores.permissions.some((p) => p.code === 'system:dict:type:list')).toBe(true);
    expect(stores.permissions.some((p) => p.code === 'system:dict:data:delete')).toBe(true);
    expect(stores.menus.some((m) => m.name === '系统管理')).toBe(true);
    expect(stores.menus.some((m) => m.name === '用户管理')).toBe(true);
    expect(stores.menus.some((m) => m.name === '字典管理' && m.path === '/system/dict')).toBe(
      true,
    );
    expect(stores.menus.find((m) => m.name === '字典管理')?.permissionCode).toBe(
      'system:dict:type:list',
    );
    expect(stores.menus.some((m) => m.name === '内容管理')).toBe(true);
    expect(stores.menus.some((m) => m.name === '文章管理' && m.path === '/content/articles')).toBe(
      true,
    );
    expect(stores.menus.find((m) => m.name === '系统管理')?.icon).toBe('ri:settings-3-line');
    expect(stores.menus.find((m) => m.name === '用户管理')?.icon).toBe('ri:user-line');
    expect(stores.rolePermissions.length).toBe(26);
  });

  it('does not duplicate role-permission links on second run', async () => {
    process.env.NODE_ENV = 'development';
    const stores = emptyStores();
    const dataSource = createMockDataSource(stores);

    await runInitSeed(dataSource);
    await runInitSeed(dataSource);

    expect(stores.permissions.length).toBe(26);
    expect(stores.rolePermissions.length).toBe(26);
  });

  it('seeds dev sample articles in non-production', async () => {
    process.env.NODE_ENV = 'development';
    const stores = emptyStores();
    const dataSource = createMockDataSource(stores);

    await runInitSeed(dataSource);

    expect(stores.articles).toHaveLength(2);
    expect(stores.articles.some((a) => a.status === 1 && a.publishedAt)).toBe(true);
    expect(stores.articles.some((a) => a.status === 0 && !a.publishedAt)).toBe(true);
  });

  it('does not duplicate sample articles on second run', async () => {
    process.env.NODE_ENV = 'development';
    const stores = emptyStores();
    const dataSource = createMockDataSource(stores);

    await runInitSeed(dataSource);
    await runInitSeed(dataSource);

    expect(stores.articles).toHaveLength(2);
  });

  it('seeds dev sample dict types and data in non-production', async () => {
    process.env.NODE_ENV = 'development';
    const stores = emptyStores();
    const dataSource = createMockDataSource(stores);

    await runInitSeed(dataSource);

    expect(stores.dictTypes).toHaveLength(2);
    expect(stores.dictTypes.some((t) => t.code === 'user_status')).toBe(true);
    expect(stores.dictTypes.some((t) => t.code === 'article_status')).toBe(true);
    expect(stores.dictData).toHaveLength(4);

    const userStatusType = stores.dictTypes.find((t) => t.code === 'user_status');
    expect(
      stores.dictData.some(
        (d) => d.typeId === userStatusType?.id && d.label === '启用' && d.value === '1',
      ),
    ).toBe(true);
    expect(
      stores.dictData.some(
        (d) => d.typeId === userStatusType?.id && d.label === '禁用' && d.value === '0',
      ),
    ).toBe(true);

    const articleStatusType = stores.dictTypes.find((t) => t.code === 'article_status');
    expect(
      stores.dictData.some(
        (d) => d.typeId === articleStatusType?.id && d.value === 'draft',
      ),
    ).toBe(true);
    expect(
      stores.dictData.some(
        (d) => d.typeId === articleStatusType?.id && d.value === 'published',
      ),
    ).toBe(true);
  });

  it('does not duplicate sample dict data on second run', async () => {
    process.env.NODE_ENV = 'development';
    const stores = emptyStores();
    const dataSource = createMockDataSource(stores);

    await runInitSeed(dataSource);
    await runInitSeed(dataSource);

    expect(stores.dictTypes).toHaveLength(2);
    expect(stores.dictData).toHaveLength(4);
  });

  it('skips default admin and dev member seeds in production', async () => {
    process.env.NODE_ENV = 'production';
    const stores = emptyStores();
    const dataSource = createMockDataSource(stores);

    await runInitSeed(dataSource);

    expect(stores.users).toHaveLength(0);
    expect(stores.userRoles).toHaveLength(0);
    expect(stores.members).toHaveLength(0);
    expect(stores.articles).toHaveLength(0);
    expect(stores.dictTypes).toHaveLength(0);
    expect(stores.dictData).toHaveLength(0);
    expect(bcrypt.hash).not.toHaveBeenCalled();

    expect(stores.roles.some((role) => role.code === 'super_admin')).toBe(true);
    expect(stores.permissions.length).toBe(26);
  });
});
