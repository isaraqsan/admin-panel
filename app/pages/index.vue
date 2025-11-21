<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useBanner } from '~/composables/useBanner'
import type { Banner } from '~/types'

// --- Banner composable ---
const { data, loading, error, fetchBanner, createBanner, updateBanner, deleteBanner } = useBanner()

onMounted(() => fetchBanner())

/* -------------------------------------------------------
   CREATE MODAL
------------------------------------------------------- */
const createModal = ref(false)

const newTitle = ref('')
const newImage = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const newPreview = computed(() =>
  newImage.value ? URL.createObjectURL(newImage.value) : ''
)

const onNewFile = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) newImage.value = target.files[0]
}

const isVideo = (url: string) => {
  if (!url) return false
  return url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm')
}

const submitCreate = async () => {
  if (!newImage.value) return alert('Image wajib diupload!')

  const res = await createBanner({
    title: newTitle.value || undefined,
    image: newImage.value,
    sectionId: 2
  })

  if (res.success) {
    newTitle.value = ''
    newImage.value = null
    if (fileInput.value) fileInput.value.value = ''
    createModal.value = false
    fetchBanner()
  } else {
    alert(res.error || 'Gagal menambah banner')
  }
}

/* -------------------------------------------------------
   EDIT MODAL
------------------------------------------------------- */
const editModal = ref(false)
const editId = ref<number | null>(null)
const editTitle = ref('')
const editImage = ref<File | null>(null)
const editExistingImage = ref('')

const editFileInput = ref<HTMLInputElement | null>(null)

const editPreview = computed(() =>
  editImage.value
    ? URL.createObjectURL(editImage.value)
    : editExistingImage.value
)

const onEditFile = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) editImage.value = target.files[0]
}

const openEditModal = (banner: Banner) => {
  editId.value = banner.id
  editTitle.value = banner.title || ''
  editExistingImage.value = banner.image
  editImage.value = null

  if (editFileInput.value) editFileInput.value.value = ''
  editModal.value = true
}

const submitEdit = async () => {
  if (!editId.value) return

  const res = await updateBanner(
    editId.value,
    {
      title: editTitle.value || undefined,
      image: editImage.value ?? undefined,
      sectionId: 2
    }
  )

  if (res.success) {
    editModal.value = false
    fetchBanner()
  } else {
    alert(res.error || 'Gagal mengupdate banner')
  }
}

/* -------------------------------------------------------
   DELETE
------------------------------------------------------- */
const deleteModal = ref(false)
const deleteId = ref<number | null>(null)

const confirmDelete = (id: number) => {
  deleteId.value = id
  deleteModal.value = true
}

const submitDelete = async () => {
  if (!deleteId.value) return
  await deleteBanner(deleteId.value)
  deleteModal.value = false
  fetchBanner()
}
</script>


<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-plus" size="md" class="rounded-full" @click="createModal = true" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="loading" class="text-center py-4">Loading banners...</div>
      <div v-if="error" class="text-red-500 py-2">{{ error }}</div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <UCard v-for="banner in data as Banner[]" :key="banner.id" class="p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800
         bg-white/70 dark:bg-gray-900/40 backdrop-blur-md flex flex-col">
          <!-- Image -->
          <div class="w-full h-48 rounded-xl overflow-hidden mb-4">
            <template v-if="isVideo(banner.image)">
              <video class="w-full h-full object-cover will-change-transform"  autoplay muted loop playsinline>
                <source :src="banner.image" type="video/mp4" />
              </video>
            </template>

            <template v-else>
              <img :src="banner.image" :alt="banner.title" class="w-full h-full object-cover" loading="lazy" />
            </template>
          </div>

          <!-- Title -->
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {{ banner.title }}
            </h3>
          </div>

          <!-- Buttons -->
          <div class="flex justify-between mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
            <UButton color="primary" variant="outline" size="sm" icon="i-lucide-pencil" @click="openEditModal(banner)">
              Edit
            </UButton>

            <UButton color="error" variant="outline" size="sm" icon="i-lucide-trash" @click="confirmDelete(banner.id)">
              Delete
            </UButton>
          </div>
        </UCard>

      </div>
    </template>
  </UDashboardPanel>

  <!-- CREATE MODAL -->
  <UModal v-model="createModal" :open="createModal">
    <template #header>
      <div class="px-4 pt-4 pb-2">
        <h2 class="text-xl font-semibold tracking-tight">Tambah Banner</h2>
        <p class="text-sm text-gray-500">Isi data dan upload gambar.</p>
      </div>
    </template>

    <template #body>
      <div class="px-4 pb-4">
        <UForm :state="{}" class="space-y-6">
          <UFormField label="Title">
            <UInput v-model="newTitle" placeholder="Masukkan judul banner" />
          </UFormField>

          <UFormField label="Image">
            <label
              class="border border-gray-300 rounded-xl p-4 w-full text-center flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition">
              <div class="text-gray-400 text-sm">Klik untuk upload gambar</div>
              <input type="file" class="hidden" ref="fileInput" @change="onNewFile" />
            </label>
          </UFormField>

          <div v-if="newImage" class="flex justify-center">
            <div class="w-36 h-36 rounded-xl overflow-hidden border">
              <img :src="newPreview" class="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        </UForm>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3 pt-4 border-t">
        <UButton variant="outline" @click="createModal = false">Cancel</UButton>
        <UButton color="primary" @click="submitCreate">Save</UButton>
      </div>
    </template>
  </UModal>

  <!-- EDIT MODAL -->
  <UModal v-model="editModal" :open="editModal">
    <template #header>
      <div class="px-4 pt-4 pb-2">
        <h2 class="text-xl font-semibold">Edit Banner</h2>
        <p class="text-sm text-gray-500">Update informasi banner.</p>
      </div>
    </template>

    <template #body>
      <div class="px-4 pb-4">
        <UForm :state="{}" class="space-y-6">
          <UFormField label="Title">
            <UInput v-model="editTitle" placeholder="Masukkan judul" />
          </UFormField>

          <UFormField label="Image">
            <label
              class="border border-gray-300 rounded-xl p-4 w-full text-center flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition">
              <div class="text-gray-400 text-sm">Klik untuk upload gambar baru</div>
              <input type="file" class="hidden" ref="editFileInput" @change="onEditFile" />
            </label>
          </UFormField>

          <!-- Preview -->
          <div v-if="editPreview" class="flex justify-center">
            <div class="w-36 h-36 rounded-xl overflow-hidden border">
              <img :src="editPreview" class="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        </UForm>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3 pt-4 border-t">
        <UButton variant="outline" @click="editModal = false">Cancel</UButton>
        <UButton color="primary" @click="submitEdit">Save Changes</UButton>
      </div>
    </template>
  </UModal>
  <!-- DELETE MODAL -->
  <UModal v-model:open="deleteModal" title="Delete Banner?">
    <template #body>
      <div class="p-4 text-center">
        <p class="text-gray-700 dark:text-gray-300">Are you sure?</p>
        <div class="flex justify-center gap-4 mt-5">
          <UButton variant="outline" @click="deleteModal = false">Cancel</UButton>
          <UButton color="error" @click="submitDelete">Delete</UButton>
        </div>
      </div>
    </template>
  </UModal>

</template>
