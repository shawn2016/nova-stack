import { MenuProcessor } from '@/router/core/MenuProcessor'
import { useMenuStore } from '@/store/modules/menu'

/** 重新拉取后端菜单并刷新侧栏（新增路由需重新登录或刷新页面） */
export async function refreshAppMenus(): Promise<void> {
  const processor = new MenuProcessor()
  const menuList = await processor.getMenuList()
  useMenuStore().setMenuList(menuList)
}
