import { ref } from 'vue'
import type { Gallery, GalleryResponse } from '~/types'

const galleries = ref<Gallery[]>([])
const loading = ref(false)
const error = ref('')

export function useGallery() {
    const fetchGalleries = async (companyId?: number) => {
        loading.value = true
        error.value = ''
        try {
            let url = '/api/gallery'
            if (companyId) url += `?companyId=${companyId}`
            const res = await $fetch<GalleryResponse>(url)
            if (res.success && res.data) {
                galleries.value = Array.isArray(res.data) ? res.data : [res.data]
            } else {
                error.value = res.error ?? 'Failed to fetch galleries'
            }
        } catch (e: any) {
            error.value = e.message
        }
        loading.value = false
    }

    const createGallery = async (title: string, file: File, companyId: number) => {
        const formData = new FormData()
        formData.append('title', title)
        formData.append('image', file)
        formData.append('companyId', companyId.toString())

        const res = await $fetch<GalleryResponse>('/api/gallery', {
            method: 'POST',
            body: formData,
        })
        if (res.success) await fetchGalleries(companyId)
        return res
    }

    const updateGallery = async (id: number, title: string, companyId: number, file?: File) => {
        const formData = new FormData()
        formData.append('title', title)
        formData.append('companyId', companyId.toString())
        if (file) formData.append('image', file)

        const res = await $fetch<GalleryResponse>(`/api/gallery/${id}`, {
            method: 'PUT',
            body: formData,
        })
        if (res.success) await fetchGalleries(companyId)
        return res
    }

    const deleteGallery = async (id: number, companyId?: number) => {
        const res = await $fetch<GalleryResponse>(`/api/gallery/${id}`, { method: 'DELETE' })
        if (res.success) await fetchGalleries(companyId)
        return res
    }

    return { galleries, loading, error, fetchGalleries, createGallery, updateGallery, deleteGallery }
}
