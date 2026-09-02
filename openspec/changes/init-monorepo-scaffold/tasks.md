## 1. Monorepo 根工程

- [x] 1.1 创建根 `package.json`、`pnpm-workspace.yaml`，纳入 `admin`、`uni-app`、`server`、`packages/*` — 验证：`pnpm install` 成功
- [x] 1.2 配置根级 eslint + prettier + 共享 tsconfig — 验证：根 lint 脚本可执行
- [x] 1.3 编写根 `README.md`（目录说明、前置依赖、启动步骤） — 验证：文档包含三端分工与技术栈

## 2. 共享类型包

- [x] 2.1 创建 `packages/shared-types`，导出 `ApiResponse`、`PaginationParams`、`PaginationResult`、`ErrorCode` — 验证：包可被 workspace 引用且 `tsc` 通过
- [x] 2.2 在 server/admin/uni-app 的 package.json 中添加 `shared-types: workspace:*` 依赖 — 验证：三端 import 共享类型编译通过

## 3. Server 脚手架

- [x] 3.1 初始化 NestJS 工程（`server/`），配置 `@nestjs/config` 环境变量加载 — 验证：`pnpm --filter server start:dev` 启动成功
- [x] 3.2 集成 TypeORM + MySQL8 连接配置与 Health 模块 — 验证：配置有效 DB 时启动无连接错误
- [x] 3.3 集成 Redis（ioredis）连接配置 — 验证：配置有效 Redis 时启动无连接错误
- [x] 3.4 启用 Swagger（@nestjs/swagger）并注册示例 Controller — 验证：Swagger UI 可访问
- [x] 3.5 创建 AuthModule 占位（JWT strategy/guard/service 骨架，不含完整登录逻辑） — 验证：模块加载无报错
- [x] 3.6 创建 RbacModule 占位（RolesGuard/decorator 骨架） — 验证：模块加载无报错
- [x] 3.7 启用全局 ValidationPipe（class-validator） — 验证：非法 DTO 返回 400
- [x] 3.8 提供 `server/.env.example` — 验证：包含 DB/Redis/JWT 占位变量

## 4. Admin 脚手架

- [x] 4.1 初始化 Vue3 + Vite + TS 工程（`admin/`），集成 Arco Design Pro 基础布局 — 验证：开发服务器可访问
- [x] 4.2 配置 VueRouter4（login、layout、404 路由） — 验证：路由跳转正常
- [x] 4.3 集成 Pinia（user/app store 占位） — 验证：store 可被组件访问
- [x] 4.4 封装 Axios request（baseURL、拦截器占位） — 验证：可发起 HTTP 请求
- [x] 4.5 集成 UnoCSS — 验证：页面可使用 UnoCSS 类名
- [x] 4.6 提供 `admin/.env.example`（API baseURL） — 验证：环境变量文档完整

## 5. Uni-app 脚手架

- [x] 5.1 初始化 uni-app Vue3 + Vite 工程（`uni-app/`） — 验证：H5 开发模式可预览
- [x] 5.2 集成 uview-plus 并创建首页展示组件 — 验证：uview 组件正常渲染
- [x] 5.3 集成 Pinia 与请求封装（对齐 admin baseURL 配置） — 验证：request 可调用
- [x] 5.4 验证微信小程序构建命令 — 验证：`build:mp-weixin` 生成产物无致命错误

## 6. 集成验证

- [x] 6.1 根级 `pnpm dev` 或等价脚本同时启动 server + admin（uni-app 可选） — 验证：三端可并行开发
- [x] 6.2 运行 `openspec validate init-monorepo-scaffold --strict` — 验证：change 校验通过
