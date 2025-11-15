import { ref } from 'vue'
import type { TeamResponse, Team } from '~/types'
import { getCurrentCompanyId } from '~/composables/useAuthHelper' // helper dari sebelumnya

export const useTeam = () => {
  const teams = ref<Team[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTeams = async () => {
    const companyId = getCurrentCompanyId()
    if (!companyId) {
      error.value = 'Company ID not found'
      return
    }

    loading.value = true
    try {
      const res = await $fetch<TeamResponse>(`/api/team?companyId=${companyId}`)
      if (res.success && Array.isArray(res.data)) teams.value = res.data
      else teams.value = []
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const createTeam = async (payload: { name: string; position: string; bio?: string; photo?: File | null }) => {
    const companyId = getCurrentCompanyId()
    if (!companyId) {
      return { success: false, error: 'Company ID not found' }
    }

    const formData = new FormData()
    formData.append('name', payload.name)
    formData.append('position', payload.position)
    formData.append('companyId', companyId.toString()) // tambahkan companyId
    if (payload.bio) formData.append('bio', payload.bio)
    if (payload.photo) formData.append('photo', payload.photo)

    const res = await $fetch<TeamResponse>('/api/team', {
      method: 'POST',
      body: formData
    })

    if (res.success && res.data) await fetchTeams()
    return res
  }

  const deleteTeam = async (id: number) => {
    const companyId = getCurrentCompanyId() // opsional, bisa juga fetch ulang
    const res = await $fetch<TeamResponse>(`/api/team/${id}`, { method: 'DELETE' })
    if (res.success) await fetchTeams()
    return res
  }

  return { teams, loading, error, fetchTeams, createTeam, deleteTeam }
}
