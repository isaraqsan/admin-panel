// ~/composables/useLandingPage.ts
import { ref } from 'vue'
import type { LandingPageResponse } from '~/types'

export const useLandingPage = (companyId?: number) => {
  const data = ref<Record<string, any>>({})
  const error = ref<Error | null>(null)
  const pending = ref(false)

  const fetchLandingPage = async () => {
    pending.value = true
    try {
      const query = companyId ? `?companyId=${companyId}` : ''
      const res = await $fetch<LandingPageResponse>(`/api/landing-page${query}`)
      
      if (res.success && res.data) {
        data.value = res.data
      } else {
        error.value = new Error(res.message || 'Failed to fetch landing page')
      }
    } catch (err) {
      error.value = err as Error
    } finally {
      pending.value = false
    }
  }

  fetchLandingPage()

  return { data, error, pending, refresh: fetchLandingPage }
}
