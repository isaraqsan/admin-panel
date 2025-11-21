import { ref } from 'vue'
import type { Gallery, GalleryResponse } from '~/types'

const galleries = ref<Gallery[]>([])
const loading = ref(false)
const error = ref('')

export function useGallery() {
    const { $swal } = useNuxtApp()

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
                $swal.fire('Error', error.value, 'error')
            }
        } catch (e: any) {
            error.value = e.message
            $swal.fire('Error', e.message, 'error')
        }
        loading.value = false
    }

    const createGallery = async (title: string, file: File | null, companyId: number) => {
        if (!title || !file) {
            $swal.fire('Missing Data', 'Title and Image are required!', 'warning')
            return { success: false }
        }

        try {
            const formData = new FormData()
            formData.append('title', title)
            formData.append('image', file)
            formData.append('companyId', companyId.toString())

            const res = await $fetch<GalleryResponse>('/api/gallery', {
                method: 'POST',
                body: formData,
            })

            if (res.success) {
                await fetchGalleries(companyId)
                $swal.fire('Success', 'Gallery created successfully!', 'success')
            } else {
                $swal.fire('Error', res.error ?? 'Failed to create gallery', 'error')
            }

            return res
        } catch (err: any) {
            $swal.fire('Error', err.message, 'error')
            return { success: false }
        }
    }

    const updateGallery = async (id: number, title: string, companyId: number, file?: File) => {
        if (!title) {
            $swal.fire('Missing Data', 'Title cannot be empty!', 'warning')
            return { success: false }
        }

        try {
            const formData = new FormData()
            formData.append('title', title)
            formData.append('companyId', companyId.toString())
            if (file) formData.append('image', file)

            const res = await $fetch<GalleryResponse>(`/api/gallery/${id}`, {
                method: 'PUT',
                body: formData,
            })

            if (res.success) {
                await fetchGalleries(companyId)
                $swal.fire('Success', 'Gallery updated successfully!', 'success')
            } else {
                $swal.fire('Error', res.error ?? 'Failed to update gallery', 'error')
            }

            return res
        } catch (err: any) {
            $swal.fire('Error', err.message, 'error')
            return { success: false }
        }
    }

    const deleteGallery = async (id: number, companyId?: number) => {
        const confirm = await $swal.fire({
            title: 'Delete this gallery?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Delete'
        })

        if (!confirm.isConfirmed) return { success: false }

        try {
            const res = await $fetch<GalleryResponse>(`/api/gallery/${id}`, {
                method: 'DELETE'
            })

            if (res.success) {
                await fetchGalleries(companyId)
                $swal.fire('Deleted!', 'Gallery has been removed.', 'success')
            } else {
                $swal.fire('Error', res.error ?? 'Failed to delete gallery', 'error')
            }

            return res
        } catch (err: any) {
            $swal.fire('Error', err.message, 'error')
            return { success: false }
        }
    }

    return {
        galleries,
        loading,
        error,
        fetchGalleries,
        createGallery,
        updateGallery,
        deleteGallery
    }
}
