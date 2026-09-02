# Brainstorm Summary

- Change: demo-business-module
- Date: 2026-09-02

## 确认的技术方案

- 实体：**Article（公告/文章）**，单表 `article`
- B 端：`/articles` 全 CRUD + PATCH publish，RBAC 权限 `content:article:*`
- C 端：`/member/articles` 只读列表/详情，硬过滤已发布
- Admin：列表 + 表单（textarea 正文），v-permission 控制按钮
- Uni-app：列表/详情页，仅调用 `/member/articles`
- shared-types：Article DTO 三端共享
- Seed：扩展「内容管理」菜单 + 5 权限 + dev 示例文章

## 关键取舍与风险

- 不用富文本/OSS — 降低首版复杂度
- Seed 菜单扩展需与现有 init.seed 幂等合并
- 基于 auth-rbac-module 分支（PR #2）开发

## 测试策略

- Server：article e2e（admin CRUD + member 只读 + 403 + 草稿不可见）
- Admin/Uni-app：build 验证 + 手动 smoke
- TDD 单测：entity metadata + service 核心逻辑

## Spec Patch

- 无（Open delta spec 已覆盖）
