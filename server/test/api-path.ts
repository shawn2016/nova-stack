/** e2e 请求路径：与 server setGlobalPrefix('api') 一致 */
export function apiPath(path: string): string {
  return path.startsWith('/') ? `/api${path}` : `/api/${path}`;
}
