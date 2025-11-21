<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTeam } from '~/composables/useTeam'
import { useDashboard } from '~/composables/useDashboard'

const { teams, loading, error, fetchTeams, createTeam, deleteTeam } = useTeam()
const { isNotificationsSlideoverOpen } = useDashboard()

const newName = ref('')
const newPosition = ref('')
const newBio = ref('')
const newPhoto = ref<File | null>(null)
const previewPhoto = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const teamToDelete = ref<number | null>(null)
const showConfirm = ref(false)

onMounted(() => fetchTeams())

const triggerFileSelect = () => fileInput.value?.click()

const filePreview = computed(() => {
  if (!newPhoto.value) return ''
  return URL.createObjectURL(newPhoto.value)
})

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement | null
  newPhoto.value = target?.files?.[0] ?? null
}

const submitCreate = async () => {
  if (newName.value && newPosition.value) {
    const res = await createTeam({
      name: newName.value,
      position: newPosition.value,
      bio: newBio.value,
      photo: newPhoto.value
    })
    if (res.success) {
      newName.value = ''
      newPosition.value = ''
      newBio.value = ''
      newPhoto.value = null
      if (fileInput.value) fileInput.value.value = ''
    } else {
      console.error('Failed to create team:', res.error)
    }
  }
}

const confirmDelete = (id: number) => {
  teamToDelete.value = id
  showConfirm.value = true
}

const handleConfirmDelete = async () => {
  if (teamToDelete.value !== null) {
    await deleteTeam(teamToDelete.value)
    showConfirm.value = false
    teamToDelete.value = null
  }
}
</script>

<template>
  <UDashboardPanel id="team">
    <template #header>
      <UDashboardNavbar title="Team">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar
        class="mt-6 mx-6 flex flex-col md:flex-row gap-4 bg-white/70 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <UInput type="text" v-model="newName" placeholder="Name" class="flex-1" />
        <UInput type="text" v-model="newPosition" placeholder="Position" class="flex-1" />
        <UInput type="text" v-model="newBio" placeholder="Short Bio" class="flex-2" />

        <div class="relative group flex items-center justify-center px-5 py-3 rounded-xl border-2 border-dashed
          border-gray-300 dark:border-gray-700 hover:border-primary-400 transition-all cursor-pointer
          bg-white/30 dark:bg-gray-800/30 hover:bg-primary-50/30 dark:hover:bg-primary-950/20 min-w-[180px]">
          <div class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <i class="i-heroicons-cloud-arrow-up text-lg text-primary-500"></i>
            <span>{{ newPhoto ? 'Change Image' : 'Select Image' }}</span>
          </div>
          <input type="file" @change="onFileChange" ref="fileInput" class="absolute inset-0 opacity-0 cursor-pointer" />
        </div>

        <div class="flex items-center gap-4">
          <transition name="fade">
            <div v-if="newPhoto"
              class="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 shadow-sm">
              <img :src="filePreview" alt="Preview"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
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
        <UCard v-for="member in teams" :key="member.id" class="p-3 flex flex-col">
          <img v-if="member.photo" :src="member.photo" alt="" class="w-full h-48 object-cover rounded-md mb-2" loading="lazy" />
          <div class=" space-y-1">
            <h3 class="text-lg font-semibold">{{ member.name }}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm">{{ member.position }}</p>
            <p class="text-gray-700 dark:text-gray-300 text-sm mt-1">{{ member.bio }}</p>
          </div>
          <UButton color="error" variant="outline" size="sm" class="mt-3" @click="confirmDelete(member.id)">
            Delete
          </UButton>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Modal Konfirmasi Delete -->
  <UModal v-model:open="showConfirm" title="Delete Confirmation">
    <template #body>
      <div class="p-4 text-center space-y-3">
        <p class="text-gray-700 dark:text-gray-300">
          Are you sure you want to delete this team member?
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
