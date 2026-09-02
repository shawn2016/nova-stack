import type { DictOption } from '@nova/shared-types'
import { fetchDictOptionsByType } from '@/api/dict'

export function useDict(typeCode: string) {
  const options = ref<DictOption[]>([])
  const loading = ref(false)

  onMounted(async () => {
    loading.value = true
    try {
      options.value = await fetchDictOptionsByType(typeCode)
    } catch (error) {
      options.value = []
      if (error instanceof Error) {
        ElMessage.error(error.message)
      }
    } finally {
      loading.value = false
    }
  })

  return { options, loading }
}
