<script setup lang="ts">
import { ref, onMounted, computed, watchEffect } from 'vue'
import { useGallery } from '~/composables/useGallery'
import { useDashboard } from '~/composables/useDashboard'
import { useAuth } from '~/composables/useAuth'

const { galleries, loading, error, fetchGalleries, createGallery, deleteGallery } = useGallery()
const { isNotificationsSlideoverOpen } = useDashboard()
const { user, loadToken } = useAuth()

const newTitle = ref('')
const newFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const galleryToDelete = ref<number | null>(null)
const showConfirm = ref(false)
const companyId = ref<number | null>(null)

// Load user di component (jika belum di-load)
onMounted(() => loadToken())

// watch user.value sampai ada data, baru set companyId & fetch galleries
watchEffect(() => {
    if (user.value?.company?.id) {
        companyId.value = user.value.company.id
        fetchGalleries(companyId.value)
    }
})

const triggerFileSelect = () => fileInput.value?.click()

const filePreview = computed(() => {
    if (!newFile.value) return ''
    return URL.createObjectURL(newFile.value)
})

const onFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement | null
    newFile.value = target?.files?.[0] ?? null
}

const submitCreate = async () => {
    if (!companyId.value) return
    if (newTitle.value && newFile.value) {
        const res = await createGallery(newTitle.value, newFile.value, companyId.value)
        if (res.success) {
            newTitle.value = ''
            newFile.value = null
            if (fileInput.value) fileInput.value.value = ''
        } else {
            console.error('Failed to create gallery:', res.error)
        }
    }
}


const confirmDelete = (id: number) => {
    galleryToDelete.value = id
    showConfirm.value = true
}

const handleConfirmDelete = async () => {
    if (galleryToDelete.value !== null) {
        await deleteGallery(galleryToDelete.value)
        showConfirm.value = false
        galleryToDelete.value = null
    }
}

</script>

<template>
    <UDashboardPanel id="gallery">
        <template #header>
            <UDashboardNavbar title="Gallery">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
            </UDashboardNavbar>

            <UDashboardToolbar
                class="mt-6 mx-6 flex flex-col md:flex-row gap-4 bg-white/70 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">

                <UInput type="text" v-model="newTitle" placeholder="Gallery Title" class="flex-3" />

                <div class="relative group flex items-center justify-center px-5 py-3 rounded-xl border-2 border-dashed
          border-gray-300 dark:border-gray-700 hover:border-primary-400 transition-all cursor-pointer
          bg-white/30 dark:bg-gray-800/30 hover:bg-primary-50/30 dark:hover:bg-primary-950/20 min-w-[180px]">
                    <div class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                        <i class="i-heroicons-cloud-arrow-up text-lg text-primary-500"></i>
                        <span>{{ newFile ? 'Change Image' : 'Select Image' }}</span>
                    </div>
                    <input type="file" @change="onFileChange" ref="fileInput"
                        class="absolute inset-0 opacity-0 cursor-pointer" />
                </div>

                <div class="flex items-center gap-4">
                    <transition name="fade">
                        <div v-if="newFile"
                            class="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 shadow-sm">
                            <img :src="filePreview" alt="Preview"
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                    </transition>

                    <UButton color="primary" size="lg" icon="i-heroicons-plus"
                        class="px-6 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-95"
                        @click="submitCreate">
                        Add
                    </UButton>
                </div>
            </UDashboardToolbar>
        </template>

        <template #body>
            <div v-if="loading" class="text-center py-4">Loading...</div>
            <div v-if="error" class="text-red-500 py-2">{{ error }}</div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <UCard v-for="gallery in galleries" :key="gallery.id" class="p-3 flex flex-col">
                    <img :src="gallery.image" alt="" class="w-full h-48 object-cover rounded-md mb-2" />
                    <h3 class="text-lg font-medium mb-2">{{ gallery.title }}</h3>
                    <UButton color="error" variant="outline" size="sm" @click="confirmDelete(gallery.id)">
                        Delete
                    </UButton>
                </UCard>
            </div>
        </template>
    </UDashboardPanel>

    <!-- ✅ Modal Konfirmasi Delete -->
    <!-- Tambahkan di bawah </UDashboardPanel> -->
    <UModal v-if="showConfirm" :open="showConfirm" title="Delete Confirmation" prevent-close
        @close="showConfirm = false">
        <template #body>
            <div class="p-4 text-center space-y-3">
                <p class="text-gray-700 dark:text-gray-300">
                    Are you sure you want to delete this gallery?
                </p>
                <div class="flex justify-center gap-3 mt-4">
                    <UButton color="primary" variant="outline" @click="showConfirm = false">
                        Cancel
                    </UButton>
                    <UButton color="error" @click="handleConfirmDelete">
                        Yes, Delete
                    </UButton>
                </div>
            </div>
        </template>
    </UModal>
</template>
