# Task 1 报告：art-design-pro 模板基底

**状态：** DONE_WITH_CONCERNS  
**分支：** `comet/admin-art-design-pro`  
**日期：** 2026-09-02

## 完成项

### 1.1 合并 art-design-pro 至 admin/

- 自 [Daymychen/art-design-pro](https://github.com/Daymychen/art-design-pro) 克隆并 rsync 至 `admin/`
- 执行 `pnpm clean:dev`（自动确认），删除 92 个演示文件/目录
- 保留核心模块：Dashboard、System、Result、Exception、Auth、核心组件库

### 1.2 接入 monorepo

- `package.json` 名称对齐为 `@nova/admin`，`private: true`
- 添加 `"@nova/shared-types": "workspace:*"` 依赖
- 精简 scripts：`dev` / `build` / `preview` / `clean:dev`（移除 husky/commitizen 等独立仓库脚本）
- 新增 `.env.development` 与更新 `.env.example`，代理目标指向 `http://localhost:3000`
- nova 原有鉴权/API/动态路由代码暂存于 `admin/.nova-preserve/`（Task 3 恢复）

### 1.3 移除 Arco / UnoCSS

- 旧 `admin/` 中 `@arco-design/web-vue`、`unocss`、`uno.config.ts` 已完全移除
- 新模板使用 Element Plus + Tailwind CSS v4
- `admin/package.json` 中无 `@arco-design/web-vue` / `unocss` 条目

## 验证结果

| 检查项 | 命令 | 结果 |
|--------|------|------|
| shared-types 构建 | `pnpm --filter @nova/shared-types build` | ✅ 通过 |
| admin dev 启动 | `pnpm --filter @nova/admin dev` | ✅ Vite 7 在 http://localhost:5173/ 就绪（1378ms） |
| 无 Arco 依赖 | `grep` admin/package.json | ✅ 无匹配 |
| admin 生产构建 | `pnpm --filter @nova/admin build` | ⚠️ vue-tsc 报 TS 错误（模板 upstream 泛型组件问题，非本次合并引入） |

## 遗留事项（Task 3+）

1. **鉴权接入**：`.nova-preserve/` 中 nova `request.ts` / `auth.ts` / `user.ts` / `menusToRoutes.ts` 需替换模板 mock 鉴权
2. **生产构建**：`vue-tsc --noEmit` 在 `art-form`、`art-search-bar`、`art-table` 等组件有泛型 TS 错误；dev 正常，build 需后续修复或调整 tsconfig
3. **业务页面**：System 模块仍为模板 demo UI；文章页面在 `.nova-preserve/content/`，Task 4 用 Element Plus 重写
4. **根级 predev**：`pnpm dev` 会先 build shared-types，再并行启动 server + admin — 与 monorepo 约定一致

## 变更概要

- `admin/` 整体替换为 art-design-pro 精简版（Element Plus + Tailwind）
- 新增 `admin/.nova-preserve/` 保存 nova 原有逻辑
- 更新根 `pnpm-lock.yaml`（admin 依赖树变更）
