## MODIFIED Requirements

### Requirement: 共享 types 包
系统 MUST 提供 `packages/shared-types` workspace 包，导出 API 通用类型及 LoginRequest、LoginResponse、UserInfo、MenuNode、TokenPair 等鉴权/RBAC 类型。

#### Scenario: 子包引用共享类型
- **WHEN** admin 或 server 子包 import 共享 types
- **THEN** TypeScript 编译通过且类型定义一致

#### Scenario: 三端类型对齐
- **WHEN** server 返回 LoginResponse
- **THEN** admin 与 uni-app 可使用相同类型解析
