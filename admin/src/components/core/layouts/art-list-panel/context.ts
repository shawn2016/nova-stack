import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { ColumnOption } from '@/types/component'

export interface ArtListPanelToolsContext {
  compactTools: ComputedRef<boolean>
  columns: Ref<ColumnOption[]>
  showSearchBar: Ref<boolean | undefined>
  loading: ComputedRef<boolean>
  layout: ComputedRef<string>
  showZebra: ComputedRef<boolean>
  onRefresh: () => void
}

export const ART_LIST_PANEL_TOOLS_KEY: InjectionKey<ArtListPanelToolsContext> =
  Symbol('artListPanelTools')
