<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCompany } from '~/composables/useCompany'

const {
  companies,
  company,
  loading,
  error,
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany
} = useCompany()

const filePreview = ref<string>('')


// apakah user cuma punya 1 company?
const hasSingleCompany = computed(() => company.value !== null)

// FORM CREATE
const form = ref({
  name: '',
  address: '',
  phone: '',
  email: '',
  about: '',
  logo: null as File | null
})

const fileInput = ref<HTMLInputElement | null>(null)

// MODAL UPDATE
const editingCompany = ref<any>(null)
const showEdit = ref(false)

// MODAL DELETE
const deletingId = ref<number | null>(null)
const showDelete = ref(false)

// FETCH
onMounted(() => fetchCompanies())
watch(company, (val) => {
  if (val) {
    form.value = {
      name: val.name || '',
      address: val.address || '',
      phone: val.phone || '',
      email: val.email || '',
      about: val.about || '',
      logo: null
    }
    filePreview.value = val.logo || ''
  }
})


const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input?.files?.[0] ?? null
  console.log("FILE TERPilih:", file) // 

  form.value.logo = file

  if (file) {
    // Hapus preview lama agar tidak memory leak
    if (filePreview.value) {
      URL.revokeObjectURL(filePreview.value)
    }

    filePreview.value = URL.createObjectURL(file)
  } else {
    filePreview.value = ''
  }
}


const triggerFileSelect = () => fileInput.value?.click()

// CREATE
const submitCreate = async () => {
  const res = await createCompany({ ...form.value })
  if (res.success) {
    form.value = { name: '', address: '', phone: '', email: '', about: '', logo: null }
    fileInput.value && (fileInput.value.value = '')
  }
}

// EDIT
const openEdit = (item: any) => {
  console.log('edit', item)
  editingCompany.value = { ...item }
  showEdit.value = true
}

const submitUpdate = async () => {
  await updateCompany(editingCompany.value.id, editingCompany.value)
  showEdit.value = false
}

// DELETE
const confirmDelete = (id: number) => {
  deletingId.value = id
  showDelete.value = true
}

const handleDelete = async () => {
  await deleteCompany(deletingId.value!)
  showDelete.value = false
  deletingId.value = null
}
</script>


<template>
  <UDashboardPanel id="company">
    <!-- HEADER -->
    <template #header>
      <UDashboardNavbar title="Company">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <!-- CREATE FORM (Modernized) -->
      <UDashboardToolbar class="mt-6 mx-6 flex flex-col gap-6 bg-white/70 dark:bg-gray-900/40 
               backdrop-blur-xl border border-gray-200 dark:border-gray-800 
               rounded-3xl p-6 shadow-sm">

        <h2 class="text-xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">
         Change Company
        </h2>

        <!-- INPUT GRID -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">

          <!-- Row 1 -->
          <UFormField label="Company Name" class="md:col-span-1">
            <UInput class="w-full" v-model="form.name" placeholder="Enter company name" />
          </UFormField>

          <UFormField label="Phone" class="md:col-span-1">
            <UInput class="w-full" v-model="form.phone" placeholder="Enter phone number" />
          </UFormField>

          <!-- Row 2 — Email (1 col) + Address (2 col) -->
          <UFormField label="Email" class="md:col-span-2">
            <UInput class="w-full" v-model="form.email" placeholder="Enter email" />
          </UFormField>

          <UFormField label="Address" class="md:col-span-2">
            <UInput class="w-full" v-model="form.address" placeholder="Enter address" />
          </UFormField>

          <!-- Row 3 -->
          <UFormField label="About" class="md:col-span-3">
            <UTextarea class="w-full" v-model="form.about" placeholder="Short company description" autoresize
              :rows="3" />
          </UFormField>

        </div>



        <!-- UPLOAD LOGO -->
        <input type="file" ref="fileInput" class="hidden" @change="onFileChange" />

        <div class="flex items-center gap-6 mt-2">
          <div @click="triggerFileSelect" class="relative cursor-pointer flex flex-col items-center justify-center 
           w-40 h-40 rounded-2xl border-2 border-dashed border-gray-300 
           dark:border-gray-700 bg-white/40 dark:bg-gray-800/40
           hover:border-primary-500 hover:bg-primary-50/20 
           transition-all backdrop-blur-sm group">
            <i class="i-heroicons-photo text-4xl text-gray-400 group-hover:text-primary-500"></i>

            <p class="mt-2 text-sm text-gray-500 group-hover:text-primary-500">
              {{ filePreview ? 'Change Logo' : 'Upload Logo' }}
            </p>
          </div>

          <transition name="fade">
            <img v-if="filePreview" :src="filePreview"
              class="w-32 h-32 rounded-xl object-cover border border-gray-300 dark:border-gray-700 shadow-lg" />
          </transition>
        </div>


        <div class="flex justify-end">
          <UButton v-if="!hasSingleCompany" color="primary" size="lg" icon="i-heroicons-plus"
            class="px-6 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all" @click="submitCreate">
            Add
          </UButton>

          <UButton v-else color="primary" size="lg" icon="i-heroicons-check"
            class="px-6 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all"
            @click="updateCompany(company!.id, form)">
            Save Changes
          </UButton>
        </div>
      </UDashboardToolbar>
    </template>

    <!-- BODY -->
    <template #body>
      <div v-if="loading" class="text-center py-6">Loading...</div>
      <div v-if="error" class="text-red-500 text-center py-2">{{ error }}</div>

      <!-- LIST COMPANY -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 mx-6">

        <UCard v-for="item in companies" :key="item.id" class="p-6 flex flex-col items-center text-center rounded-3xl shadow-sm 
                 border border-gray-200 dark:border-gray-800 hover:shadow-md 
                 transition-all hover:scale-[1.02] backdrop-blur-sm">

          <img v-if="item.logo" :src="item.logo" class="w-24 h-24 rounded-xl object-cover shadow mb-3" />

          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {{ item.name }}
          </h2>

          <p class="text-gray-500">{{ item.email }}</p>
          <p class="text-gray-500">{{ item.phone }}</p>

          <div class="flex gap-3 mt-4">
            <UButton size="sm" @click="openEdit(item)">Edit</UButton>
            <UButton size="sm" color="error" variant="outline" @click="confirmDelete(item.id)">Delete</UButton>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>

  <!-- EDIT MODAL -->
  <UModal v-if="showEdit" :open="showEdit" @close="showEdit = false">
    <template #body>
      <UCard v-if="editingCompany" class="rounded-2xl">
        <template #header>
          <h3 class="text-lg font-semibold">Edit Company</h3>
        </template>

        <div class="space-y-4 p-4">
          <UInput v-model="editingCompany.name" label="Name" />
          <UInput v-model="editingCompany.phone" label="Phone" />
          <UInput v-model="editingCompany.email" label="Email" />
          <UInput v-model="editingCompany.address" label="Address" />
          <UInput v-model="editingCompany.about" label="About" />

          <div class="flex justify-end gap-3 mt-4">
            <UButton variant="outline" @click="showEdit = false">Cancel</UButton>
            <UButton color="primary" @click="submitUpdate">Save</UButton>
          </div>
        </div>
      </UCard>
    </template>
  </UModal>

  <!-- DELETE MODAL -->
  <UModal v-model="showDelete" title="Delete Company" prevent-close>
    <template #body>
      <div class="p-4 text-center space-y-3">
        <p>Are you sure you want to delete this company?</p>

        <div class="flex justify-center gap-3 mt-4">
          <UButton variant="outline" @click="showDelete = false">Cancel</UButton>
          <UButton color="error" @click="handleDelete">Yes, Delete</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
