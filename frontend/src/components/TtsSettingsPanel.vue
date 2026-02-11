<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useTtsStore } from '@/stores/ttsStore';
import { AVAILABLE_VOICES } from '@/model/TtsConfig';
import type { TtsMode } from '@/model/TtsConfig';

const ttsStore = useTtsStore();
const { config } = storeToRefs(ttsStore);

const setMode = (mode: TtsMode) => { config.value.mode = mode; };
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-4">

    <div class="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600">
        <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
        <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
        <path d="M12 2v2"></path>
        <path d="M12 22v-2"></path>
        <path d="m4.93 4.93 1.41 1.41"></path>
        <path d="m17.66 17.66 1.41 1.41"></path>
        <path d="M2 12h2"></path>
        <path d="M22 12h-2"></path>
        <path d="m4.93 19.07 1.41-1.41"></path>
        <path d="m17.66 6.34 1.41-1.41"></path>
      </svg>
      <h3 class="font-bold text-gray-700">Nastavení převodu</h3>
    </div>

    <div class="mb-4">
      <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Hlas</label>
      <div class="relative">
        <select
            v-model="config.voiceId"
            class="w-full p-2 border border-gray-300 rounded bg-white text-sm appearance-none cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option v-for="voice in AVAILABLE_VOICES" :key="voice.id" :value="voice.id">
            {{ voice.name }}
          </option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </div>

    <div class="space-y-4 mb-6">
      <div>
        <div class="flex justify-between mb-1">
          <label class="text-xs font-bold text-gray-500 uppercase">Rychlost</label>
          <span class="text-xs font-mono bg-gray-100 px-1 rounded">{{ config.speed }}x</span>
        </div>
        <input type="range" min="0.5" max="2.0" step="0.1" v-model.number="config.speed" class="w-full h-1 bg-gray-200 rounded appearance-none cursor-pointer">
      </div>

      <div>
        <div class="flex justify-between mb-1">
          <label class="text-xs font-bold text-gray-500 uppercase">Výška</label>
          <span class="text-xs font-mono bg-gray-100 px-1 rounded">{{ config.pitch }}</span>
        </div>
        <input type="range" min="-10" max="10" step="1" v-model.number="config.pitch" class="w-full h-1 bg-gray-200 rounded appearance-none cursor-pointer">
      </div>
    </div>

    <div>
      <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Režim</label>
      <div class="space-y-2">
        <label class="flex items-center p-2 border rounded hover:bg-gray-50 cursor-pointer" :class="{'border-blue-500 bg-blue-50': config.mode === 'basic'}">
          <input type="radio" value="basic" v-model="config.mode" class="text-blue-600 focus:ring-blue-500 mr-2">
          <span class="text-sm">Základní</span>
        </label>

        <label class="flex items-center p-2 border rounded hover:bg-gray-50 cursor-pointer" :class="{'border-purple-500 bg-purple-50': config.mode === 'auto-ssml'}">
          <input type="radio" value="auto-ssml" v-model="config.mode" class="text-purple-600 focus:ring-purple-500 mr-2">
          <span class="text-sm">AI Enhanced (Gemini)</span>
        </label>
      </div>
    </div>

  </div>
</template>