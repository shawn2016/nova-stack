---
comet_change: admin-profile-and-oss
role: technical-design
canonical_spec: openspec
archived-with: 2026-09-03-admin-profile-and-oss
status: final
---

# admin-profile-and-oss 深度技术设计

## 1. 架构总览

```
Admin 个人中心                    Server
─────────────                    ──────
user-center.vue ──PUT /auth/me ──► AuthService.updateProfile
ElUpload ──POST /files/upload ──► UploadController
                                 ├─ OSSStorageService (OSS_ENABLED=true)
                                 └─ LocalStorageService (OSS_ENABLED=false)
ArtUserMenu ◄── userStore ◄── GET /auth/me
```

**实施顺序**：shared-types → Profile API + e2e → Upload 模块 + e2e → Admin 个人中心联调 → 集成验证

## 2. Server — Profile API

### 2.1 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| PUT | /auth/me | 更新 nickname、avatar（当前用户） |
| PUT | /auth/me/password | 旧密码校验后更新 passwordHash |

- 无需 `@RequirePermission`（自身资料）
- 仍走 Admin JWT + AdminAuthGuard

### 2.2 DTO（shared-types）

```typescript
export interface UpdateProfileDto {
  nickname?: string;
  avatar?: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}
```

### 2.3 业务规则

- `newPassword` 长度 ≥ 6（与创建用户一致）
- `oldPassword` 错误 → 400 `Invalid old password`
- 更新 profile 后 `GET /auth/me` 立即反映
- **不改** refresh token / 不强制登出

### 2.4 AuthService 扩展

在 `auth.service.ts` 增加 `updateProfile(userId, dto)`、`changePassword(userId, dto)`，复用 `SysUserEntity` repository。

## 3. Server — Upload 模块

### 3.1 模块结构

```
server/src/modules/upload/
├── upload.module.ts
├── upload.controller.ts      # POST /files/upload
├── upload.service.ts         # 校验 + 委托 StorageService
├── storage/
│   ├── storage.interface.ts
│   ├── oss-storage.service.ts
│   └── local-storage.service.ts
└── dto/upload-result.dto.ts  # 复用 shared-types
```

### 3.2 Storage 抽象

```typescript
interface StorageService {
  upload(file: Express.Multer.File, key: string): Promise<UploadResult>;
}
```

- **LocalStorageService**：写入 `{projectRoot}/uploads/{key}`，URL = `{APP_PUBLIC_URL}/uploads/{key}`
- **OssStorageService**：`ali-oss` put，`url = OSS_PUBLIC_BASE_URL || bucket 默认域名`

Provider 选择：`OSS_ENABLED === 'true'` → OSS，否则 Local。

### 3.3 Upload API

```
POST /files/upload
Content-Type: multipart/form-data
Field: file
Auth: Admin JWT（AdminAuthGuard 扩展 /files 前缀）
Response: ApiResponse<UploadResult>
```

**校验**：
- 最大 5MB
- MIME：`image/jpeg|png|gif|webp`（MVP 头像）
- key：`admin/{userId}/{uuid}{ext}`

### 3.4 静态文件

`main.ts` 或 `AppModule`：`app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' })`

`AdminAuthGuard` 扩展：`path.startsWith('/files')` 需 Admin token。

### 3.5 环境变量

```env
OSS_ENABLED=false
OSS_REGION=oss-cn-hangzhou
OSS_BUCKET=
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=
OSS_PUBLIC_BASE_URL=
APP_PUBLIC_URL=http://localhost:3001
UPLOAD_MAX_SIZE=5242880
```

## 4. Admin — 个人中心

### 4.1 页面改造 `views/system/user-center/index.vue`

**移除**：模板 demo 字段（邮箱、地址、标签、性别等假数据）

**保留/新增**：
- 昵称（绑定 `nickname`）
- 头像：`ElUpload` → `POST /files/upload` → 预览 → 保存时 `PUT /auth/me`
- 改密：当前密码、新密码、确认密码 → `PUT /auth/me/password`

### 4.2 API 层 `admin/src/api/auth.ts`

```typescript
updateProfile(data: UpdateProfileDto)
changePassword(data: ChangePasswordDto)
```

新增 `admin/src/api/upload.ts`：`uploadFile(file: File)`

### 4.3 userStore

- `fetchUserInfo()` 保存后调用，刷新顶栏
- `ArtUserMenu.vue`：avatar 用 `userInfo.avatar || 默认图`

### 4.4 Vite 代理

`vite.config.ts` 增加 `/files`、`/uploads` 代理至 `VITE_API_PROXY_URL`

## 5. 测试策略

| 层 | 范围 |
|----|------|
| shared-types | UpdateProfileDto、ChangePasswordDto、UploadResult |
| server unit | changePassword 旧密码错误、updateProfile |
| server unit | LocalStorageService 写入 |
| server e2e | PUT /auth/me、PUT /auth/me/password、POST /files/upload（local 模式） |
| server e2e | member token → /files/upload 403 |
| admin | build + 手动 smoke 个人中心 |

e2e 使用 `OSS_ENABLED=false`，不依赖外部 OSS。

## 6. 依赖

- `ali-oss`（optional runtime，OSS 模式才用）
- `@nestjs/platform-express` multer（已有）

## 7. 非目标

- Member 端 profile/upload
- 文件记录表、删除、列表
- wangEditor 全量上传改造（本 change 仅个人中心头像；editor 可后续复用 `/files/upload`）
