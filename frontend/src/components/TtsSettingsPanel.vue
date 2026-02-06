<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useTtsStore } from '@/stores/ttsStore';
import { AVAILABLE_VOICES } from '@/model/TtsConfig';

const ttsStore = useTtsStore();
const { config } = storeToRefs(ttsStore);
</script>

<template>
  <div class="settings-panel bg-gray-50 p-6 rounded-lg border border-gray-200">
    <h3 class="text-lg font-semibold mb-4 text-gray-800">Nastavení hlasu</h3>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">Hlas</label>
      <select v-model="config.voiceId" class="w-full p-2 border rounded bg-white">
        <option v-for="voice in AVAILABLE_VOICES" :key="voice.id" :value="voice.id">
          {{ voice.name }}
        </option>
      </select>
    </div>

    <div class="mb-4">
      <div class="flex justify-between mb-1">
        <label class="text-sm font-medium text-gray-700">Rychlost</label>
        <span class="text-xs text-gray-500">{{ config.speed }}x</span>
      </div>
      <input
          type="range" min="0.5" max="2.0" step="0.1"
          v-model.number="config.speed"
          class="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
      >
    </div>

    <div class="mb-6">
      <div class="flex justify-between mb-1">
        <label class="text-sm font-medium text-gray-700">Výška hlasu</label>
        <span class="text-xs text-gray-500">{{ config.pitch > 0 ? '+' : ''}}{{ config.pitch }} st</span>
      </div>
      <input
          type="range" min="-10" max="10" step="1"
          v-model.number="config.pitch"
          class="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
      >
    </div>

    <div class="pt-4 border-t border-gray-200">
      <h4 class="text-sm font-semibold mb-2 text-gray-800">Režim generování</h4>
      <div class="space-y-2">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="radio" value="basic" v-model="config.mode" class="text-blue-600">
          <span class="text-sm">Základní převod</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="radio" value="manual-ssml" v-model="config.mode" class="text-blue-600">
          <span class="text-sm">Ruční SSML</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="radio" value="auto-ssml" v-model="config.mode" class="text-purple-600">
          <span class="text-sm font-medium text-purple-700">AI Automatické SSML (Gemini)</span>
        </label>
      </div>
    </div>
  </div>
</template>