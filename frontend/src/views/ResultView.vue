<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useTtsStore } from '@/stores/ttsStore';
import AudioPlayer from '@/components/AudioPlayer.vue';
import StarRating from '@/components/StarRating.vue';

// Použití store
const ttsStore = useTtsStore();
const { currentResult } = storeToRefs(ttsStore);

// Mock funkce pro navigaci
const saveToLibrary = () => {
  console.log('Ukládám do knihovny...');
  // Logic pro přesměrování do knihovny nebo API call
};

const newText = () => {
  console.log('Jít na nový text...');
  // Router push na úvodní obrazovku
};
</script>

<template>
  <div class="max-w-3xl mx-auto p-6 bg-white shadow-sm min-h-screen" v-if="currentResult">

    <AudioPlayer
        :duration="currentResult.duration"
        :is-playing="false"
    />

    <div class="flex justify-center items-center gap-4 mb-8">
      <div class="flex items-center gap-2">
        <label class="text-gray-600">Format</label>
        <select v-model="currentResult.format" class="border p-1 rounded bg-white">
          <option value="mp3">MP3</option>
          <option value="wav">WAV</option>
        </select>
      </div>
      <button
          @click="ttsStore.downloadAudio"
          class="bg-gray-700 text-white px-6 py-1.5 rounded hover:bg-gray-600 transition"
      >
        Stáhnout
      </button>
    </div>

    <StarRating
        :model-value="currentResult.rating"
        @update:model-value="ttsStore.updateRating"
    />

    <div class="mt-8">
      <label class="block text-gray-700 mb-2">Původní text + SSML (lze editovat):</label>
      <textarea
          v-model="currentResult.ssmlText"
          class="w-full h-40 p-4 border rounded font-mono text-sm bg-gray-50 focus:ring-2 focus:ring-blue-300 outline-none resize-y"
          spellcheck="false"
      ></textarea>
    </div>

    <div class="flex justify-between mt-8 gap-4">
      <button
          @click="saveToLibrary"
          class="bg-gray-700 text-white px-6 py-3 rounded w-1/3 hover:bg-gray-600 transition"
      >
        Uložit do knihovny
      </button>

      <button
          @click="newText"
          class="bg-gray-700 text-white px-6 py-3 rounded w-1/3 hover:bg-gray-600 transition"
      >
        Nový text
      </button>
    </div>

  </div>
  <div v-else class="text-center p-10">
    Načítám data...
  </div>
</template>

<style scoped>
/* Specifické úpravy pro tuto view, pokud nejsou v main.css */
</style>