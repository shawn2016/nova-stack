# AI 写码自检清单

Agent **开始写码前**选对应「写码前」节阅读；**声称完成前**必须勾选「写码后」全部适用项。

---

## 写码前（必读）

### 任意代码改动

- [ ] 已读 [`AGENTS.md`](../../AGENTS.md) 铁律表
- [ ] 已读将要修改目录的**相邻文件**，风格对齐
- [ ] 已知标杆文件（见 [README §按场景](./README.md#按场景读哪份)）

### 新需求 / 新 Comet change

- [ ] 已在**主仓库**从 `main` 创建分支（`comet/<name>` 或 `feat/` / `fix/`），**未使用 worktree**
- [ ] **未向用户询问**分支名
- [ ] 已读 [git.md](./git.md)

### 新 Admin CRUD 页

- [ ] 已打开 `admin/src/views/system/user/index.vue`
- [ ] 已打开 `admin/src/views/system/user/modules/user-dialog.vue`
- [ ] 已读 [admin-ui.md](./admin-ui.md)

### 新 Server 模块 / API

- [ ] 已读 [server.md](./server.md)
- [ ] API 形状已在或即将写入 `@nova/shared-types`

### 新数据库表

- [ ] 已读 [database.md](./database.md)
- [ ] Design 含字段表（字段 / 类型 / 可空 / 备注）

---

## 写码后（完成前勾选）

### 通用

- [ ] 仅最小 diff，无无关重构
- [ ] 未提交 `.env`、密钥、本地 uploads
- [ ] 已跑 [AGENTS.md §提交前验证](../../AGENTS.md#提交前验证) 中**与改动包相关**的命令且 exit 0

### shared-types（若改动）

- [ ] `packages/shared-types/src/index.ts` 已导出
- [ ] 已执行 `pnpm --filter @nova/shared-types build`
- [ ] server DTO / admin api 字段与类型一致

### server（若改动）

- [ ] 写接口有 `@RequirePermission`，码与 seed 一致
- [ ] DTO 有 `class-validator`
- [ ] 新权限已写入 `server/src/database/seeds/init.seed.ts` → `PERMISSION_SEEDS`
- [ ] 新菜单页已写入 `MENU_SEEDS`（含 `permissionCode`、`component` 路径）
- [ ] 涉及用户列表/部门/审计/会话时评估是否接 `DataScopeService`
- [ ] 新 Entity 已在 `entities/index.ts` 导出
- [ ] 业务字段见 [database.md §字段备注](./database.md#字段备注)

### admin（若改动）

- [ ] CRUD 列表为 `ArtListPanel` + `useTable`（非表格页除外，见 admin-ui）
- [ ] 表单在 `modules/*-dialog.vue`，`ElDialog` `480px` + `align-center`
- [ ] 写操作按钮有 `v-permission`，与后端码一致
- [ ] 删除有 `ElMessageBox.confirm`
- [ ] 类型来自 `@nova/shared-types`，请求走 `admin/src/api/`

### 注释（若新增 util / Entity / 复杂逻辑）

- [ ] Entity：状态/外键/可空/非 obvious 字段有 JSDoc + `@Column({ comment })`（见 [comments.md](./comments.md)）
- [ ] 导出 util 函数有一行中文 JSDoc

### 仅在被要求 commit 时

- [ ] message 中文：`feat:` / `fix:` / `chore:` + 简述（[git.md](./git.md)）

### Comet Archive / 功能完成

- [ ] 已在功能分支完成 archive commit（若走 Comet）
- [ ] 已 `git checkout main` 并 **merge** 功能分支（不询问用户是否 merge）
- [ ] push / PR 仅在被用户要求时执行

---

## 快速否决（出现即返工）

| 问题 | 处理 |
|------|------|
| 新 API 无权限装饰器 | 补 `@RequirePermission` + seed |
| Admin 新页裸 `ElTable` 手写分页 | 改为 `ArtListPanel` + `useTable` |
| 改 API 未改 shared-types | 先改类型再改实现 |
| 枚举/外键字段无备注 | 补 JSDoc + comment |
| 弹窗堆在 index.vue（CRUD） | 抽到 `modules/*-dialog.vue` |

---

## Comet Verify 附加

Classic Verify 阶段除测试外，在验证报告中增加一节 **「编码规范」**，复制上表已勾选项；未勾满且非用户明确豁免 → 不得 `verify_result: pass`。
