/** 全局 REST API 路径前缀（与 Nest setGlobalPrefix、Admin VITE_API_BASE_URL 对齐） */
export const API_PREFIX = 'api';

export const API_ROOT = `/${API_PREFIX}`;

/** 去掉路径中的 /api 前缀，供 Guard、审计等按业务段解析 */
export function stripApiPrefix(path: string): string {
  const normalized = (path.split('?')[0] ?? path).replace(/\/+$/, '') || '/';
  if (normalized === API_ROOT || normalized.startsWith(`${API_ROOT}/`)) {
    const stripped = normalized.slice(API_ROOT.length);
    return stripped || '/';
  }
  return normalized;
}
