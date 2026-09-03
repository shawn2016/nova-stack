# Brainstorm Summary

- Change: infra-sms
- Date: 2026-09-03

## 确认的技术方案

- 三表：`sys_sms_channel`、`sys_sms_template`、`sys_sms_log`
- Provider 适配器：`mock` 内置实现；`aliyun`/`tencent` MVP 仅校验配置 JSON，发送返回 501
- `SmsService.sendByTemplate` 渲染 `{param}` 占位符并写日志
- Admin `/infra/sms` Tab：通道 | 模板 | 日志 + 测试发送弹窗

## 关键取舍与风险

- 不集成真实云 SDK，生产需后续 change
- 配置 JSON 明文存库，MVP 仅 dev/mock

## 测试策略

- shared-types 类型测试
- e2e：通道 CRUD、非法 provider 400、mock 发送写 log、模板 code 唯一
- seed.spec 权限/菜单计数
- admin build

## Spec Patch

无
