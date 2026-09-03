/** bigint 主键序列化为 API string id */
export function toApiId(id: string | number | bigint): string {
  return String(id);
}
