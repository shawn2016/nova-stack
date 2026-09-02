import { DataSource, EntityMetadata } from 'typeorm';
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
  entities,
} from '../../src/database/entities';

function hasUniqueConstraint(meta: EntityMetadata, propertyName: string): boolean {
  const column = meta.findColumnWithPropertyName(propertyName);
  if (column?.isUnique === true) {
    return true;
  }

  if (
    meta.uniques.some((unique) =>
      unique.columns.length === 1 && unique.columns[0]?.propertyName === propertyName,
    )
  ) {
    return true;
  }

  return meta.indices.some(
    (index) =>
      index.isUnique &&
      index.columns.length === 1 &&
      index.columns[0]?.propertyName === propertyName,
  );
}

describe('RBAC database entities', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities,
      synchronize: false,
    });
    await dataSource.initialize();
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('loads all 10 entities with expected table names', () => {
    const tableNames = dataSource.entityMetadatas
      .map((meta) => meta.tableName)
      .sort();

    expect(tableNames).toEqual([
      'article',
      'member_user',
      'sys_dict_data',
      'sys_dict_type',
      'sys_menu',
      'sys_permission',
      'sys_role',
      'sys_role_permission',
      'sys_user',
      'sys_user_role',
    ]);
  });

  it('maps sys_user columns including unique username index', () => {
    const meta = dataSource.getMetadata(SysUserEntity);

    expect(meta.tableName).toBe('sys_user');
    expect(hasUniqueConstraint(meta, 'username')).toBe(true);
    expect(meta.findColumnWithPropertyName('passwordHash')).toBeDefined();
    expect(meta.findColumnWithPropertyName('status')).toBeDefined();
  });

  it('maps sys_role with unique code index', () => {
    const meta = dataSource.getMetadata(SysRoleEntity);

    expect(meta.tableName).toBe('sys_role');
    expect(hasUniqueConstraint(meta, 'code')).toBe(true);
  });

  it('maps sys_permission with unique code index', () => {
    const meta = dataSource.getMetadata(SysPermissionEntity);

    expect(meta.tableName).toBe('sys_permission');
    expect(hasUniqueConstraint(meta, 'code')).toBe(true);
  });

  it('maps sys_menu tree fields', () => {
    const meta = dataSource.getMetadata(SysMenuEntity);

    expect(meta.tableName).toBe('sys_menu');
    expect(meta.findColumnWithPropertyName('parentId')).toBeDefined();
    expect(meta.findColumnWithPropertyName('type')).toBeDefined();
    expect(meta.findColumnWithPropertyName('permissionCode')).toBeDefined();
  });

  it('uses composite primary keys on junction tables', () => {
    const userRoleMeta = dataSource.getMetadata(SysUserRoleEntity);
    const rolePermMeta = dataSource.getMetadata(SysRolePermissionEntity);

    expect(userRoleMeta.primaryColumns.map((c) => c.propertyName).sort()).toEqual([
      'roleId',
      'userId',
    ]);
    expect(rolePermMeta.primaryColumns.map((c) => c.propertyName).sort()).toEqual([
      'permissionId',
      'roleId',
    ]);
  });

  it('maps member_user with unique phone and no FK to sys_user', () => {
    const meta = dataSource.getMetadata(MemberUserEntity);

    expect(meta.tableName).toBe('member_user');
    expect(hasUniqueConstraint(meta, 'phone')).toBe(true);
    expect(meta.relations).toHaveLength(0);
  });

  it('maps sys_dict_type with unique code', () => {
    const meta = dataSource.getMetadata(SysDictTypeEntity);

    expect(meta.tableName).toBe('sys_dict_type');
    expect(hasUniqueConstraint(meta, 'code')).toBe(true);
    expect(meta.findColumnWithPropertyName('status')?.type).toBe('tinyint');
    expect(meta.findColumnWithPropertyName('remark')?.isNullable).toBe(true);
  });

  it('maps sys_dict_data with composite unique (typeId, value)', () => {
    const meta = dataSource.getMetadata(SysDictDataEntity);

    expect(meta.tableName).toBe('sys_dict_data');
    expect(
      meta.uniques.some(
        (unique) =>
          unique.columns.map((c) => c.propertyName).sort().join(',') ===
          'typeId,value',
      ),
    ).toBe(true);
    expect(meta.findColumnWithPropertyName('typeId')?.databaseName).toBe('type_id');
    expect(meta.findColumnWithPropertyName('sort')?.default).toBe(0);
    expect(meta.relations).toHaveLength(0);
  });

  it('maps article columns and status+publishedAt index', () => {
    const meta = dataSource.getMetadata(ArticleEntity);

    expect(meta.tableName).toBe('article');
    expect(meta.findColumnWithPropertyName('title')?.length).toBe('200');
    expect(meta.findColumnWithPropertyName('summary')?.length).toBe('500');
    expect(meta.findColumnWithPropertyName('content')?.type).toBe('text');
    expect(meta.findColumnWithPropertyName('coverUrl')?.databaseName).toBe('cover_url');
    expect(meta.findColumnWithPropertyName('status')?.type).toBe('tinyint');
    expect(meta.findColumnWithPropertyName('authorId')?.databaseName).toBe('author_id');
    expect(meta.findColumnWithPropertyName('publishedAt')?.databaseName).toBe('published_at');
    expect(
      meta.indices.some(
        (index) =>
          index.columns.map((c) => c.propertyName).sort().join(',') ===
          'publishedAt,status',
      ),
    ).toBe(true);
    expect(meta.relations).toHaveLength(0);
  });
});
