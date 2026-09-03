## MODIFIED Requirements

### Requirement: Admin 文件上传
系统 MUST 提供 `POST /files/upload`，接受 multipart 单文件，需 Admin JWT 鉴权，**且 MUST 校验 `system:file:upload` 或等价上传权限**，返回可访问 URL。

#### Scenario: 上传成功
- **WHEN** 有上传权限的 Admin 提交合法图片文件（≤ 配置大小限制）
- **THEN** 返回 201 及 `{ url, key, size, mimeType }`

#### Scenario: 无上传权限
- **WHEN** Admin 已登录但无上传权限码
- **THEN** 返回 403

#### Scenario: Member Token 拒绝
- **WHEN** Member Token 请求上传
- **THEN** 返回 403

#### Scenario: 文件过大或类型不允许
- **WHEN** 超过大小限制或非允许 MIME
- **THEN** 返回 400
