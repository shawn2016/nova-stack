## 1. 数据模型与 shared-types

- [x] 1.1 `SysLoginLogEntity`、`SysOperLogEntity` — 验证：建表
- [x] 1.2 shared-types 审计 DTO — 验证：编译

## 2. Server 审计写入与查询

- [ ] 2.1 登录日志写入（AuthService） — 验证：e2e 登录成功/失败有记录
- [ ] 2.2 OperLogInterceptor + 查询 API — 验证：e2e 写操作有 log + 列表 API

## 3. Seed

- [ ] 3.1 permissions + 菜单 — 验证：seed 测试

## 4. Admin 审计 UI

- [ ] 4.1 审计日志页（双 Tab） — 验证：admin build

## 5. 集成验证

- [ ] 5.1 全量 test/e2e/build + openspec validate — 验证：通过
