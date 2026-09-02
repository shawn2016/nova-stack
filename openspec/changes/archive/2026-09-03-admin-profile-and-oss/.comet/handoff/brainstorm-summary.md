# Brainstorm Summary

- Change: admin-profile-and-oss
- Date: 2026-09-03
- Status: 用户已确认

## Confirmed Technical Approach

- **Profile API**：`PUT /auth/me`（nickname、avatar URL）；`PUT /auth/me/password`（oldPassword + newPassword，bcrypt）
- **Upload**：`POST /files/upload`，Admin JWT；`StorageService` 抽象，**OSS 与本地双实现**
- **Dev 默认**：`OSS_ENABLED=false`，本地 `uploads/` + Nest 静态 `/uploads/*`（用户无阿里云 OSS 不阻塞）
- **Prod**：`OSS_ENABLED=true` + `ali-oss` SDK
- **Admin UI**：精简 `user-center` 模板页，ElUpload 头像 + 改密；顶栏 `ArtUserMenu` 读真实 avatar

## Key Trade-offs and Risks

| 项 | 决策 |
|----|------|
| 无 OSS 凭证 | 本地回退，上线再切 OSS |
| avatar 存 URL | MVP 不做文件元数据表 |
| 改密后 | 不强制登出 refresh（与 RBAC MVP 一致） |
| 上传限制 | 5MB，image/* 为主 |

## Testing Strategy

- shared-types 单元测试（DTO）
- server unit：StorageService mock、AuthService updateProfile/changePassword
- server e2e：profile CRUD、改密、upload 403/201、本地存储模式
- admin build + smoke 个人中心

## Spec Patches

- 无（Open delta spec 已覆盖；design 补充 OSS_ENABLED 本地回退已在 design.md Open Questions 关闭）
