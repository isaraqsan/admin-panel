<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import type { DropdownMenuItem } from '@nuxt/ui'
import { useAuth } from '~/composables/useAuth'

defineProps<{ collapsed?: boolean }>()

const { user } = useAuth()

// selectedTeam juga harus reactive
const selectedTeam = ref<{ label: string; avatar: { src: string; alt: string } } | null>(null)

// teams diisi dari user secara reactive
const teams = computed(() => {
  if (!user.value) return []
  return [{
    label: user.value.company.name,
    avatar: {
      src: user.value.company.logo || '/default-company-logo.png',
      alt: user.value.company.name
    }
  }]
})

// update selectedTeam saat teams berubah
watchEffect(() => {
  selectedTeam.value = teams.value[0] || null
})

const items = computed<DropdownMenuItem[][]>(() => [
  teams.value.map(team => ({
    ...team,
    onSelect() {
      selectedTeam.value = team
    }
  })),
  [
    { label: 'Create team', icon: 'i-lucide-circle-plus' },
    { label: 'Manage teams', icon: 'i-lucide-cog' }
  ]
])

</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }">
    <UButton v-bind="{
      ...selectedTeam,
      label: collapsed ? undefined : selectedTeam?.label,
      trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
    }" color="neutral" variant="ghost" block :square="collapsed" class="data-[state=open]:bg-elevated"
      :class="[!collapsed && 'py-2']" :ui="{ trailingIcon: 'text-dimmed' }" />
  </UDropdownMenu>
</template>
