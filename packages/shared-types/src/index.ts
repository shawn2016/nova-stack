/** 统一 API 响应结构 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 分页请求参数 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** 分页响应结果 */
export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** 通用错误码 */
export enum ErrorCode {
  SUCCESS = 0,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
}

export type {
  AdminInfo,
  AdminLoginRequest,
  AdminLoginResponse,
  AdminMeResponse,
  ChangePasswordDto,
  JwtPayload,
  MemberInfo,
  MemberLoginRequest,
  MemberLoginResponse,
  MemberRegisterRequest,
  MenuNode,
  RefreshTokenRequest,
  TokenPair,
  UpdateProfileDto,
  UploadResult,
} from './auth.js';

export type {
  Article,
  ArticleListItem,
  CreateArticleDto,
  UpdateArticleDto,
} from './article.js';

export type {
  AssignRolePermissionsDto,
  AssignUserRolesDto,
  CreateMenuDto,
  CreateRoleDto,
  CreateUserDto,
  SysMenuListItem,
  SysRoleDetail,
  SysRoleListItem,
  SysUserDetail,
  SysUserListItem,
  UpdateMenuDto,
  UpdateRoleDto,
  UpdateUserDto,
} from './rbac.js';
