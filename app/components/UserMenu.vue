<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed } from 'vue'
import { useAuth } from '~/composables/useAuth'

defineProps<{ collapsed?: boolean }>()

const colorMode = useColorMode()
const appConfig = useAppConfig()
const auth = useAuth()

// reactive user dengan fallback
const user = computed(() => {
  const u = auth.user.value
  return {
    name: u?.name || 'Anonymous',
    avatar: {
      src: u?.company?.logo || ``,
      alt: u?.name || 'Anonymous'
    }
  }
})

// dropdown items aman
const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: 'label',
      label: user.value?.name || 'Anonymous',
      avatar: user.value?.avatar || { src: '/default-company-logo.png', alt: 'Anonymous' }
    }
  ],
  [
    { label: 'Profile', icon: 'i-lucide-user' },
    { label: 'Billing', icon: 'i-lucide-credit-card' },
    { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' }
  ],
  [
    { label: 'Log out', icon: 'i-lucide-log-out', onSelect: (e) => { e.preventDefault(); auth.logout() } }
  ]
])
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'center', collisionPadding: 12 }">
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
    />
  </UDropdownMenu>
</template>
