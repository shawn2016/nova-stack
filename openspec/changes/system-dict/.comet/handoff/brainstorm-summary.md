# Brainstorm Summary

- Change: system-dict
- Date: 2026-09-03

## 确认的技术方案

- 双表模型 `sys_dict_type` + `sys_dict_data`，type.code 全局唯一，同 type 下 data.value 唯一
- REST API：`/dict/types`、`/dict/data`、`/dict/data/by-type/:code`（仅启用项）
- RBAC 权限 `system:dict:type:*`、`system:dict:data:*` + seed 菜单
- Admin 主从页：左类型右字典项；`useDict(typeCode)` composable 供下拉复用
- 实施顺序：实体/shared-types → Server API + e2e → seed → Admin UI → 集成验证

## 关键取舍与风险

- 删除类型前校验是否有关联字典项（400）
- by-type 需 Admin JWT，MVP 任意已登录 Admin 可读（不单独拆 dict:read 权限）
- 无 Redis 缓存，useDict 每次 mount 拉取

## 测试策略

- shared-types vitest
- server e2e：类型 CRUD、项 CRUD、by-type、删除约束、权限 403
- seed 测试增量 permissions/menus
- admin build

## Spec Patch

无
