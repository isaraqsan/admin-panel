<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const toast = useToast()

const open = ref(false)

const links = [[
  {
    label: 'Home',
    icon: 'i-lucide-home', // house → home
    to: '/',
    onSelect: () => { open.value = false }
  },
  {
    label: 'Contacts',
    icon: 'i-lucide-book-user', // sudah cocok
    to: '/customers',
    onSelect: () => { open.value = false }
  },
  {
    label: 'Gallery',
    icon: 'i-lucide-image', // users → image
    to: '/gallery',
    onSelect: () => { open.value = false }
  },
  {
    label: 'Teams',
    icon: 'i-lucide-users', // users → user-group
    to: '/team',
    onSelect: () => { open.value = false }
  },
  {
    label: 'Company',
    icon: 'i-lucide-building', // settings → building
    to: '/company',
    onSelect: () => { open.value = false }
  },
  {
    label: 'Products',
    icon: 'i-lucide-box', // settings → building
    to: '/product',
    onSelect: () => { open.value = false }
  },
  {
    label: 'Theme',
    icon: 'i-lucide-box', // settings → building
    to: '/theme',
    onSelect: () => { open.value = false }
  },

]] satisfies NavigationMenuItem[][]

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.flat()
}, {
  id: 'code',
  label: 'Code',
  items: [{
    id: 'source',
    label: 'View page source',
    icon: 'i-simple-icons-github',
    to: `https://github.com/nuxt-ui-templates/dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
    target: '_blank'
  }]
}])

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title: 'We use first-party cookies to enhance your experience on our website.',
    duration: 0,
    close: false,
    actions: [{
      label: 'Accept',
      color: 'neutral',
      variant: 'outline',
      onClick: () => {
        cookie.value = 'accepted'
      }
    }, {
      label: 'Opt out',
      color: 'neutral',
      variant: 'ghost'
    }]
  })
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar id="default" v-model:open="open" collapsible resizable class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }">
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu :collapsed="collapsed" :items="links[0]" orientation="vertical" tooltip popover />

        <UNavigationMenu :collapsed="collapsed" :items="links[1]" orientation="vertical" tooltip class="mt-auto" />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
