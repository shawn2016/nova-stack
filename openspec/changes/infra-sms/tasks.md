## 1. 数据模型与 shared-types

- [ ] 1.1 sys_sms_channel / sys_sms_template / sys_sms_log 实体 + 注册 — 验证：entities.spec
- [ ] 1.2 shared-types Sms DTO — 验证：test

## 2. Server 发送与 API

- [ ] 2.1 SmsProvider + MockProvider + SmsService — 验证：unit/e2e
- [ ] 2.2 通道/模板 CRUD + send + logs API — 验证：e2e
- [ ] 2.3 seed 权限/菜单/示例通道模板 — 验证：seed.spec

## 3. Admin UI

- [ ] 3.1 短信管理页（通道/模板/日志/测试发送） — 验证：admin build

## 4. 集成验证

- [ ] 4.1 全量 test/build + openspec validate — 验证：通过
