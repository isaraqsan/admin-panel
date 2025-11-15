import { ref } from 'vue'
import type { Company, CompanyResponse, CompanyPayload } from '~/types'
import { getCurrentCompanyId } from '~/composables/useAuthHelper'

export const useCompany = () => {
    const companies = ref<Company[]>([])
    const company = ref<Company | null>(null)

    const loading = ref(false)
    const error = ref<string | null>(null)

    /**
     * Fetch companies with optional Company ID
     * Logic:
     * - Prioritas 1: companyId argumen manual
     * - Prioritas 2: companyId dari auth helper
     * - Kalau dua-duanya kosong → fetch all company
     */
    const fetchCompanies = async (companyId?: number) => {
        const resolvedId = companyId ?? getCurrentCompanyId()

        loading.value = true
        error.value = null

        try {
            const query = resolvedId ? `?companyId=${resolvedId}` : ''
            const res = await $fetch<CompanyResponse>(`/api/company${query}`)

            if (res.success) {
                if (resolvedId) {
                    // API return 1 object
                    company.value = res.data as Company
                } else {
                    // API return list
                    companies.value = res.data as Company[]
                }
            }
        } catch (e: any) {
            error.value = e.message
        } finally {
            loading.value = false
        }
    }

    /**
     * Create Company
     */
    const createCompany = async (payload: CompanyPayload) => {
        const form = new FormData()

        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                form.append(key, value as any)
            }
        })

        const res = await $fetch('/api/company', {
            method: 'POST',
            body: form
        })

        if (res.success) await fetchCompanies()
        return res
    }

    /**
     * Update
     */
    const updateCompany = async (id: number, payload: Partial<CompanyPayload>) => {
        const form = new FormData()
        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                form.append(key, value as any)
            }
        })

        const res = await $fetch(`/api/company/${id}`, {
            method: 'PUT',
            body: form
        })

        if (res.success) await fetchCompanies()
        return res
    }

    /**
     * Delete
     */
    const deleteCompany = async (id: number) => {
        const res = await $fetch(`/api/company/${id}`, {
            method: 'DELETE'
        })

        if (res.success) await fetchCompanies()
        return res
    }

    return {
        companies,
        company,
        loading,
        error,
        fetchCompanies,
        createCompany,
        updateCompany,
        deleteCompany
    }
}
