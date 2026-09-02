---
change: admin-profile-and-oss
design-doc: docs/superpowers/specs/2026-09-03-admin-profile-and-oss-design.md
base-ref: 72ccaff7527cde290399960a1f1f99c4a78dcc98
---

# admin-profile-and-oss 实施计划

> **For agentic workers:** Use subagent-driven-development or executing-plans.

**Goal:** Admin 个人中心真实联调（资料/改密/头像）+ OSS/本地双模式文件上传。

**Architecture:** shared-types → Profile API → Upload 模块（Local 默认）→ Admin user-center → 集成验证

**Spec:** docs/superpowers/specs/2026-09-03-admin-profile-and-oss-design.md

## Global Constraints

- 产物语言：zh-CN
- 分支：`comet/admin-profile-and-oss`
- Dev 默认 `OSS_ENABLED=false`
- 不动 uni-app / Member 端
- TDD：server e2e 先行

---

## Task 1: shared-types + Profile API

- [x] 1.1 DTO：UpdateProfileDto、ChangePasswordDto、UploadResult — 验证：vitest
- [x] 1.2 `PUT /auth/me`、`PUT /auth/me/password` — 验证：e2e
- [x] 1.3 旧密码错误、nickname 更新 — 验证：e2e 边界

## Task 2: Upload 模块

- [x] 2.1 StorageService 抽象 + LocalStorageService — 验证：unit
- [x] 2.2 OssStorageService（OSS_ENABLED 时）— 验证：unit mock
- [x] 2.3 `POST /files/upload` + AdminAuthGuard `/files` — 验证：e2e local 模式
- [x] 2.4 静态 `/uploads/*` + env 文档 — 验证：上传后可 GET 文件

## Task 3: Admin 个人中心

- [ ] 3.1 `api/auth` + `api/upload` — 验证：类型编译
- [ ] 3.2 精简 user-center 页 + 头像上传 + 改密 — 验证：dev smoke
- [ ] 3.3 ArtUserMenu 真实头像 + vite 代理 — 验证：上传后顶栏更新

## Task 4: 集成验证

- [ ] 4.1 server test + e2e、admin build — 验证：全绿
- [ ] 4.2 openspec validate admin-profile-and-oss --strict — 验证：通过
