/** JWT 令牌对 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** B 端管理员信息 */
export interface AdminInfo {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  roles: string[];
  permissions: string[];
}

/** C 端会员信息 */
export interface MemberInfo {
  id: string;
  phone: string;
  nickname: string;
  avatar: string;
}

/** 菜单树节点 */
export interface MenuNode {
  id: string;
  name: string;
  path: string;
  component: string;
  icon: string;
  type: 'directory' | 'menu' | 'button';
  children?: MenuNode[];
}

/** JWT 载荷 */
export interface JwtPayload {
  sub: string;
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

/** 更新当前管理员资料请求 */
export interface UpdateProfileDto {
  nickname?: string;
  avatar?: string;
}

/** 修改当前管理员密码请求 */
export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

/** 文件上传结果 */
export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}
