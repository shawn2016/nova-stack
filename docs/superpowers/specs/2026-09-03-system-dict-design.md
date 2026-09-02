---
comet_change: system-dict
role: technical-design
canonical_spec: openspec
---

# system-dict 深度技术设计

## 1. 架构总览

```
Admin 字典管理页              Server DictModule
──────────────              ─────────────────
dict/index.vue ──CRUD──► DictTypeController / DictDataController
useDict(code) ──GET──► GET /dict/data/by-type/:code
ElSelect ◄── options
```

**实施顺序**：实体 + shared-types → Dict API + e2e → seed → Admin UI + useDict → 集成验证

## 2. 数据模型

### 2.1 sys_dict_type

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 与现有实体一致，TS 用 string |
| name | varchar(64) | 显示名 |
| code | varchar(64) UNIQUE | 业务编码，如 `user_status` |
| status | tinyint | 1 启用 0 禁用 |
| remark | varchar(255)? | 可选 |
| created_at / updated_at | datetime | |

### 2.2 sys_dict_data

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | |
| type_id | bigint FK → sys_dict_type | |
| label | varchar(64) | 显示标签 |
| value | varchar(64) | 存储值 |
| sort | int default 0 | 升序 |
| status | tinyint | 1 启用 0 禁用 |
| remark | varchar(255)? | |
| created_at / updated_at | datetime | |

**约束**：`(type_id, value)` UNIQUE

### 2.3 实体文件

```
server/src/database/entities/
├── sys-dict-type.entity.ts
└── sys-dict-data.entity.ts
```

导出至 `entities/index.ts`，TypeORM `synchronize`（dev）或 migration。

## 3. shared-types

```typescript
// packages/shared-types/src/dict.ts

export interface DictTypeListItem {
  id: string;
  name: string;
  code: string;
  status: number;
  remark?: string | null;
  createdAt: string;
}

export interface DictDataListItem {
  id: string;
  typeId: string;
  typeCode?: string;
  label: string;
  value: string;
  sort: number;
  status: number;
  remark?: string | null;
}

export interface DictOption {
  label: string;
  value: string;
  sort: number;
}

export interface CreateDictTypeDto { name: string; code: string; status?: number; remark?: string; }
export interface UpdateDictTypeDto { name?: string; status?: number; remark?: string; }
export interface CreateDictDataDto { typeId: string; label: string; value: string; sort?: number; status?: number; remark?: string; }
export interface UpdateDictDataDto { label?: string; value?: string; sort?: number; status?: number; remark?: string; }
```

## 4. Server API

### 4.1 模块结构

```
server/src/modules/dict/
├── dict.module.ts
├── dict-type.controller.ts
├── dict-type.service.ts
├── dict-data.controller.ts
├── dict-data.service.ts
└── dto/  # 若需 class-validator，可复用 shared-types 形状
```

注册 `DictModule` 至 `AppModule`；路由前缀 `/dict`。

### 4.2 端点与权限

| 方法 | 路径 | Permission |
|------|------|------------|
| GET | /dict/types | system:dict:type:list |
| POST | /dict/types | system:dict:type:create |
| PUT | /dict/types/:id | system:dict:type:update |
| DELETE | /dict/types/:id | system:dict:type:delete |
| GET | /dict/data | system:dict:data:list |
| POST | /dict/data | system:dict:data:create |
| PUT | /dict/data/:id | system:dict:data:update |
| DELETE | /dict/data/:id | system:dict:data:delete |
| GET | /dict/data/by-type/:code | Admin JWT（无额外 permission，便于下拉） |

- 列表支持分页 query：`page`, `pageSize`, `keyword`
- `/dict/data` 支持 `typeId` 或 `typeCode` 筛选
- DELETE type：若存在 data 行 → 400 `Dict type has data items`
- POST type 重复 code → 400
- POST data 重复 value（同 type）→ 400
- by-type：仅 `status=1`，按 `sort ASC`；未知 code → 404

### 4.3 鉴权

- 全部走 AdminAuthGuard + `@RequirePermission`（by-type 除外，仅 AdminAuthGuard）
- Member token → 403

## 5. Seed

`init.seed.ts` 增量：

**Permissions**（8 个）：
```
system:dict:type:list|create|update|delete
system:dict:data:list|create|update|delete
```

**Menu**（系统管理 children，sort 4）：
```javascript
{ name: '字典管理', path: '/system/dict', component: 'views/system/dict/index',
  icon: 'ri:book-2-line', type: 'menu', permissionCode: 'system:dict:type:list', sort: 4 }
```

**示例字典**（dev smoke）：
- `user_status`: 启用(1) / 禁用(0)
- `article_status`: 草稿(draft) / 已发布(published)

super_admin 自动关联新 permissions（现有 upsert 逻辑）。

## 6. Admin UI

### 6.1 API

`admin/src/api/dict.ts`：
- fetchDictTypeList, createDictType, updateDictType, deleteDictType
- fetchDictDataList, createDictData, updateDictData, deleteDictData
- fetchDictOptionsByType(code)

### 6.2 页面

`admin/src/views/system/dict/index.vue`：
- 左：类型表格（useTable），选中行高亮
- 右：字典项表格，依赖选中 typeId
- 对话框：类型编辑、字典项编辑
- `v-permission` 控制按钮

### 6.3 useDict

`admin/src/hooks/core/useDict.ts`：

```typescript
export function useDict(typeCode: string) {
  const options = ref<DictOption[]>([])
  const loading = ref(false)
  onMounted(async () => {
    loading.value = true
    options.value = await fetchDictOptionsByType(typeCode)
    loading.value = false
  })
  return { options, loading }
}
```

## 7. 测试策略

| 层 | 内容 |
|----|------|
| shared-types | DTO 形状 vitest（可选，与 auth 一致） |
| e2e | dict-type CRUD、dict-data CRUD、by-type、删除约束、Member 403 |
| seed | permissions/menus 增量 |
| admin | build |

## 8. 非目标（重申）

- uni-app、Member API、Redis 缓存、树形字典、导入导出
