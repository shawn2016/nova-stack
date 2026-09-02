# Brainstorm Summary

- Change: admin-art-design-pro
- Date: 2026-09-02

## Confirmed Technical Approach

**方案 A：模板 Fork + API 先行**（用户已确认）

1. art-design-pro 作为 `admin/` 基底（clean:dev）
2. Server：/users、/roles、/menus CRUD + 角色权限/用户角色分配
3. Admin：模板 Layout + menusToRoutes 动态路由
4. 系统管理三页 + 文章管理（Element Plus）
5. 统一 seed menu component 为 `views/...` 路径

## Key Trade-offs and Risks

- Server + Admin 双端改动，分阶段 commit
- JWT permissions MVP 不实时刷新，重新登录生效
- 菜单 MVP：表格 + parentId 下拉，无拖拽

## Testing Strategy

- RBAC CRUD e2e + 403
- admin build + smoke
- auth/article e2e 回归

## Spec Patches

- rbac-api：补充角色分配权限、用户分配角色场景（已写入 delta spec）
