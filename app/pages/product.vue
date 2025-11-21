<script setup lang="ts">
import { ref, onMounted, computed, watchEffect } from 'vue'
import { useProduct } from '~/composables/useProduct'
import { useDashboard } from '~/composables/useDashboard'
import { useAuth } from '~/composables/useAuth'

const {
  products,
  loading,
  error,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = useProduct()

const { isNotificationsSlideoverOpen } = useDashboard()
const { user, loadToken } = useAuth()

const companyId = ref<number | null>(null)

// CREATE FORM
const newName = ref('')
const newDescription = ref('')
const newPrice = ref<number | null>(null)
const newFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// UPDATE FORM
const editModal = ref(false)
const editId = ref<number | null>(null)
const editName = ref('')
const editDescription = ref('')
const editPrice = ref<number | null>(null)
const editFile = ref<File | null>(null)
const editPreview = computed(() => editFile.value ? URL.createObjectURL(editFile.value) : '')

// DELETE
const deleteModal = ref(false)
const deleteId = ref<number | null>(null)

// Load user
onMounted(() => loadToken())

// ketika user ready → ambil companyId → fetch product
watchEffect(() => {
  if (user.value?.company?.id) {
    companyId.value = user.value.company.id
    fetchProducts(companyId.value)
  }
})

const onFileChange = (event: Event, type: 'create' | 'edit') => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null
  if (type === 'create') newFile.value = file
  else editFile.value = file
}

const submitCreate = async () => {
  if (!companyId.value) return
  if (!newName.value || newPrice.value === null) {
    const { $swal } = useNuxtApp()
    $swal.fire({
      icon: 'error',
      title: 'Missing Fields',
      text: 'Name, Description, and Price cannot be empty!'
    })
    return
  }


  await createProduct(
    newName.value,
    newDescription.value,
    newPrice.value,
    companyId.value,
    newFile.value ?? undefined
  )

  // reset
  newName.value = ''
  newDescription.value = ''
  newPrice.value = null
  newFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

// buka edit modal
const openEdit = (p: any) => {
  editId.value = p.id
  editName.value = p.name
  editDescription.value = p.description
  editPrice.value = p.price
  editFile.value = null
  editModal.value = true
}

// submit update
const submitUpdate = async () => {
  if (!companyId.value || editId.value === null) return

  await updateProduct(
    editId.value,
    editName.value,
    editDescription.value,
    editPrice.value ?? 0,
    companyId.value,
    editFile.value ?? undefined
  )

  editModal.value = false
}

// buka delete modal
const confirmDelete = (id: number) => {
  deleteId.value = id
  deleteModal.value = true
}

const submitDelete = async () => {
  if (!deleteId.value) return
  await deleteProduct(deleteId.value, companyId.value ?? undefined)
  deleteModal.value = false
}
</script>

<template>
  <UDashboardPanel id="product">
    <template #header>
      <UDashboardNavbar title="Products">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <!-- CREATE FORM -->
      <UDashboardToolbar
        class="mt-6 mx-6 flex flex-col md:flex-row gap-4 bg-white/70 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">

        <UInput placeholder="Product Name" v-model="newName" class="flex-1" />
        <UInput placeholder="Description" v-model="newDescription" class="flex-1" />
        <UInput type="number" placeholder="Price" v-model="newPrice" class="flex-1" />

        <!-- File -->
        <div class="relative group flex items-center justify-center px-5 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700
                     hover:border-primary-400 transition-all cursor-pointer bg-white/30 dark:bg-gray-800/30">
          <span class="text-sm text-gray-700 dark:text-gray-200">
            {{ newFile ? 'Change Image' : 'Upload Image' }}
          </span>
          <input type="file" ref="fileInput" @change="e => onFileChange(e, 'create')"
            class="absolute inset-0 opacity-0 cursor-pointer" />
        </div>

        <UButton color="primary" icon="i-heroicons-plus" @click="submitCreate">
          Add
        </UButton>
      </UDashboardToolbar>
    </template>

    <!-- BODY -->
    <template #body>
      <div v-if="loading" class="text-center py-4">Loading...</div>

      <div v-if="error" class="text-red-500 py-2">{{ error }}</div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <UCard v-for="p in products" :key="p.id" class="p-3 flex flex-col">
          <img :src="p.image" class="w-full h-48 object-cover rounded-md mb-2" loading="lazy"/>
          <h3 class="font-medium text-lg">{{ p.name }}</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm mb-2">{{ p.description }}</p>
          <p class="font-semibold text-primary-600 mb-3">$ {{ p.price }}</p>

          <div class="flex justify-between mt-auto pt-3">
            <UButton color="primary" variant="outline" size="sm" @click="openEdit(p)">
              Edit
            </UButton>
            <UButton color="error" variant="outline" size="sm" @click="confirmDelete(p.id)">
              Delete
            </UButton>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>

  <!-- EDIT MODAL -->
  <UModal v-model="editModal" :open="editModal">
    <template #header>
      <div class="px-4 pt-4 pb-2">
        <h2 class="text-xl font-semibold tracking-tight">Edit Product</h2>
        <p class="text-sm text-gray-500">Update product details and image.</p>
      </div>
    </template>

    <template #body>
      <div class="px-4 pb-4">
        <!-- <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-6"> -->

        <UForm :state="{}" class="space-y-6">

          <!-- Product Name -->
          <UFormField label="Product Name">
            <UInput v-model="editName" placeholder="Enter product name" class="w-full" />
          </UFormField>

          <!-- Description -->
          <UFormField label="Description">
            <UInput v-model="editDescription" placeholder="Enter description" class="w-full" />
          </UFormField>


          <!-- Price -->
          <UFormField label="Price">
            <UInput type="number" v-model="editPrice" placeholder="0.00" class="modern-input" />
          </UFormField>

          <!-- Image Upload -->
          <UFormField label="Product Image">
            <label class="border border-gray-300 rounded-xl p-4 w-full text-center
                     flex flex-col items-center justify-center gap-2 cursor-pointer
                     hover:bg-gray-50 transition group">
              <div class="text-gray-400 group-hover:text-gray-600 text-sm">
                Click to upload or replace image
              </div>
              <input type="file" class="hidden" @change="e => onFileChange(e, 'edit')" />
            </label>
          </UFormField>

          <!-- Preview -->
          <div v-if="editFile" class="flex justify-center">
            <div class="w-36 h-36 rounded-xl overflow-hidden border border-gray-200 shadow-md">
              <img :src="editPreview" class="w-full h-full object-cover" loading="lazy"/>
            </div>
          </div>

        </UForm>

        <!-- Footer Buttons -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <UButton variant="outline" @click="editModal = false">
            Cancel
          </UButton>

          <UButton color="primary" @click="submitUpdate">
            Save Changes
          </UButton>
        </div>

        <!-- </div> -->
      </div>
    </template>
  </UModal>



  <!-- DELETE MODAL -->
  <UModal v-model:open="deleteModal" title="Delete Product?">
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
