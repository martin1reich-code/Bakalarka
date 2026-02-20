<template>
  <router-link 
    :to="to"
    class="px-4 py-2 rounded-lg transition font-medium hover:bg-purple-100 text-gray-700 hover:text-purple-600"
    active-class="bg-purple-100 text-purple-600"
  >
    {{ label }}
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  to: string
  label: string
}>()
</script>
