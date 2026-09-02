import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { runInitSeed } from '../../src/database/seeds/init.seed';
import {
  ArticleEntity,
  MemberUserEntity,
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

    expect(stores.permissions.length).toBe(18);
    expect(stores.permissions.some((p) => p.code === 'system:user:list')).toBe(true);
    expect(stores.permissions.some((p) => p.code === 'content:article:list')).toBe(true);
    expect(stores.menus.some((m) => m.name === '系统管理')).toBe(true);
    expect(stores.menus.some((m) => m.name === '用户管理')).toBe(true);
    expect(stores.menus.some((m) => m.name === '内容管理')).toBe(true);
    expect(stores.menus.some((m) => m.name === '文章管理' && m.path === '/content/articles')).toBe(
      true,
    );
    expect(stores.rolePermissions.length).toBe(18);
  });

  it('does not duplicate role-permission links on second run', async () => {
    process.env.NODE_ENV = 'development';
    const stores = emptyStores();
    const dataSource = createMockDataSource(stores);

    await runInitSeed(dataSource);
    await runInitSeed(dataSource);

    expect(stores.permissions.length).toBe(18);
    expect(stores.rolePermissions.length).toBe(18);
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

  it('skips default admin and dev member seeds in production', async () => {
    process.env.NODE_ENV = 'production';
    const stores = emptyStores();
    const dataSource = createMockDataSource(stores);

    await runInitSeed(dataSource);

    expect(stores.users).toHaveLength(0);
    expect(stores.userRoles).toHaveLength(0);
    expect(stores.members).toHaveLength(0);
    expect(stores.articles).toHaveLength(0);
    expect(bcrypt.hash).not.toHaveBeenCalled();

    expect(stores.roles.some((role) => role.code === 'super_admin')).toBe(true);
    expect(stores.permissions.length).toBe(18);
  });
});
