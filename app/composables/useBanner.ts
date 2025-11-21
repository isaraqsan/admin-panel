// composables/useBanner.ts
import { ref } from 'vue'
import type { Banner } from '~/types'

export function useBanner() {
    const data = ref<Banner[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // ================================
    // FETCH BANNER
    // ================================
    const fetchBanner = async (sectionId: number | null = 2) => {
        loading.value = true
        error.value = null
        try {
            let url = '/api/banner'
            const params = new URLSearchParams()

            if (sectionId !== null) params.append('sectionId', String(sectionId))

            if ([...params].length) url += `?${params.toString()}`

            const res = await fetch(url)
            const json = await res.json()

            if (json.success) {
                data.value = Array.isArray(json.data) ? json.data : []
            } else {
                error.value = json.error ?? 'Failed to fetch banners'
            }
        } catch (err: any) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    // ================================
    // CREATE BANNER
    // ================================
    const createBanner = async (payload: {
        title?: string
        order?: number
        sectionId: number
        image: File
    }) => {
        loading.value = true
        error.value = null
        try {
            const formData = new FormData()
            if (payload.title) formData.append('title', payload.title)
            if (payload.order !== undefined) formData.append('order', String(payload.order))
            formData.append('sectionId', String(payload.sectionId))
            formData.append('image', payload.image)

            const res = await fetch('/api/banner', {
                method: 'POST',
                body: formData
            })

            const json = await res.json()
            if (!json.success) return { success: false, error: json.error }

            data.value.push(json.data)
            return { success: true, data: json.data }
        } catch (err: any) {
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    // ================================
    // UPDATE BANNER
    // ================================
    const updateBanner = async (id: number, payload: {
        title?: string
        order?: number
        sectionId?: number
        image?: File | null
    }) => {
        loading.value = true
        error.value = null

        try {
            const formData = new FormData()
            if (payload.title) formData.append('title', payload.title)
            if (payload.order !== undefined) formData.append('order', String(payload.order))
            if (payload.sectionId !== undefined) formData.append('sectionId', String(payload.sectionId))
            if (payload.image) formData.append('image', payload.image)

            const res = await fetch(`/api/banner/${id}`, {
                method: 'PUT',
                body: formData
            })

            const json = await res.json()
            if (!json.success) return { success: false, error: json.error }

            // Update reactive data
            const index = data.value.findIndex(b => b.id === id)
            if (index !== -1) data.value[index] = json.data

            return { success: true, data: json.data }
        } catch (err: any) {
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    // ================================
    // DELETE BANNER
    // ================================
    const deleteBanner = async (id: number) => {
        loading.value = true
        error.value = null

        try {
            const res = await fetch(`/api/banner/${id}`, {
                method: 'DELETE'
            })

            const json = await res.json()
            if (!json.success) return { success: false, error: json.error }

            // Hapus dari daftar
            data.value = data.value.filter(b => b.id !== id)

            return { success: true }
        } catch (err: any) {
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    return {
        data,
        loading,
        error,
        fetchBanner,
        createBanner,
        updateBanner,
        deleteBanner
    }
}
