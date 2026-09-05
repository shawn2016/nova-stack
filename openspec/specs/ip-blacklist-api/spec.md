# ip-blacklist-api Specification

## Purpose
提供 IP 黑名单的持久化、运行时拦截、登录暴力自动封禁及 Admin 管理 API，在应用层拒绝恶意 IP 访问。

## Requirements

### Requirement: 全局 IP 拦截

系统 MUST 在 HTTP 请求进入业务逻辑前检查客户端 IP 是否处于有效封禁状态；若封禁中 MUST 返回 403 且 MUST NOT 执行后续 Controller。

#### Scenario: 黑名单 IP 被拒绝
- **WHEN** 客户端 IP 存在于有效黑名单（未过期且启用）
- **THEN** 返回 403，响应体含封禁原因摘要

#### Scenario: 非黑名单 IP 正常通过
- **WHEN** 客户端 IP 不在黑名单或记录已过期/停用
- **THEN** 请求继续进入 Nest 管道

#### Scenario: 白名单 IP 不被拦截
- **WHEN** 客户端 IP 为配置的白名单（含 127.0.0.1）
- **THEN** 即使存在黑名单记录也不拦截（或自动封禁跳过白名单）

### Requirement: 登录失败自动封禁

系统 MUST 在 Admin 登录失败（401）时递增该 IP 的失败计数；在滑动窗口内达到阈值 MUST 自动创建临时黑名单记录。

#### Scenario: 未达阈值仅计数
- **WHEN** 同一 IP 在窗口内登录失败但未达阈值
- **THEN** 不写入黑名单，后续非登录请求仍可访问

#### Scenario: 达阈值自动封禁
- **WHEN** 同一 IP 在 5 分钟内登录失败达到配置阈值（默认 10 次）
- **THEN** 自动写入黑名单（source=auto，expiresAt=now+封禁时长），后续该 IP 全部请求 403

### Requirement: 黑名单 CRUD API

系统 MUST 提供 Admin 鉴权下的黑名单管理 API：分页列表、手动添加、删除/解除、启停状态。

#### Scenario: 手动添加 IP
- **WHEN** 具备权限的管理员 POST 合法 IPv4 与可选备注、过期时间
- **THEN** 返回 201，记录 source=manual，并即时生效拦截

#### Scenario: 解除封禁
- **WHEN** 管理员 DELETE 某黑名单记录
- **THEN** 记录删除且 Redis 缓存清除，该 IP 恢复访问

#### Scenario: 无权限拒绝
- **WHEN** 无 `security:ip-blacklist:create` 权限调用写接口
- **THEN** 返回 403

#### Scenario: health 探针不受拦截
- **WHEN** 客户端 IP 处于封禁状态且请求 `GET /health`
- **THEN** 返回 200，不执行 IP 黑名单拦截

#### Scenario: 非法 IP 格式拒绝
- **WHEN** 管理员 POST 非 IPv4 字面量（如 CIDR 或域名）
- **THEN** 返回 400，不创建记录

#### Scenario: Redis 不可用时降级
- **WHEN** Redis 连接不可用且 MySQL 存在有效封禁记录
- **THEN** Middleware 仍通过 DB 判定并返回 403
