# Brainstorm Summary

- Change: stack-consolidation
- Date: 2026-09-03
- Status: 用户已确认（2026-09-03）

## 分类

**Architectural** — 跨 server/admin/shared-types/monorepo 的规范整合，改变接口契约与 DevEx 基线。

## 确认的技术方案（候选）

### Phase 1 — 契约与 DevEx
1. **Vite catch-all proxy**：非静态资源请求转发至 `VITE_API_PROXY_URL`；HTML 导航 bypass 走 SPA
2. **单一 HTTP**：仅 `api/request.ts`；废弃 `utils/http` 业务调用
3. **Env 统一**：`.env.example` 端口 3001；production 设 `VITE_API_BASE_URL`
4. **shared-types watch**：根 `dev` 并行 `tsc --watch` + `postinstall build`

### Phase 2 — 后端加固
1. **Guard 集中**：AppModule 注册 JWT → Admin/Member → Permission；删除 RolesGuard
2. **@AdminOnly()**：替代 AdminAuthGuard 路径前缀白名单
3. **ID string**：全模块 mapper `String(id)`；shared-types 对齐
4. **RBAC 真分页**：QueryBuilder skip/take + ListDto
5. **Permission 缓存**：request-scoped Map
6. **ValidationPipe**：forbidNonWhitelisted + 校验错误格式化

### Phase 3 — Admin 瘦身
1. 删除 `filterPaginated`；对接服务端分页
2. 类型迁移至 shared-types；隐藏占位页
3. 品牌 Nova Stack

### Phase 4 — 工程化
1. docker-compose（MySQL + Redis）
2. 根 build/test；README 更新；ESLint 扩展

## 关键取舍与风险

| 取舍 | 选择 | 风险缓解 |
|------|------|----------|
| ID 类型 | 全局 string | grep 替换 + e2e |
| Proxy 策略 | catch-all | bypass text/html |
| Guard 重构 | 装饰器 opt-in | e2e auth/rbac 全跑 |
| Dashboard | 保留 mock/隐藏 | 不接新 API |

## 测试策略

- 单元：shared-types、ValidationPipe、Permission 缓存
- E2E：auth、rbac 分页、dict、upload 权限、file upload
- 构建：admin production build
- 手动：dev 新路由无需改 vite.config

## Spec Patch

无额外 patch（openspec delta 已覆盖 7 个 capability）
