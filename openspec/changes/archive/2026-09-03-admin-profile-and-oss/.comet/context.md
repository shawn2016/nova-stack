# Comet Design Handoff

- Change: admin-profile-and-oss
- Phase: design
- Mode: compact
- Context hash: b465f1b116f98f2264bd48b032408d4ffe8935148a7b4e6dd1a2cb4335e41c04

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/admin-profile-and-oss/proposal.md

- Source: openspec/changes/admin-profile-and-oss/proposal.md
- Lines: 1-35
- SHA256: bd48d47bd6848206fca3bed61dcde65984e13205f00e767634e33de88870850d

```md
## Why

Admin 基座已具备登录/退出与 RBAC，但**个人中心仍是 art-design-pro 模板占位**（假数据、改密/头像未接 API）。头像与后续富文本/配置图上传也缺少统一 **OSS 文件服务**。这是系统基座 P0 能力，需在引入字典/审计等业务模块前补齐。

## What Changes

- **Server — 个人资料 API**：`PUT /auth/me` 更新 nickname/avatar；`PUT /auth/me/password` 修改当前用户密码（校验旧密码）
- **Server — OSS 上传**：接入阿里云 OSS（可配置），提供 Admin 鉴权下的文件上传接口，返回可访问 URL
- **Admin — 个人中心联调**：`/system/user-center` 对接真实 API；头像上传组件；改密表单提交
- **shared-types**：ProfileUpdateDto、ChangePasswordDto、UploadResult 等
- **环境变量**：OSS 相关配置项写入 `.env.example`

## Capabilities

### New Capabilities

- `file-upload-api`: Admin 鉴权下的 OSS 文件上传 API
- `admin-profile-ui`: Admin 个人中心页（资料编辑、改密、头像上传）

### Modified Capabilities

- `auth-api`: 扩展当前管理员资料更新与改密 API

## Impact

- **主要影响**：`server/src/modules/auth/`、`server/src/modules/upload/`（新建）、`admin/src/views/system/user-center/`、`packages/shared-types/`
- **依赖**：阿里云 OSS 账号（开发可 mock/本地 MinIO 备选，design 阶段定案）
- **不影响**：RBAC CRUD、Member 端、字典/审计/站点配置（后续 change）

## Non-Goals

- uni-app 个人中心（`uni-member-base` change）
- 系统字典、登录/操作审计、站点配置
- 多文件管理、图片裁剪 CDN、私有桶 signed URL 高级策略（MVP 仅上传+URL）
- 移除 demo 文章业务模块

```

## openspec/changes/admin-profile-and-oss/design.md

- Source: openspec/changes/admin-profile-and-oss/design.md
- Lines: 1-92
- SHA256: 239090a43ae04385ba25af776ebbfa4c1d2327945b8ca3ed0989c221f84ca3e8

[TRUNCATED]

```md
## Context

基座 change 批次 `scaffold-system-base` 第 1 项。当前 `GET /auth/me` 已返回 AdminInfo（含 avatar 字段），`sys_user.avatar` 可空；个人中心页为模板 demo。art-design-pro 模板中 wangEditor 等组件期望 `/api/common/upload/*`，本 change 提供统一 OSS 上传替代。

## Goals / Non-Goals

**Goals:**
- 当前登录管理员可更新 nickname、avatar URL
- 当前登录管理员可修改自己的密码（需旧密码）
- 提供 OSS 上传接口，Admin Token 鉴权，返回公开 URL
- Admin 个人中心页真实联调

**Non-Goals:**
- 管理员在「用户管理」中改他人密码（已有创建用户含密码，编辑不改密码策略保持）
- Member 端 profile/OSS
- 文件列表/删除/分片上传

## Decisions

### 1. OSS 提供商：阿里云 OSS

**选择**：`ali-oss` SDK，服务端直传（multipart → OSS put）

**理由**：国内常用，与用户需求「对接 OSS」一致

**备选**：MinIO 兼容 S3 — 仅当 design review 时无 OSS 凭证再考虑 dev mock

**配置**（`.env`）：
```
OSS_REGION=oss-cn-hangzhou
OSS_BUCKET=nova-stack-dev
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=
OSS_PUBLIC_BASE_URL=   # 可选 CDN 域名，默认可读 bucket 域名
```

开发环境：`OSS_ENABLED=false` 时回退本地 `uploads/` 静态目录 + `/uploads/*` 静态服务（便于无 OSS 联调）

### 2. 上传 API

```
POST /files/upload
Content-Type: multipart/form-data
Field: file
Auth: Admin JWT
Response: { url, key, size, mimeType }
```

- 限制：单文件 ≤ 5MB；允许 image/* 与常见文档（MVP 头像为主）
- 对象 key：`admin/{userId}/{uuid}.{ext}`

### 3. Profile API

```
PUT /auth/me
Body: { nickname?: string, avatar?: string }

PUT /auth/me/password
Body: { oldPassword: string, newPassword: string }
```

- 改密成功后可选：使当前 refresh token 失效，强制重新登录（MVP：仅改 hash，不强制登出）
- avatar 为 OSS 返回的 URL 字符串，不做二次校验

### 4. Admin 个人中心

- 复用现有 `views/system/user-center/index.vue` 布局，删除 demo 字段（邮箱/地址等模板字段）
- 保留：昵称、头像上传、改密三块
- 头像：`ElUpload` + `POST /files/upload` → 回填 avatar URL → `PUT /auth/me`
- 顶部用户菜单头像同步 `userStore` 刷新

### 5. 路由

- 个人中心 `/system/user-center` 保持模板静态路由（hidden），不走 RBAC 菜单 seed 变更

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 无 OSS 凭证无法 dev | `OSS_ENABLED=false` 本地存储回退 |

```

Full source: openspec/changes/admin-profile-and-oss/design.md

## openspec/changes/admin-profile-and-oss/tasks.md

- Source: openspec/changes/admin-profile-and-oss/tasks.md
- Lines: 1-19
- SHA256: 6c9c893c1d105c0641326ca43d588df33dd1b0b0531f0d2a18bb34563e835e9d

```md
## 1. Server Profile API

- [ ] 1.1 shared-types：`UpdateProfileDto`、`ChangePasswordDto` — 验证：编译通过
- [ ] 1.2 `PUT /auth/me`、`PUT /auth/me/password` — 验证：e2e 改昵称/改密/旧密码错误 401

## 2. Server OSS Upload

- [ ] 2.1 Upload 模块 + OSS/本地双模式 — 验证：单元测试 mock OSS
- [ ] 2.2 `POST /files/upload` Admin 鉴权 — 验证：e2e 上传返回 url；Member token 403

## 3. Admin 个人中心

- [ ] 3.1 个人中心页对接 API + 头像上传 — 验证：改昵称/头像/密码 smoke
- [ ] 3.2 顶栏头像与 userStore 同步 — 验证：上传后顶栏更新

## 4. 集成验证

- [ ] 4.1 server test + e2e、admin build — 验证：全绿
- [ ] 4.2 openspec validate admin-profile-and-oss --strict — 验证：通过

```

## openspec/changes/admin-profile-and-oss/specs/admin-profile-ui/spec.md

- Source: openspec/changes/admin-profile-and-oss/specs/admin-profile-ui/spec.md
- Lines: 1-30
- SHA256: aafac210613cb84644f2a413d49ab11269f59c8e4b56933de38249defec1ef41

```md
## ADDED Requirements

### Requirement: 个人中心资料编辑
Admin MUST 提供个人中心页，展示当前登录用户昵称与头像，并允许保存至 `PUT /auth/me`。

#### Scenario: 加载当前用户
- **WHEN** 已登录用户访问个人中心
- **THEN** 表单展示 `GET /auth/me` 返回的 nickname、avatar

#### Scenario: 保存资料
- **WHEN** 用户修改昵称并保存
- **THEN** 调用 `PUT /auth/me` 成功并提示；顶栏用户信息同步更新

### Requirement: 头像上传
个人中心 MUST 提供头像上传，调用 `POST /files/upload` 后将返回 URL 写入 profile。

#### Scenario: 上传头像
- **WHEN** 用户选择图片并上传
- **THEN** 预览更新；保存后 avatar 持久化

### Requirement: 修改密码
个人中心 MUST 提供改密表单（当前密码、新密码、确认密码），调用 `PUT /auth/me/password`。

#### Scenario: 改密成功
- **WHEN** 三次输入一致且当前密码正确
- **THEN** 提示成功；可选引导重新登录

#### Scenario: 确认密码不一致
- **WHEN** 新密码与确认密码不同
- **THEN** 前端校验阻止提交

```

## openspec/changes/admin-profile-and-oss/specs/auth-api/spec.md

- Source: openspec/changes/admin-profile-and-oss/specs/auth-api/spec.md
- Lines: 1-23
- SHA256: e9100d85d5fd775050d32e0cedeb7d0d66b5124e96966bd76c51d028dbc40234

```md
## ADDED Requirements

### Requirement: 当前管理员更新资料
系统 MUST 提供 `PUT /auth/me`，允许当前登录管理员更新 `nickname` 与 `avatar`（URL 字符串）。

#### Scenario: 更新昵称成功
- **WHEN** 携带有效 Admin Token 提交 `{ nickname: "新昵称" }`
- **THEN** 返回 200 及更新后的管理员信息

#### Scenario: 更新头像 URL
- **WHEN** 提交合法 avatar URL（通常来自文件上传接口）
- **THEN** 持久化至 sys_user.avatar 并在后续 `GET /auth/me` 中返回

### Requirement: 当前管理员修改密码
系统 MUST 提供 `PUT /auth/me/password`，校验旧密码后更新 passwordHash。

#### Scenario: 改密成功
- **WHEN** 提交正确 oldPassword 与符合长度要求的 newPassword
- **THEN** 返回 200；使用新密码可登录

#### Scenario: 旧密码错误
- **WHEN** oldPassword 不正确
- **THEN** 返回 400 或 401，不修改密码

```

## openspec/changes/admin-profile-and-oss/specs/file-upload-api/spec.md

- Source: openspec/changes/admin-profile-and-oss/specs/file-upload-api/spec.md
- Lines: 1-27
- SHA256: a6283c62fcf6252688412e4a0a7448078921ccb7d1618e7e602d9ac2dc86042d

```md
## ADDED Requirements

### Requirement: Admin 文件上传
系统 MUST 提供 `POST /files/upload`，接受 multipart 单文件，需 Admin JWT 鉴权，返回可访问 URL。

#### Scenario: 上传成功
- **WHEN** Admin 提交合法图片文件（≤ 配置大小限制）
- **THEN** 返回 201 及 `{ url, key, size, mimeType }`

#### Scenario: Member Token 拒绝
- **WHEN** Member Token 请求上传
- **THEN** 返回 403

#### Scenario: 文件过大或类型不允许
- **WHEN** 超过大小限制或非允许 MIME
- **THEN** 返回 400

### Requirement: OSS 配置与本地回退
系统 MUST 支持通过环境变量配置阿里云 OSS；当 OSS 未启用时 MUST 提供本地存储回退以便开发联调。

#### Scenario: OSS 启用
- **WHEN** `OSS_ENABLED=true` 且凭证有效
- **THEN** 文件写入 OSS 并返回 OSS/CDN URL

#### Scenario: OSS 禁用
- **WHEN** `OSS_ENABLED=false`
- **THEN** 文件写入本地目录并通过 HTTP 静态路径可访问

```
