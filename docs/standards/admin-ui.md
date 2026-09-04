# Admin UI

## CRUD 列表（MUST）

结构标杆：`admin/src/views/system/user/index.vue`

```
ArtListPanel
  #search → 搜索组件
  #head-actions → 主按钮 + v-permission
  ArtTable ← useTable（分页/loading/列）
同级 modules/*-dialog.vue
```

- 数据分页：**必须** `useTable`，禁止新页裸 `ElTable` 手写分页
- 操作列：`ArtTableActions`，`auth` 对齐权限码
- 工具栏默认：`listPanel.ts` 的 `compactTools`

**例外**：卡片/网格等非表格（如文件管理）— 仍用 `ArtListPanel`，内容区自定义。

## CRUD 弹窗（MUST）

- 文件：`modules/<name>-dialog.vue`
- 标杆：`user/modules/user-dialog.vue`
- `ElDialog`：`width="480px"`、`align-center`
- 标题：`添加…` / `编辑…`；footer 取消 + 提交（`:loading`）
- `@closed` 重置表单

## 设置弹窗（SHOULD）

少量配置可内联 `ElDialog` — 标杆：`dept/index.vue`

## 权限与删除（MUST）

- 按钮：`v-permission="'system:xxx:action'"`
- 删除：`ElMessageBox.confirm` + `type: 'warning'`

## 类型与请求（MUST）

- 类型：`@nova/shared-types`
- HTTP：`admin/src/api/`，禁止页面内裸 `fetch`
