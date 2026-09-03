# Brainstorm Summary

- Change: audit-logs
- Date: 2026-09-03

## 确认方案

- 双表 login_log + oper_log，同步写库
- 登录在 AuthService 挂钩；写操作用 OperLogInterceptor
- Admin 双 Tab 只读页

## Spec Patch

无
