# 数据库与 Entity

## 命名（MUST）

| 对象 | 规则 | 示例 |
|------|------|------|
| 表名 | `snake_case`，系统表 `sys_` | `sys_user` |
| 列名 | `snake_case` | `dept_id` |
| Entity | `PascalCase` + `Entity` | `SysUserEntity` |
| 属性 | `camelCase` + `@Column({ name })` | `deptId` |

主键 `bigint`；JSON/API 用 **string**（shared-types）。

## 字段备注

| 字段类型 | 要求 |
|----------|------|
| 状态 / 枚举 | **MUST** JSDoc + `comment`，写清取值（如 `1=启用 0=禁用`） |
| 外键 / 可空关联 | **MUST** JSDoc + `comment`，写清 null 含义 |
| 其余业务字段 | **SHOULD** JSDoc；**SHOULD** `comment` |
| `id` / `createdAt` / `updatedAt` | **MAY** 仅 `comment` |

```typescript
/** 状态：1=启用，0=禁用 */
@Column({ type: 'tinyint', default: 1, comment: '状态：1启用 0禁用' })
status!: number;

/** 部门 ID；null=未绑定 */
@Column({ type: 'bigint', name: 'dept_id', nullable: true, comment: '部门ID' })
deptId!: string | null;
```

## 实体注册（MUST）

- 路径：`server/src/database/entities/`
- 导出：`entities/index.ts`

## Design 新表（SHOULD）

字段表：| 字段 | 类型 | 可空 | 备注 |

## 禁止（MUST NOT）

- 用户输入拼 SQL 字符串
- 无说明的魔法状态码
