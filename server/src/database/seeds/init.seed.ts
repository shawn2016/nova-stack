import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import {
  ArticleEntity,
  MemberUserEntity,
  SysConfigEntity,
  SysDictDataEntity,
  SysDictTypeEntity,
  SysMenuEntity,
  SysPermissionEntity,
  SysRegionEntity,
  SysRoleEntity,
  SysRolePermissionEntity,
  SysUserEntity,
  SysUserRoleEntity,
} from '../entities';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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
  { name: '文章列表', code: 'content:article:list', type: 'api' },
  { name: '文章查看', code: 'content:article:view', type: 'api' },
  { name: '文章新增', code: 'content:article:create', type: 'api' },
  { name: '文章编辑', code: 'content:article:update', type: 'api' },
  { name: '文章删除', code: 'content:article:delete', type: 'api' },
  { name: '文章发布', code: 'content:article:publish', type: 'api' },
  { name: '字典类型列表', code: 'system:dict:type:list', type: 'api' },
  { name: '字典类型新增', code: 'system:dict:type:create', type: 'api' },
  { name: '字典类型编辑', code: 'system:dict:type:update', type: 'api' },
  { name: '字典类型删除', code: 'system:dict:type:delete', type: 'api' },
  { name: '字典数据列表', code: 'system:dict:data:list', type: 'api' },
  { name: '字典数据新增', code: 'system:dict:data:create', type: 'api' },
  { name: '字典数据编辑', code: 'system:dict:data:update', type: 'api' },
  { name: '字典数据删除', code: 'system:dict:data:delete', type: 'api' },
  { name: '站点配置列表', code: 'system:config:list', type: 'api' },
  { name: '站点配置新增', code: 'system:config:create', type: 'api' },
  { name: '站点配置编辑', code: 'system:config:update', type: 'api' },
  { name: '站点配置删除', code: 'system:config:delete', type: 'api' },
  { name: '登录日志列表', code: 'system:audit:login:list', type: 'api' },
  { name: '操作日志列表', code: 'system:audit:oper:list', type: 'api' },
  { name: '文件上传', code: 'system:file:upload', type: 'api' },
  { name: '地区列表', code: 'system:region:list', type: 'api' },
  { name: '地区新增', code: 'system:region:create', type: 'api' },
  { name: '地区编辑', code: 'system:region:update', type: 'api' },
  { name: '地区删除', code: 'system:region:delete', type: 'api' },
];

const MENU_SEEDS: MenuSeed[] = [
  {
    name: '系统管理',
    path: '/system',
    component: null,
    icon: 'ri:settings-3-line',
    type: 'directory',
    permissionCode: null,
    sort: 1,
    children: [
      {
        name: '用户管理',
        path: '/system/user',
        component: 'views/system/user/index',
        icon: 'ri:user-line',
        type: 'menu',
        permissionCode: 'system:user:list',
        sort: 1,
      },
      {
        name: '角色管理',
        path: '/system/role',
        component: 'views/system/role/index',
        icon: 'ri:shield-user-line',
        type: 'menu',
        permissionCode: 'system:role:list',
        sort: 2,
      },
      {
        name: '菜单管理',
        path: '/system/menu',
        component: 'views/system/menu/index',
        icon: 'ri:menu-line',
        type: 'menu',
        permissionCode: 'system:menu:list',
        sort: 3,
      },
      {
        name: '字典管理',
        path: '/system/dict',
        component: 'views/system/dict/index',
        icon: 'ri:book-2-line',
        type: 'menu',
        permissionCode: 'system:dict:type:list',
        sort: 4,
      },
      {
        name: '地区管理',
        path: '/system/region',
        component: 'views/system/region/index',
        icon: 'ri:map-pin-line',
        type: 'menu',
        permissionCode: 'system:region:list',
        sort: 5,
      },
      {
        name: '站点配置',
        path: '/system/site-config',
        component: 'views/system/site-config/index',
        icon: 'ri:global-line',
        type: 'menu',
        permissionCode: 'system:config:list',
        sort: 6,
      },
      {
        name: '审计日志',
        path: '/system/audit-logs',
        component: 'views/system/audit-logs/index',
        icon: 'ri:file-list-3-line',
        type: 'menu',
        permissionCode: 'system:audit:login:list',
        sort: 7,
      },
    ],
  },
  {
    name: '内容管理',
    path: '/content',
    component: null,
    icon: 'ri:folder-line',
    type: 'directory',
    permissionCode: null,
    sort: 2,
    children: [
      {
        name: '文章管理',
        path: '/content/articles',
        component: 'views/content/articles/index',
        icon: 'ri:article-line',
        type: 'menu',
        permissionCode: 'content:article:list',
        sort: 1,
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

interface ArticleSeed {
  title: string;
  summary: string;
  content: string;
  coverUrl: string | null;
  status: number;
  publishedAt: Date | null;
}

const DEV_ARTICLE_SEEDS: ArticleSeed[] = [
  {
    title: '欢迎使用 Nova Stack',
    summary: '这是一篇已发布的示例文章',
    content: '欢迎使用 Nova Stack 内容管理模块。',
    coverUrl: null,
    status: 1,
    publishedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    title: '草稿示例文章',
    summary: '这是一篇草稿状态的示例文章',
    content: '该文章尚未发布，仅供开发环境测试。',
    coverUrl: null,
    status: 0,
    publishedAt: null,
  },
];

interface DictTypeSeed {
  name: string;
  code: string;
  status: number;
  remark?: string | null;
}

interface DictDataSeed {
  typeCode: string;
  label: string;
  value: string;
  sort: number;
  status: number;
}

const DEV_DICT_TYPE_SEEDS: DictTypeSeed[] = [
  { name: '用户状态', code: 'user_status', status: 1, remark: '用户启用/禁用' },
  { name: '文章状态', code: 'article_status', status: 1, remark: '文章发布状态' },
];

interface SiteConfigSeed {
  configKey: string;
  configName: string;
  configValue: string;
  configGroup?: string | null;
  remark?: string | null;
}

const DEV_SITE_CONFIG_SEEDS: SiteConfigSeed[] = [
  {
    configKey: 'site.name',
    configName: '站点名称',
    configValue: 'Nova Stack',
    configGroup: 'site',
  },
  {
    configKey: 'site.logo',
    configName: '站点 Logo',
    configValue: '/uploads/logo.png',
    configGroup: 'site',
  },
  {
    configKey: 'site.icp',
    configName: '备案号',
    configValue: '京ICP备00000000号',
    configGroup: 'site',
    remark: '占位备案号',
  },
];

const DEV_DICT_DATA_SEEDS: DictDataSeed[] = [
  { typeCode: 'user_status', label: '启用', value: '1', sort: 1, status: 1 },
  { typeCode: 'user_status', label: '禁用', value: '0', sort: 2, status: 1 },
  { typeCode: 'article_status', label: '草稿', value: 'draft', sort: 1, status: 1 },
  { typeCode: 'article_status', label: '已发布', value: 'published', sort: 2, status: 1 },
];

async function upsertDevSiteConfigs(
  repo: Repository<SysConfigEntity>,
): Promise<void> {
  for (const seed of DEV_SITE_CONFIG_SEEDS) {
    let config = await repo.findOne({ where: { configKey: seed.configKey } });
    if (!config) {
      config = repo.create({
        configKey: seed.configKey,
        configName: seed.configName,
        configValue: seed.configValue,
        configGroup: seed.configGroup ?? null,
        remark: seed.remark ?? null,
      });
    } else {
      config.configName = seed.configName;
      config.configValue = seed.configValue;
      config.configGroup = seed.configGroup ?? null;
      config.remark = seed.remark ?? null;
    }
    await repo.save(config);
  }
}

interface RegionFlatSeed {
  code: string;
  name: string;
  parentCode: string;
  level: 1 | 2 | 3;
  sort: number;
}

async function upsertRegions(repo: Repository<SysRegionEntity>): Promise<void> {
  const filePath = join(__dirname, 'data/china-regions.flat.json');
  const seeds = JSON.parse(readFileSync(filePath, 'utf-8')) as RegionFlatSeed[];
  seeds.sort((a, b) => a.level - b.level || a.sort - b.sort);

  const codeToId = new Map<string, string>();
  codeToId.set('0', '0');

  for (const seed of seeds) {
    const parentId = codeToId.get(seed.parentCode) ?? '0';
    let region = await repo.findOne({ where: { code: seed.code } });
    if (!region) {
      region = repo.create({
        parentId,
        name: seed.name,
        code: seed.code,
        level: seed.level,
        sort: seed.sort,
        status: 1,
      });
    } else {
      region.parentId = parentId;
      region.name = seed.name;
      region.level = seed.level;
      region.sort = seed.sort;
    }
    region = await repo.save(region);
    codeToId.set(seed.code, region.id);
  }
}

async function upsertDevDicts(
  typeRepo: Repository<SysDictTypeEntity>,
  dataRepo: Repository<SysDictDataEntity>,
): Promise<void> {
  const typeByCode = new Map<string, SysDictTypeEntity>();

  for (const seed of DEV_DICT_TYPE_SEEDS) {
    let dictType = await typeRepo.findOne({ where: { code: seed.code } });
    if (!dictType) {
      dictType = typeRepo.create({
        name: seed.name,
        code: seed.code,
        status: seed.status,
        remark: seed.remark ?? null,
      });
    } else {
      dictType.name = seed.name;
      dictType.status = seed.status;
      dictType.remark = seed.remark ?? null;
    }
    dictType = await typeRepo.save(dictType);
    typeByCode.set(seed.code, dictType);
  }

  for (const seed of DEV_DICT_DATA_SEEDS) {
    const dictType = typeByCode.get(seed.typeCode);
    if (!dictType) {
      continue;
    }

    let dictData = await dataRepo.findOne({
      where: { typeId: dictType.id, value: seed.value },
    });
    if (!dictData) {
      dictData = dataRepo.create({
        typeId: dictType.id,
        label: seed.label,
        value: seed.value,
        sort: seed.sort,
        status: seed.status,
        remark: null,
      });
    } else {
      dictData.label = seed.label;
      dictData.sort = seed.sort;
      dictData.status = seed.status;
    }
    await dataRepo.save(dictData);
  }
}

async function upsertDevArticles(
  repo: Repository<ArticleEntity>,
  authorId: string,
): Promise<void> {
  for (const seed of DEV_ARTICLE_SEEDS) {
    let article = await repo.findOne({ where: { title: seed.title } });
    if (!article) {
      article = repo.create({
        title: seed.title,
        summary: seed.summary,
        content: seed.content,
        coverUrl: seed.coverUrl,
        status: seed.status,
        authorId,
        publishedAt: seed.publishedAt,
      });
    } else {
      article.summary = seed.summary;
      article.content = seed.content;
      article.coverUrl = seed.coverUrl;
      article.status = seed.status;
      article.authorId = authorId;
      article.publishedAt = seed.publishedAt;
    }
    await repo.save(article);
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
  const articleRepo = dataSource.getRepository(ArticleEntity);
  const dictTypeRepo = dataSource.getRepository(SysDictTypeEntity);
  const dictDataRepo = dataSource.getRepository(SysDictDataEntity);
  const configRepo = dataSource.getRepository(SysConfigEntity);
  const regionRepo = dataSource.getRepository(SysRegionEntity);

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

  await upsertRegions(regionRepo);

  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const isProduction = nodeEnv === 'production';

  // 默认 admin/admin123 与开发会员仅在非 production 写入，避免生产环境硬编码凭据
  if (!isProduction) {
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

    await upsertDevArticles(articleRepo, adminUser.id);
    await upsertDevDicts(dictTypeRepo, dictDataRepo);
    await upsertDevSiteConfigs(configRepo);
  }
}
