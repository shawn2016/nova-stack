# 注释

语言：**中文**。

## MUST 写

| 位置 | 形式 |
|------|------|
| Entity 字段 | 见 [database.md](./database.md) |
| `utils/`、`common/` 等**导出**函数 | 一行 JSDoc 说明作用 |
| 魔法数字 / 状态码 | 常量或注释写含义 |
| 非 obvious 业务分支 | 一行写「为什么」 |

## 可不写

见名知意的 handler（`handleSearch`）、直观 template、标准 CRUD 样板（靠标杆文件）。

## 格式

```typescript
/** 将权限挂到菜单树，供角色分配弹窗使用 */
export function attachPermissionsToMenuTree(...) {}
```

## MUST NOT

- 注释与代码不一致
- 用注释掩盖差命名
- 把规范全文粘贴进代码
