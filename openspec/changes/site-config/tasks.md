## 1. 数据模型与 shared-types

- [x] 1.1 `SysConfigEntity` + 导出 — 验证：TypeORM 建表
- [x] 1.2 shared-types 配置 DTO — 验证：编译通过

## 2. Server 配置 API

- [x] 2.1 SiteConfigModule CRUD + by-key — 验证：e2e CRUD 与读取
- [x] 2.2 重复 key、Member 403 — 验证：e2e 边界

## 3. Seed

- [x] 3.1 permissions + 菜单 + 示例配置 — 验证：seed 测试

## 4. Admin 站点配置 UI

- [x] 4.1 api + 管理页 — 验证：admin build
- [x] 4.2 v-permission — 验证：按钮受控

## 5. 集成验证

- [x] 5.1 server test + e2e、admin build — 验证：全绿
- [x] 5.2 openspec validate site-config --strict — 验证：通过
