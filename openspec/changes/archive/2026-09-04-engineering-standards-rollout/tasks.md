## 1. 规范文档

- [x] 更新 `docs/standards/README.md`（存量策略、标杆路径）
- [x] 新增 `docs/standards/uni-app.md`
- [x] 新增 `docs/standards/examples/entity-fields.example.ts`
- [x] 更新 `ai-checklist.md` / `comet-verify` Skill

## 2. Entity 迁移

- [x] `article.entity.ts`
- [x] `member-user.entity.ts`
- [x] `sys-config.entity.ts`
- [x] `sys-dict-*.entity.ts`
- [x] `sys-login-log.entity.ts`
- [x] `sys-menu.entity.ts`
- [x] `sys-oper-log.entity.ts`
- [x] `sys-permission.entity.ts`
- [x] `sys-role*.entity.ts`
- [x] `sys-user*.entity.ts`

## 3. OpenSpec

- [x] delta `monorepo-workspace` 引用 `docs/standards/`

## 4. 验证

- [x] `pnpm --filter @nova/server test`
- [x] 根 `pnpm lint`（已知 comet 脚本噪声，见 design §6）
