## Context

在 infra-sms 之后补齐邮件 Infra 能力，架构与短信模块对称。

## Goals / Non-Goals

**Goals:** 通道/模板/日志三表；mock Provider；Admin CRUD + 测试发送

**Non-Goals:** 真实 SMTP SDK；附件发送

## Decisions

- Provider：`mock` | `smtp`（MVP smtp 未实现返回 501）
- 模板含 subject + content，均支持 `{param}` 占位
- 权限前缀 `infra:email:*`
- Admin `/infra/email` Tab 布局同 sms

## Risks / Trade-offs

- 无真实 SMTP → 生产需后续扩展

## Migration Plan

- seed mock 通道 + welcome 模板
