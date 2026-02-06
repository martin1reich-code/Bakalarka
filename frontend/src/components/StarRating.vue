<script setup lang="ts">
import { RATING_SCALES } from '@/model/TtsSession';

const props = defineProps<{
  modelValue?: number; // v-model
}>();

const emit = defineEmits(['update:modelValue']);

function setRating(score: number) {
  emit('update:modelValue', score);
}
</script>

<template>
  <div class="rating-container text-center my-6">
    <h3 class="text-lg mb-2 text-gray-700">Jak moc jste spokojen s nahrávkou?</h3>

    <div class="inline-block text-left">
      <div
          v-for="item in RATING_SCALES"
          :key="item.score"
          class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
          @click="setRating(item.score)"
      >
        <div class="text-xl text-yellow-500 tracking-widest">
          {{ '★'.repeat(item.score) + '☆'.repeat(5 - item.score) }}
        </div>
        <div class="text-gray-600 text-sm">
          {{ item.score }} = {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>