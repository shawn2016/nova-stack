import type { Request } from 'express';

/** 从 Express 请求解析客户端 IP；trustProxy 时取 X-Forwarded-For 首段 */
export function resolveClientIp(req: Request, trustProxy: boolean): string {
  if (trustProxy) {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length > 0) {
      return xff.split(',')[0]?.trim() ?? '';
    }
  }

  return req.ip ?? req.socket?.remoteAddress ?? '';
}
