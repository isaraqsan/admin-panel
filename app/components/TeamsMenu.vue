<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useAuth } from '~/composables/useAuth'

defineProps<{ collapsed?: boolean }>()

const { user } = useAuth()

// selectedTeam tetap dipakai untuk tampilan saja
const selectedTeam = ref<{ 
  label: string; 
  avatar: { src: string; alt: string } 
} | null>(null)

// isi dari user
const team = computed(() => {
  if (!user.value) return null
  return {
    label: user.value.company.name,
    avatar: {
      src: user.value.company.logo || '/default-company-logo.png',
      alt: user.value.company.name
    }
  }
})

// update otomatis
watchEffect(() => {
  selectedTeam.value = team.value
})
</script>

<template>
  <!-- Hapus UDropdownMenu -->
  <UButton 
    v-if="selectedTeam"
    :avatar="selectedTeam.avatar"
    :label="collapsed ? undefined : selectedTeam.label"
    color="neutral"
    variant="ghost"
    block
    :square="collapsed"
    class="py-2"
  />
</template>
