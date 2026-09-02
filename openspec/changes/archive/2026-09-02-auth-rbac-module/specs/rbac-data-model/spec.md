## Purpose

定义 B 端 RBAC 数据库表结构：sys_user、sys_role、sys_permission、sys_menu 及关联表；C 端 member_user 独立表。

## ADDED Requirements

### Requirement: sys_user 表
系统 MUST 创建 sys_user 表，字段含 id、username、password_hash、nickname、avatar、status、created_at、updated_at。

#### Scenario: 表结构迁移
- **WHEN** 执行 migration 或 sync
- **THEN** sys_user 表存在且 username 唯一索引生效

### Requirement: sys_role 与 sys_permission 表
系统 MUST 创建 sys_role、sys_permission 表及 sys_user_role、sys_role_permission 关联表。

#### Scenario: 角色权限关联
- **WHEN** 为角色分配权限
- **THEN** sys_role_permission 存在对应记录

### Requirement: sys_menu 树形表
系统 MUST 创建 sys_menu 表，支持 parent_id 树形结构，type 为 directory/menu/button。

#### Scenario: 菜单树存储
- **WHEN** 插入父子菜单
- **THEN** 可按 parent_id 构建树

### Requirement: member_user 独立表
系统 MUST 创建 member_user 表（phone 唯一），与 sys_user 无 FK 关联。

#### Scenario: C 端用户独立
- **WHEN** 注册会员
- **THEN** 数据写入 member_user，不写入 sys_user

### Requirement: Seed 数据
系统 MUST seed：admin/admin123 超级管理员 + RBAC 基础数据；dev 环境 seed 测试会员。

#### Scenario: 首次 seed
- **WHEN** 执行 seed
- **THEN** 可分别用 admin 与测试手机号登录
