<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useTheme } from '~/composables/useTheme'
import { useAuth } from '~/composables/useAuth'
import { getCurrentCompanyId } from '~/composables/useAuthHelper'

const { theme, loading, error, fetchTheme, createTheme, updateTheme, deleteTheme } = useTheme()
const { user, loadToken } = useAuth()

// CREATE FORM
const newName = ref('')
const newPrimaryColor = ref('')
const newSecondaryColor = ref('')

// UPDATE FORM
const editModal = ref(false)
const editId = ref<number | null>(null)
const editName = ref('')
const editPrimaryColor = ref('')
const editSecondaryColor = ref('')
const editThemeColors = ref<any[]>([]) // simpan colors lama untuk update

// DELETE
const deleteModal = ref(false)
const deleteId = ref<number | null>(null)

// Load user
const companyId = ref<number | null>(1)
onMounted(() => loadToken())

// fetch theme ketika user ready
watchEffect(() => {
  if (user.value?.company?.id) {
    companyId.value = user.value.company.id
    fetchTheme(companyId.value)
  }
})

// CREATE
const submitCreate = async () => {
  if (!companyId.value || !newName.value) return

  await createTheme({
    name: newName.value,
    companyId: companyId.value,
    colors: [
      {
        id: 0,
        mode: 'light',
        bg: newPrimaryColor.value,
        accent: newSecondaryColor.value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })

  newName.value = ''
  newPrimaryColor.value = ''
  newSecondaryColor.value = ''
}

// OPEN EDIT MODAL
const openEdit = (t: any) => {
  editId.value = t.id
  editName.value = t.name
  editThemeColors.value = t.colors || []

  // ambil warna dari colors array
  const lightColor = editThemeColors.value.find(c => c.mode === 'light')
  editPrimaryColor.value = lightColor?.bg || ''
  editSecondaryColor.value = lightColor?.accent || ''

  editModal.value = true
}

// UPDATE
const submitUpdate = async () => {
  if (!companyId.value || !editId.value) return

  const updatedColors = editThemeColors.value.map(c => ({
    ...c,
    bg: editPrimaryColor.value,
    accent: editSecondaryColor.value,
    updatedAt: new Date().toISOString()
  }))

  await updateTheme(companyId.value, {
    id: editId.value,
    name: editName.value,
    colors: updatedColors,
    updatedAt: new Date().toISOString()
  })

  editModal.value = false
}

// DELETE
const confirmDelete = (id: number) => {
  deleteId.value = id
  deleteModal.value = true
}

const submitDelete = async () => {
  if (!deleteId.value) return
  await deleteTheme(deleteId.value)
  deleteModal.value = false
}
</script>


<template>
  <UDashboardPanel id="theme">
    <template #header>
      <UDashboardNavbar title="Themes" />

      <!-- CREATE FORM -->
      <UDashboardToolbar
        class="mt-6 mx-6 flex flex-col md:flex-row gap-4 bg-white/70 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <UInput placeholder="Theme Name" v-model="newName" class="flex-1" />
        <UInput type="color" v-model="newPrimaryColor" class="w-20 h-10 p-0 border-0" title="Primary Color" />
        <UInput type="color" v-model="newSecondaryColor" class="w-20 h-10 p-0 border-0" title="Secondary Color" />
        <UButton color="primary" icon="i-heroicons-plus" @click="submitCreate">Add</UButton>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div v-if="loading" class="text-center py-4">Loading...</div>
      <div v-if="error" class="text-red-500 py-2">{{ error }}</div>

      <div v-if="theme" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <UCard class="p-3 flex flex-col" v-for="t in Array.isArray(theme) ? theme : [theme]" :key="t.id">
          <h3 class="font-medium text-lg">{{ t.name }}</h3>
          <div class="flex gap-2 my-2">
            <div class="w-10 h-10 rounded" :style="{ backgroundColor: t.colors?.[0]?.bg || '#fff' }">
            </div>
            <div class="w-10 h-10 rounded" :style="{ backgroundColor: t.colors?.[0]?.accent || '#000' }">
            </div>
          </div>
          <div class="flex justify-between mt-auto pt-3">
            <UButton color="primary" variant="outline" size="sm" @click="openEdit(t)">Edit</UButton>
            <UButton color="error" variant="outline" size="sm" @click="confirmDelete(t.id)">Delete</UButton>
          </div>
        </UCard>
      </div>

    </template>
  </UDashboardPanel>

  <!-- EDIT MODAL -->
  <UModal v-model="editModal" :open="editModal">
    <template #header>
      <div class="px-4 pt-4 pb-2">
        <h2 class="text-xl font-semibold tracking-tight">Edit Theme</h2>
      </div>
    </template>

    <template #body>
      <div class="px-4 pb-4 space-y-4">
        <UInput placeholder="Theme Name" v-model="editName" />
        <div class="flex gap-2">
          <UInput type="color" v-model="editPrimaryColor" title="Primary Color" />
          <UInput type="color" v-model="editSecondaryColor" title="Secondary Color" />
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <UButton variant="outline" @click="editModal = false">Cancel</UButton>
          <UButton color="primary" @click="submitUpdate">Save Changes</UButton>
        </div>
      </div>
    </template>
  </UModal>

  <!-- DELETE MODAL -->
  <UModal v-model:open="deleteModal" title="Delete Theme?">
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
