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
