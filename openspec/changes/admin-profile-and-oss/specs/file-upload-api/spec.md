## ADDED Requirements

### Requirement: Admin 文件上传
系统 MUST 提供 `POST /files/upload`，接受 multipart 单文件，需 Admin JWT 鉴权，返回可访问 URL。

#### Scenario: 上传成功
- **WHEN** Admin 提交合法图片文件（≤ 配置大小限制）
- **THEN** 返回 201 及 `{ url, key, size, mimeType }`

#### Scenario: Member Token 拒绝
- **WHEN** Member Token 请求上传
- **THEN** 返回 403

#### Scenario: 文件过大或类型不允许
- **WHEN** 超过大小限制或非允许 MIME
- **THEN** 返回 400

### Requirement: OSS 配置与本地回退
系统 MUST 支持通过环境变量配置阿里云 OSS；当 OSS 未启用时 MUST 提供本地存储回退以便开发联调。

#### Scenario: OSS 启用
- **WHEN** `OSS_ENABLED=true` 且凭证有效
- **THEN** 文件写入 OSS 并返回 OSS/CDN URL

#### Scenario: OSS 禁用
- **WHEN** `OSS_ENABLED=false`
- **THEN** 文件写入本地目录并通过 HTTP 静态路径可访问
