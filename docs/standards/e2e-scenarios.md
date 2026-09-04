# Browser E2E 场景规范

让 Hub 能回答：**这个页面有哪些功能？E2E 测了哪些？还缺什么？**

## 三层模型

| 层 | 来源 | 含义 |
|----|------|------|
| **期望能力** | 扫描 `admin/src/views/**/index.vue` | 页面「应该测什么」（列表、搜索、新增…） |
| **已测场景** | Playwright spec 的 `@page` + `@scenario` 标签 | 本次/历史 run 实际跑了什么 |
| **缺口** | 期望 − 已测 | 还没写 E2E 的能力 |

API E2E 仍覆盖 CRUD 接口；Browser 场景聚焦 **用户可见流程**。

## 写 E2E 前（AI / 人）

```bash
# 扫描全部 Admin 页面能力
pnpm verify:scan-pages

# 单页
pnpm verify:scan-pages --path /system/user

# JSON（给脚本/AI）
pnpm verify:scan-pages --json
```

输出示例：用户管理期望 `[list, search, create, update, delete]`，当前只测了 `list` → Hub 显示 20% 场景覆盖。

## Spec 标注约定（必须）

```typescript
test('用户管理页加载列表', {
  tag: ['@module:rbac', '@page:/system/user', '@scenario:list'],
}, async ({ page }) => {
  // ...
});
```

| Tag | 示例 | 说明 |
|-----|------|------|
| `@module:<id>` | `@module:rbac` | 模块归属（缺口统计） |
| `@page:<path>` | `@page:/system/user` | 与 inventory / 路由一致 |
| `@scenario:<id>` | `@scenario:list` | 见 `.verify/scenario-catalog.yaml` |

### 场景 id 目录

| id | 含义 |
|----|------|
| `list` | 列表/主内容加载 |
| `search` | 搜索筛选 |
| `create` | 新增 |
| `update` | 编辑 |
| `delete` | 删除 |
| `tabs` | Tab 切换 |
| `upload` | 上传 |
| `auth` | 登录认证 |

## 写 Admin 页时（AI 自检）

1. 页面合并后运行 `pnpm verify:scan-pages --path <新路由>`
2. 至少补 **`@scenario:list`** smoke；CRUD 页逐步补 `create` / `update` / `delete`
3. 跑 `pnpm verify --tier browser-smoke`，Hub → **页面场景矩阵** 查看覆盖率
4. 缺口可复制发给 AI 补测

## inventory 可选覆盖

若 Vue 扫描不准，可在 `.verify/inventory.yaml` 为页面声明：

```yaml
adminPages:
  - path: /system/user
    name: 用户管理
    capabilities: [list, search, create, update, delete]
```

## Hub 展示

Verify Hub 报告中的 **页面场景矩阵**：

- 每行一个 Admin 页
- 列：期望场景 | 已测 | 缺口 | 覆盖率
- **一键复制场景缺口** → 粘贴给 AI 补 E2E

## 与 API E2E 分工

| 类型 | 覆盖 |
|------|------|
| API E2E | 接口契约、权限、边界 |
| Browser `@scenario:list` | 页面能打开、主 UI 正常 |
| Browser `create/update/delete` | 关键表单与交互（可少量 happy path） |

Smoke 阶段可以只有 `list`；**累计收益**是随迭代把 `create/update/delete` 补全，矩阵覆盖率持续上升。
