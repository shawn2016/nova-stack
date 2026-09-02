/** JWT 载荷（sub 为 string，对应 bigint 实体主键） */
export interface JwtPayload {
  sub: string;
  type: 'admin' | 'member';
  jti: string;
  iat: number;
  exp: number;
}

export interface SignTokenParams {
  userId: string;
  type: 'admin' | 'member';
}
