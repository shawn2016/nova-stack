# Brainstorm Summary

- Change: site-config
- Date: 2026-09-03

## 确认的技术方案

- 单表 `sys_config` KV 模型，config_key 唯一且创建后不可改
- REST：`/config/items` CRUD + `/config/by-key/:key` 读取
- 模块 `site-config`，权限 `system:config:*`
- Admin 单表管理页

## 测试策略

- e2e 先行，seed 测试，admin build

## Spec Patch

无
