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
| 上传安全 | Admin 鉴权 + MIME/大小校验 |
| avatar 存外链 URL | MVP 可接受；后续可加文件表 |

## Migration

- 无破坏性迁移；seed 不变
- 已有用户 avatar 为空，上传后写入

## Open Questions

- [x] 无 OSS 时 dev 使用本地存储回退（已确认，默认 `OSS_ENABLED=false`）
- [ ] 生产 OSS bucket 是否公共读？（MVP 假设 public-read 或 CDN 域名）
