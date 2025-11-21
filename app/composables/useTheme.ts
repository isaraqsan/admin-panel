// composables/useTheme.ts
import { ref } from 'vue'
import type { Theme, ThemeColor, ThemeResponse } from '~/types'
import { getCurrentCompanyId } from '~/composables/useAuthHelper'

export function useTheme() {
  const theme = ref<Theme | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTheme = async (companyId: number) => {
    const resolvedId = companyId ?? getCurrentCompanyId()
    loading.value = true
    error.value = null
    try {
      const res = await $fetch<ThemeResponse>('/api/theme/' + resolvedId)
      if (res.success) {
        theme.value = res.data as Theme
      } else {
        error.value = res.error || 'Failed to fetch theme'
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const createTheme = async (data: Partial<Theme> & { colors?: ThemeColor[] }) => {
    loading.value = true
    error.value = null
    try {
      const res = await $fetch<ThemeResponse>('/api/theme', {
        method: 'POST',
        body: data
      })
      if (res.success) {
        theme.value = res.data as Theme
      } else {
        error.value = res.error || 'Failed to create theme'
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const updateTheme = async (companyId: number, data: Partial<Theme> & { colors?: ThemeColor[] }) => {
    loading.value = true
    error.value = null
    try {
      const res = await $fetch<ThemeResponse>('/api/theme/' + companyId, {
        method: 'PUT',
        body: data
      })
      if (res.success) {
        theme.value = res.data as Theme
      } else {
        error.value = res.error || 'Failed to update theme'
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const deleteTheme = async (companyId: number) => {
    loading.value = true
    error.value = null
    try {
      const res = await $fetch<ThemeResponse>('/api/theme/' + companyId, { method: 'DELETE' })
      if (res.success) {
        theme.value = null
      } else {
        error.value = res.error || 'Failed to delete theme'
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return {
    theme,
    loading,
    error,
    fetchTheme,
    createTheme,
    updateTheme,
    deleteTheme
  }
}
