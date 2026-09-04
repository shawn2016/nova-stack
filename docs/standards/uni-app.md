# uni-app 规范（简版）

## MUST

- 类型从 `@nova/shared-types` 导入，不在页面重复定义 API DTO
- 环境：`uni-app/.env.example` → `.env`；API 基址 `VITE_API_BASE_URL`
- 请求封装复用项目现有 `api/` 层（与 admin 共享契约）

## SHOULD

- 新页面放在 `uni-app/src/pages/` 对应业务目录
- 改 shared-types 后：`pnpm --filter @nova/shared-types build`

## 开发

```bash
pnpm --filter @nova/uni-app dev:h5
```

## 说明

根目录 `pnpm lint` 暂未覆盖 uni-app；提交前至少保证 H5 构建或项目既有检查通过。

详细 Admin/Server 规范见 [admin-ui.md](./admin-ui.md)、[server.md](./server.md)。
