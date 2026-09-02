## 1. Server Profile API

- [x] 1.1 shared-types：`UpdateProfileDto`、`ChangePasswordDto` — 验证：编译通过
- [x] 1.2 `PUT /auth/me`、`PUT /auth/me/password` — 验证：e2e 改昵称/改密/旧密码错误 401

## 2. Server OSS Upload

- [x] 2.1 Upload 模块 + OSS/本地双模式 — 验证：单元测试 mock OSS
- [x] 2.2 `POST /files/upload` Admin 鉴权 — 验证：e2e 上传返回 url；Member token 403

## 3. Admin 个人中心

- [x] 3.1 个人中心页对接 API + 头像上传 — 验证：改昵称/头像/密码 smoke
- [x] 3.2 顶栏头像与 userStore 同步 — 验证：上传后顶栏更新

## 4. 集成验证

- [x] 4.1 server test + e2e、admin build — 验证：全绿
- [x] 4.2 openspec validate admin-profile-and-oss --strict — 验证：通过
