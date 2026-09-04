/** 将后端菜单 component 字段规范化为 views 相对路径 */
export function normalizeComponentPath(component: string): string {
  const stripped = component.replace(/^views\//, '').replace(/^\//, '')
  return stripped.replace(/\/index$/, '') || stripped
}
