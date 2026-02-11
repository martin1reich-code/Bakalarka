<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  duration: number;
  isPlaying: boolean;
}>();

const emit = defineEmits(['togglePlay']);
const currentTime = ref(0);

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};
</script>

<template>
  <div class="flex items-center gap-6 w-full">

    <button
        @click="$emit('togglePlay')"
        class="w-12 h-12 flex-shrink-0 bg-white text-indigo-900 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
    >
      <span v-if="isPlaying" class="text-xl font-bold">⏸</span>
      <span v-else class="text-xl font-bold ml-1">▶</span>
    </button>

    <div class="flex-1">
      <div class="flex justify-between text-xs text-indigo-200 mb-1 font-mono">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>

      <div class="h-2 bg-indigo-900/40 rounded-full overflow-hidden relative cursor-pointer group">
        <div class="absolute inset-0 bg-black/20"></div>

        <div class="h-full bg-gradient-to-r from-indigo-400 to-white rounded-full relative" style="width: 30%">
          <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>
    </div>
  </div>
</template>