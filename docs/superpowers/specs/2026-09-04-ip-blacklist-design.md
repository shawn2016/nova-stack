---
comet_change: ip-blacklist
role: technical-design
canonical_spec: openspec
---

# ip-blacklist 深度技术设计

## 1. 架构

```
HTTP Request
  → IpBlacklistMiddleware（全局，除 GET /health）
      → isWhitelisted? skip
      → Redis/DB 命中? → 403 Forbidden
  → Nest Guards / Controllers
      → POST /auth/login
          → isBlocked? → 403
          → 401 失败 → IpBlacklistService.recordLoginFailure(ip)
              → 达阈值 → create auto blacklist + set Redis
Admin /system/ip-blacklist
  → GET/POST/DELETE/PUT /security/ip-blacklist
      → IpBlacklistService → MySQL + Redis 同步
```

**实现顺序**：shared-types + Entity → Service + Middleware → Auth 接入 → CRUD API + seed → Admin UI → e2e

## 2. 配置（`configuration.ts`）

新增 `ipBlacklistConfig`：

| 环境变量 | 默认 | 说明 |
|----------|------|------|
| `IP_BLACKLIST_WINDOW_SEC` | `300` | 登录失败计数窗口（秒） |
| `IP_BLACKLIST_FAIL_THRESHOLD` | `10` | 窗口内失败次数阈值 |
| `IP_BLACKLIST_BAN_SEC` | `1800` | 自动封禁时长（秒） |
| `IP_BLACKLIST_WHITELIST` | `127.0.0.1,::1` | 逗号分隔，跳过计数与拦截 |
| `TRUST_PROXY` | `false` | true 时信任 `X-Forwarded-For` 首段 |

## 3. 实体 `sys_ip_blacklist`

```typescript
@Entity('sys_ip_blacklist')
export class SysIpBlacklistEntity {
  id: string;              // bigint PK
  ip: string;              // varchar(64), unique index
  source: 'manual' | 'auto'; // varchar(16)
  status: number;          // tinyint: 1=启用 0=停用
  expiresAt: Date | null;  // datetime nullable，null=永久
  remark: string | null;   // varchar(255)
  createdBy: string | null; // bigint，手动封禁操作人 userId
  createdAt: Date;
  updatedAt: Date;
}
```

索引：`UNIQUE(ip)`，`INDEX(status, expires_at)` 供列表与过期扫描。

## 4. shared-types（`packages/shared-types/src/ip-blacklist.ts`）

```typescript
export type IpBlacklistSource = 'manual' | 'auto';

export interface IpBlacklistListItem {
  id: string;
  ip: string;
  source: IpBlacklistSource;
  status: number;
  expiresAt: string | null;
  remark: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface IpBlacklistListResult {
  list: IpBlacklistListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateIpBlacklistDto {
  ip: string;
  remark?: string;
  expiresAt?: string | null; // ISO8601；省略或 null = 永久
}

export interface UpdateIpBlacklistStatusDto {
  status: number; // 0 | 1
}
```

列表查询：`page`, `pageSize`, `keyword?`（匹配 ip/remark）, `source?`, `status?`。

## 5. 公共工具

**`server/src/common/utils/resolve-client-ip.ts`**

```typescript
/** 从 Express 请求解析客户端 IP；trustProxy 时取 X-Forwarded-For 首段 */
export function resolveClientIp(req: Request, trustProxy: boolean): string;
```

**`server/src/common/utils/is-ipv4.ts`**

简单 IPv4 字面量校验（四段 0–255），MVP 不支持 CIDR。

## 6. IpBlacklistService

路径：`server/src/modules/ip-blacklist/ip-blacklist.service.ts`

| 方法 | 说明 |
|------|------|
| `isBlocked(ip: string): Promise<{ blocked: boolean; reason?: string }>` | 白名单 → false；Redis GET → 命中；miss 查 DB 有效记录并回填 Redis |
| `recordLoginFailure(ip: string): Promise<void>` | 白名单 skip；INCR `ip:login-fail:{ip}` + EXPIRE window；≥ threshold 调 `createAutoBan` |
| `createAutoBan(ip: string): Promise<void>` | upsert DB source=auto, expiresAt=now+banSec；SET Redis TTL |
| `createManual(dto, userId): Promise<IpBlacklistListItem>` | 校验 IPv4、去重；写 DB + Redis |
| `remove(id): Promise<void>` | 删 DB + DEL Redis |
| `updateStatus(id, status): Promise<void>` | 更新 DB；启用则 SET Redis，停用则 DEL |
| `findPage(query): Promise<IpBlacklistListResult>` | TypeORM 分页 |

**Redis key 约定**

- `ip:blacklist:{ip}` → `"1"` 或 JSON `{ reason, source }`；TTL = max(0, expiresAt - now)，永久则不设 TTL
- `ip:login-fail:{ip}` → 整数计数；EXPIRE = windowSec

**Redis 不可用**：`getClient()` 为 null 时 `isBlocked` 仅查 DB；`recordLoginFailure` 打 warn 并 return。

**启动预热（可选 MVP+）**：模块 `onModuleInit` 加载 status=1 且未过期记录写入 Redis；MVP 可 lazy load on first check。

## 7. IpBlacklistMiddleware

路径：`server/src/modules/ip-blacklist/ip-blacklist.middleware.ts`

```typescript
@Injectable()
export class IpBlacklistMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const ip = resolveClientIp(req, trustProxy);
    const { blocked, reason } = await this.service.isBlocked(ip);
    if (blocked) {
      throw new ForbiddenException(reason ?? 'IP blocked');
    }
    next();
  }
}
```

**排除路由**：`GET health`（全局 prefix 下为 `/api/health` 之前 middleware 匹配 path `health`）。

**403 响应体**：沿用 `HttpExceptionFilter`，message 如 `"Access denied: IP blocked"`。

## 8. IpBlacklistModule

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([SysIpBlacklistEntity])],
  controllers: [IpBlacklistController],
  providers: [IpBlacklistService, IpBlacklistMiddleware],
  exports: [IpBlacklistService],
})
export class IpBlacklistModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IpBlacklistMiddleware)
      .exclude({ path: 'health', method: RequestMethod.GET })
      .forRoutes('*');
  }
}
```

`AppModule.imports` 加入 `IpBlacklistModule`（建议在 AuthModule 之前）。

## 9. Auth 接入

**`auth.controller.ts`**：login 使用 `resolveClientIp(req, trustProxy)` 替代 `req.ip ?? ...`。

**`auth.service.ts`** — `login()` 开头：

```typescript
const blocked = await this.ipBlacklistService.isBlocked(ip);
if (blocked.blocked) {
  throw new ForbiddenException('Access denied');
}
```

每个 `UnauthorizedException`（用户不存在、密码错误、status≠1）抛出前：

```typescript
await this.ipBlacklistService.recordLoginFailure(ip);
```

成功登录 **不** 清零失败计数（MVP 简化；窗口 TTL 自然过期）。

**AuthModule** imports `IpBlacklistModule`。

## 10. REST API

Controller：`server/src/modules/ip-blacklist/ip-blacklist.controller.ts`  
前缀：`/security/ip-blacklist`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/` | `security:ip-blacklist:list` | 分页列表 |
| POST | `/` | `security:ip-blacklist:create` | 手动添加 |
| DELETE | `/:id` | `security:ip-blacklist:delete` | 删除/解除 |
| PUT | `/:id/status` | `security:ip-blacklist:update` | 启停 |

POST 校验：IPv4、ip 未在有效封禁中（或 upsert 策略：拒绝重复并 409）。

## 11. Seed

**PERMISSION_SEEDS** 追加：

- `security:ip-blacklist:list`
- `security:ip-blacklist:create`
- `security:ip-blacklist:delete`
- `security:ip-blacklist:update`

**MENU_SEEDS**：在「系统管理」下新增：

- name: `IP黑名单`
- path: `/system/ip-blacklist`
- component: `views/system/ip-blacklist/index`
- permission: `security:ip-blacklist:list`
- sort: 7（在线会话之后）

超级管理员角色绑定新权限。

## 12. Admin UI

路径：`admin/src/views/system/ip-blacklist/`

| 文件 | 说明 |
|------|------|
| `index.vue` | ArtListPanel + useTable + search（ip/来源/状态） |
| `modules/ip-blacklist-dialog.vue` | 新增：ip、remark、expiresAt（DateTimePicker，空=永久） |

**表格列**：ip、source（tag）、status（switch 或 tag）、expiresAt、remark、createdAt、操作（删除）

**按钮**：新增 `v-permission="security:ip-blacklist:create"`；删除 `security:ip-blacklist:delete`

**API**：`admin/src/api/ip-blacklist.ts`

**路由**：在 system 路由组注册 lazy route。

标杆：`online-session/index.vue` + `user/modules/user-dialog.vue`。

## 13. 测试

### 13.1 e2e `server/test/ip-blacklist.e2e-spec.ts`

使用 TEST-NET IP `203.0.113.50` 避免污染本机：

1. admin 登录获取 token
2. POST 手动封禁 → GET `/api/users` 403
3. DELETE 解除 → GET 200
4. 循环错误密码登录 10 次 → 403
5. 白名单 127.0.0.1 失败登录不计入（可选 mock header）
6. 无 create 权限 POST → 403

### 13.2 单元

- `resolve-client-ip.spec.ts`：direct / XFF / trustProxy off
- `is-ipv4.spec.ts`

### 13.3 浏览器 E2E

`e2e/specs/modules/ip-blacklist.spec.ts`：

- 列表加载（`@scenario:list`）
- 搜索筛选（`@scenario:search`）
- 添加封禁弹窗取消（`@scenario:create`）
- 解除确认取消（`@scenario:delete`；列表无数据时 skip）

`.verify/inventory.yaml` 登记 `id: ip-blacklist`。

### 13.4 验证命令

```bash
pnpm lint
pnpm --filter @nova/shared-types build
pnpm --filter @nova/server test
pnpm --filter @nova/server test:e2e -- ip-blacklist
pnpm exec playwright test e2e/specs/modules/ip-blacklist.spec.ts
```

## 14. 与 OpenSpec 对齐说明

- MVP 仅 IPv4 字面量；IPv6/CIDR 为非目标
- 手动 `expiresAt` null = 永久；自动封禁必有过期时间
- `GET /health` 不拦截
- 登录已封禁 IP 返回 403，不泄露用户名是否存在
