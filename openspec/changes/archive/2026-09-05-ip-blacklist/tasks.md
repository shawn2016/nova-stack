# ip-blacklist 任务清单

## 1. 数据模型与 shared-types

- [x] 1.1 新增 `IpBlacklist` Entity（ip、source、status、expiresAt、remark、createdBy）
- [x] 1.2 `@nova/shared-types` 类型与 DTO（列表/创建/响应）
- [x] 1.3 seed：权限 `security:ip-blacklist:*` + 菜单 `/system/ip-blacklist`

## 2. Server API 与拦截

- [x] 2.1 `IpBlacklistModule`：Service（CRUD + Redis 同步 + 白名单）
- [x] 2.2 `IpBlacklistMiddleware` 全局注册，403 拦截
- [x] 2.3 登录失败计数与自动封禁（接入 `AuthService.login`）
- [x] 2.4 `GET/POST/DELETE/PUT` `/security/ip-blacklist` + RBAC
- [x] 2.5 配置项：阈值、窗口、封禁时长、白名单（env 或常量 MVP）

## 3. Admin UI

- [x] 3.1 `/system/ip-blacklist` 列表页（ArtListPanel + search）
- [x] 3.2 新增/删除对话框，`v-permission` 与后端码一致
- [x] 3.3 API 封装与路由注册

## 4. 测试与验证

- [x] 4.1 API e2e：手动封禁 → 403；解除 → 恢复；自动封禁触发
- [x] 4.2 `e2e/specs/modules/ip-blacklist.spec.ts` 浏览器场景 + inventory 登记
- [x] 4.3 `pnpm lint` + server test

## 5. 验收标准

- [x] 暴力登录触发自动封禁，该 IP 后续 API 403
- [x] Admin 手动添加 IP 立即生效
- [x] Admin 删除记录后 IP 恢复
- [x] 本地回环地址（loopback）不被自动封禁
