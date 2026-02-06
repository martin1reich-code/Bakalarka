<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  duration: number; // celková délka v sekundách
  isPlaying: boolean;
}>();

const emit = defineEmits(['togglePlay', 'seek']);

// Formátování času MM:SS
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const currentTime = ref(0); // Mock aktuálního času
</script>

<template>
  <div class="player-container border p-4 rounded mb-4">
    <div class="flex items-center gap-4">
      <button @click="$emit('togglePlay')" class="text-2xl">
        <span v-if="isPlaying">⏸</span>
        <span v-else>▶️</span>
      </button>

      <div class="flex-1">
        <div class="h-2 bg-gray-200 rounded relative">
          <div class="h-full bg-gray-600 rounded" :style="{ width: '30%' }"></div> </div>
        <div class="text-center mt-1 text-sm text-gray-600">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Zde přijdou styly z main.css nebo base.css */
</style>