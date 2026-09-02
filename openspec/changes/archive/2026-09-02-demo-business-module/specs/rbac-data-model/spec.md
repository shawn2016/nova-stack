## MODIFIED Requirements

### Requirement: Seed 数据
系统 MUST seed：admin/admin123 超级管理员 + RBAC 基础数据；dev 环境 seed 测试会员；并扩展**内容管理 / 文章管理**菜单及 content:article:* 权限。

#### Scenario: 首次 seed
- **WHEN** 执行 seed
- **THEN** 可分别用 admin 与测试手机号登录

#### Scenario: 文章菜单 seed
- **WHEN** 执行 seed
- **THEN** sys_menu 含「内容管理」目录与「文章管理」子菜单，super_admin 拥有文章权限
