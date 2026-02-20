<template>
  <button 
    class="px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
    :class="variant === 'primary' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' : 'border bg-white text-gray-700 hover:bg-gray-50'"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary'
}>()
</script>
