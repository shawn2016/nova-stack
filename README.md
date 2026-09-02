# nova-stack

基于 pnpm monorepo 的全栈多端脚手架，包含管理后台、移动端应用与后端服务。

## Monorepo 结构

```
nova-stack/
├── admin/                  # @nova/admin — Vue3 + Vite 管理后台
├── uni-app/                # @nova/uni-app — uni-app 多端应用
├── server/                 # @nova/server — NestJS 后端服务
├── packages/
│   └── shared-types/       # @nova/shared-types — 三端共享 TypeScript 类型
├── pnpm-workspace.yaml     # pnpm workspace 配置
├── package.json            # 根脚本与开发依赖
├── tsconfig.base.json      # 共享 TypeScript 配置
├── eslint.config.js        # ESLint 扁平配置
└── README.md
```

## 前置依赖

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | 20+ | 运行时 |
| pnpm | 最新稳定版 | 包管理与 workspace |
| MySQL | 8.x | 后端数据库 |
| Redis | 6+ | 缓存与会话 |

## 本地开发

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

各子包提供 `.env.example`，复制为 `.env` 并按需修改：

```bash
cp server/.env.example server/.env
cp admin/.env.example admin/.env
```

### 3. 启动服务

确保 MySQL 与 Redis 已运行，然后：

```bash
# 并行启动 server + admin
pnpm dev

# 并行启动 server + admin + uni-app (H5)
pnpm dev:all
```

### 4. 代码规范

```bash
pnpm lint      # ESLint 检查
pnpm format    # Prettier 格式化
```

## 技术栈

| 端 | 技术 |
|----|------|
| server | NestJS, TypeORM, MySQL, Redis, Swagger, JWT/RBAC 占位 |
| admin | Vue3, Vite, Arco Design, Pinia, UnoCSS, Axios |
| uni-app | Vue3, Vite, uview-plus, Pinia |
| packages | TypeScript 共享类型 |

## 包命名

所有 workspace 子包使用 `@nova/*` 命名空间，例如 `@nova/server`、`@nova/admin`。
