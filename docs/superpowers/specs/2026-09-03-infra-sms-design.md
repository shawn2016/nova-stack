---
comet_change: infra-sms
role: technical-design
canonical_spec: openspec
---

# infra-sms 深度技术设计

## 1. 架构

```
SmsController ──► SmsChannelService / SmsTemplateService / SmsLogService
              ──► SmsService.sendByTemplate
SmsProviderFactory ──► MockSmsProvider | AliyunSmsProvider | TencentSmsProvider
```

## 2. 实体

### sys_sms_channel
- name, provider (`mock`|`aliyun`|`tencent`), config (text JSON), status (0|1), remark

### sys_sms_template
- code (unique), name, content, channelId, status (0|1), remark

### sys_sms_log
- channelId, templateCode, phone, content, status (0|1), providerMessage, sentAt

## 3. shared-types

SmsChannelListItem, SmsTemplateListItem, SmsLogListItem, Create/Update DTOs, SendSmsDto, SendSmsResult

## 4. Provider

```typescript
interface SmsSendContext {
  phone: string;
  content: string;
  config: Record<string, unknown>;
}
interface SmsSendResult {
  success: boolean;
  message: string;
}
```

- `mock`：直接 success，message=`mock sent`
- `aliyun`/`tencent`：throw `NotImplementedException`（501）

## 5. 模板渲染

- content 中 `{code}` 占位；params 对象键值替换
- 缺失 param 抛 400

## 6. API

| Method | Path | Permission |
|--------|------|------------|
| GET/POST | `/sms/channels` | infra:sms:channel:list/create |
| PUT/DELETE | `/sms/channels/:id` | infra:sms:channel:update/delete |
| GET/POST | `/sms/templates` | infra:sms:template:list/create |
| PUT/DELETE | `/sms/templates/:id` | infra:sms:template:update/delete |
| GET | `/sms/logs` | infra:sms:log:list |
| POST | `/sms/send` | infra:sms:send |

## 7. Admin

- `/infra/sms` ElTabs：通道、模板、日志
- 测试发送：选 templateCode + phone + params JSON

## 8. Seed

- Mock 通道（provider=mock, status=1）
- 模板 `login_code`：「您的验证码是{code}，5分钟内有效」
- 菜单「短信管理」sort=2 under 基础设施

## 9. 测试

- e2e: 列表含 seed、非法 provider 400、send mock 写 log
- entities.spec 24 实体
- seed.spec permissions 68
