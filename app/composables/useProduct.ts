import { ref } from 'vue'
import type { Product, ProductResponse } from '~/types'


const products = ref<Product[]>([])
const loading = ref(false)
const error = ref('')

export function useProduct() {
    const { $swal } = useNuxtApp()

    const fetchProducts = async (companyId?: number) => {
        loading.value = true
        error.value = ''
        try {
            let url = '/api/product'
            if (companyId) url += `?companyId=${companyId}`

            const res = await $fetch<ProductResponse>(url)

            if (res.success && res.data) {
                products.value = Array.isArray(res.data) ? res.data : [res.data]
            } else {
                error.value = res.error ?? 'Failed to fetch products'
                $swal.fire('Error', error.value, 'error')
            }

        } catch (e: any) {
            error.value = e.message
            $swal.fire('Error', e.message, 'error')
        }
        loading.value = false
    }

    const createProduct = async (name: string, description: string, price: number, companyId: number, file?: File) => {
        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('description', description)
            formData.append('price', price.toString())
            formData.append('companyId', companyId.toString())
            if (file) formData.append('image', file)

            const res = await $fetch<ProductResponse>('/api/product', {
                method: 'POST',
                body: formData
            })

            if (res.success) {
                await fetchProducts(companyId)
                $swal.fire('Success', 'Product created successfully!', 'success')
            } else {
                $swal.fire('Error', res.error ?? 'Failed to create product', 'error')
            }

            return res
        } catch (err: any) {
            $swal.fire('Error', err.message, 'error')
            return { success: false }
        }
    }

    const updateProduct = async (id: number, name: string, description: string, price: number, companyId: number, file?: File) => {
        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('description', description)
            formData.append('price', price.toString())
            formData.append('companyId', companyId.toString())
            if (file) formData.append('image', file)

            const res = await $fetch<ProductResponse>(`/api/product/${id}`, {
                method: 'PUT',
                body: formData
            })

            if (res.success) {
                await fetchProducts(companyId)
                $swal.fire('Success', 'Product updated successfully!', 'success')
            } else {
                $swal.fire('Error', res.error ?? 'Failed to update product', 'error')
            }

            return res
        } catch (err: any) {
            $swal.fire('Error', err.message, 'error')
            return { success: false }
        }
    }

    const deleteProduct = async (id: number, companyId?: number) => {
        const { isConfirmed } = await $swal.fire({
            title: 'Are you sure?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        })

        if (!isConfirmed) return { success: false }

        try {
            const res = await $fetch<ProductResponse>(`/api/product/${id}`, { method: 'DELETE' })
            
            if (res.success) {
                await fetchProducts(companyId)
                $swal.fire('Deleted!', 'Product has been deleted.', 'success')
            } else {
                $swal.fire('Error', res.error ?? 'Failed to delete product', 'error')
            }

            return res
        } catch (err: any) {
            $swal.fire('Error', err.message, 'error')
            return { success: false }
        }
    }

    return {
        products,
        loading,
        error,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct
    }
}
