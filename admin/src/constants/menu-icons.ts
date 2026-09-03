import * as ElementPlusIcons from '@element-plus/icons-vue'

/** 菜单常用 Iconify 图标（Remix Icon） */
export const MENU_ICON_PRESETS = [
  'ri:settings-3-line',
  'ri:user-line',
  'ri:shield-user-line',
  'ri:menu-line',
  'ri:folder-line',
  'ri:article-line',
  'ri:file-list-3-line',
  'ri:dashboard-line',
  'ri:home-line',
  'ri:lock-line',
  'ri:key-line',
  'ri:team-line',
  'ri:group-line',
  'ri:shopping-bag-line',
  'ri:store-line',
  'ri:bar-chart-line',
  'ri:pie-chart-line',
  'ri:notification-line',
  'ri:mail-line',
  'ri:image-line',
  'ri:video-line',
  'ri:tools-line',
  'ri:database-line',
  'ri:cloud-line',
] as const

function toKebabCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

/** Element Plus 图标（Iconify ep: 前缀） */
export function buildElementPlusIconIds(): string[] {
  return Object.keys(ElementPlusIcons)
    .filter((key) => /^[A-Z]/.test(key))
    .map((key) => `ep:${toKebabCase(key)}`)
    .sort((a, b) => a.localeCompare(b))
}

/** 可选图标全集：常用 ri + Element Plus */
export const MENU_ICON_CATALOG: string[] = [
  ...new Set([...MENU_ICON_PRESETS, ...buildElementPlusIconIds()]),
]

/** 每页展示数量（6 列 × 5 行） */
export const MENU_ICON_PAGE_SIZE = 30
