## Context

在定时任务（infra-scheduled-job）之后，补齐 Infra 短信能力。项目已有 RBAC、seed 菜单「基础设施」目录，可挂载短信子菜单。

## Goals / Non-Goals

**Goals:**
- 通道、模板、日志三表持久化
- Provider 适配器 + mock 实现（e2e/开发零副作用）
- Admin 可 CRUD 通道与模板、查看日志、测试发送

**Non-Goals:**
- 真实云厂商 SDK 完整对接
- Member 注册验证码业务流（后续 change 复用 SmsService）

## Decisions

### 1. Provider 策略

- `SmsProvider` 接口：`send(phone, content, config): Promise<SmsSendResult>`
- 内置 `mock` Provider：仅写日志，返回 success
- `aliyun` / `tencent`：MVP 校验配置 JSON 结构，发送时若未实现则返回 501 或明确错误（可测试配置 CRUD）

### 2. 模板与发送

- 模板 content 支持 `{code}` 占位；发送时替换 params
- `POST /sms/send`（Admin 测试）：phone + templateCode + params
- 每次发送写 `sys_sms_log`（phone、templateCode、content、status、providerMessage）

### 3. 权限

- `infra:sms:channel:list/create/update/delete`
- `infra:sms:template:list/create/update/delete`
- `infra:sms:log:list`
- `infra:sms:send`（测试发送）

### 4. Admin UI

- Tab：通道 | 模板 | 日志
- 测试发送弹窗：选模板 + 手机号 + 参数 JSON

## Risks / Trade-offs

- 无真实 SDK → 生产需后续 change 扩展 Provider 实现
- 配置 JSON 存库 → 敏感 key 需环境变量引用（MVP 明文 dev 配置 + 文档说明）

## Migration Plan

- TypeORM sync / e2e schema 增表
- seed 默认 mock 通道 + 验证码模板示例

## Open Questions

- （无阻塞）真实 SDK 集成留后续迭代
