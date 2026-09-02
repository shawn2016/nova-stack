/** JWT 令牌对 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** B 端管理员信息 */
export interface AdminInfo {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  roles: string[];
  permissions: string[];
}

/** C 端会员信息 */
export interface MemberInfo {
  id: number;
  phone: string;
  nickname: string;
  avatar: string;
}

/** 菜单树节点 */
export interface MenuNode {
  id: number;
  name: string;
  path: string;
  component: string;
  icon: string;
  type: 'directory' | 'menu' | 'button';
  children?: MenuNode[];
}

/** JWT 载荷 */
export interface JwtPayload {
  sub: number;
  type: 'admin' | 'member';
  jti: string;
  iat: number;
  exp: number;
}

/** B 端管理员登录请求 */
export interface AdminLoginRequest {
  username: string;
  password: string;
}

/** C 端会员登录请求 */
export interface MemberLoginRequest {
  phone: string;
  password: string;
}

/** C 端会员注册请求 */
export interface MemberRegisterRequest {
  phone: string;
  password: string;
  nickname?: string;
}

/** B 端管理员登录响应 */
export interface AdminLoginResponse {
  tokens: TokenPair;
  user: AdminInfo;
}

/** C 端会员登录响应 */
export interface MemberLoginResponse {
  tokens: TokenPair;
  user: MemberInfo;
}

/** 刷新令牌请求 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** GET /auth/me 响应（与 AdminInfo 结构一致） */
export type AdminMeResponse = AdminInfo;
