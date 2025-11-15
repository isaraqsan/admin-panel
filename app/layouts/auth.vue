<template>
  <main>
    <slot />
  </main>
</template>

<script setup lang="ts">
// bisa ditambah styling khusus login
</script>

<style scoped>
main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f9f9f9;
}
</style>
