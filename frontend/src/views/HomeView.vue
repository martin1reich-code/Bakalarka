<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTtsStore } from '@/stores/ttsStore'
import { storeToRefs } from 'pinia'
import { AVAILABLE_VOICES } from '@/model/TtsConfig'
import { FileText, Code, Sparkles, Upload, Wand2, Scissors } from 'lucide-vue-next'
import SSMLEditorWrapper from '@/components/SSMLEditorWrapper.vue'

const router = useRouter()
const ttsStore = useTtsStore()
const { config, isLoading } = storeToRefs(ttsStore)
const fileInput = ref<HTMLInputElement | null>(null)
const file = ref<File | null>(null)

const handleFileChange = (e: Event) => {
  const el = e.target as HTMLInputElement
  const selected = el.files?.[0] ?? null
  if (selected) {
    file.value = selected
    ttsStore.processFileUpload(selected)
  }
}

const triggerFile = () => fileInput.value?.click()

const modeLabels: Record<string, string> = {
  'basic': 'Základní',
  'manual-ssml': 'Ruční SSML',
  'auto-ssml': 'AI SSML'
}

const modeIcons: Record<string, any> = {
  'basic': FileText,
  'manual-ssml': Code,
  'auto-ssml': Sparkles
}

const modes = ['basic', 'manual-ssml', 'auto-ssml']

const availableVoices = computed(() => AVAILABLE_VOICES.filter(v => v.language === config.value.language))

const handleGenerate = async () => {
  if (!config.value.text && !file.value) {
    alert('Zadejte text nebo nahrajte soubor')
    return
  }
  
  // Pokud je text delší než 4500 znaků, přesměruj na rozdělení
  if (config.value.text.length > 4500) {
    router.push('/text-split')
    return
  }
  
  await ttsStore.generateAudio()
  router.push('/result')
}

const handleTextSplit = () => {
  if (!config.value.text) {
    alert('Zadejte text pro rozdělení')
    return
  }
  router.push('/text-split')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-12">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
      <div>
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
            Text-to-Speech Generator
          </h1>
          <p class="text-gray-600">Převeďte váš text na přirozeně znějící hlas pomocí AI</p>
        </div>

        <div class="bg-white/80 p-8 rounded-xl shadow-xl space-y-6">
          <!-- Text Input -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="block font-medium">Text</label>
              <div class="flex gap-2">
                <input ref="fileInput" type="file" accept=".txt,.pdf" class="hidden" @change="handleFileChange" />
                <button class="px-3 py-2 border rounded text-sm flex items-center gap-2" @click="triggerFile">
                  <Upload :size="16" /> Nahrát soubor
                </button>
              </div>
            </div>
            <textarea v-model="config.text" class="w-full min-h-[150px] p-3 resize-none rounded border" placeholder="Zadejte text, který chcete převést..."></textarea>
            <div v-if="file" class="text-sm text-gray-600">{{ file.name }}</div>
            <div class="text-sm text-gray-500">{{ config.text.length }} znaků</div>
          </div>

          <!-- Mode Selection -->
          <div class="space-y-3">
            <label class="block font-medium">Režim převodu</label>
            <div class="grid grid-cols-3 gap-2 mb-4">
              <button 
                v-for="m in modes" 
                :key="m"
                class="px-4 py-2 rounded-lg transition font-medium flex items-center justify-center gap-2"
                :class="config.mode === m ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'border bg-white text-gray-700 hover:bg-gray-50'"
                @click="config.mode = m"
              >
                <component :is="modeIcons[m]" :size="18" />
                {{ modeLabels[m] }}
              </button>
            </div>
            
            <div class="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
              <div v-if="config.mode === 'basic'">Standardní převod textu na hlas bez pokročilých úprav.</div>
              <div v-if="config.mode === 'manual-ssml'">Ručně upravte SSML tagy pro přesnější kontrolu nad výslovností a intonací.</div>
              <div v-if="config.mode === 'auto-ssml'">Automaticky vygenerujte SSML tagy pomocí AI pro přirozenější výslovnost.</div>
            </div>
            
            <div v-if="config.mode === 'manual-ssml'" class="space-y-3">
              <SSMLEditorWrapper v-model="config.text" />
            </div>
            
            <div v-if="config.mode === 'auto-ssml'" class="space-y-3">
              <button 
                class="w-full px-4 py-2 border rounded text-center hover:bg-gray-100 flex items-center justify-center gap-2"
                :disabled="!config.text || isLoading"
              >
                <Wand2 v-if="!isLoading" :size="16" />
                {{ isLoading ? '⏳ Generuji SSML...' : 'Vygenerovat SSML' }}
              </button>
            </div>
          </div>

          <!-- Settings Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Language -->
            <div class="space-y-2">
              <label class="block font-medium">Jazyk</label>
              <select v-model="config.language" class="w-full border rounded p-2">
                <option value="cs-CZ">🇨🇿 Čeština</option>
                <option value="en-US">🇺🇸 Angličtina (US)</option>
                <option value="en-GB">🇬🇧 Angličtina (UK)</option>
                <option value="sk-SK">🇸🇰 Slovenština</option>
              </select>
            </div>

            <!-- Voice -->
            <div class="space-y-2">
              <label class="block font-medium">Hlas</label>
              <select v-model="config.voiceId" class="w-full border rounded p-2">
                <option v-for="v in availableVoices" :key="v.id" :value="v.id">
                  {{ v.name }} ({{ v.gender === 'female' ? '♀' : '♂' }}) - {{ v.provider }}
                </option>
              </select>
            </div>

            <!-- Speed -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="block font-medium">Rychlost</label>
                <span class="text-sm text-gray-600">{{ config.speed.toFixed(2) }}x</span>
              </div>
              <input type="range" v-model.number="config.speed" min="0.5" max="2" step="0.05" class="w-full" />
            </div>

            <!-- Pitch -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="block font-medium">Výška hlasu</label>
                <span class="text-sm text-gray-600">{{ config.pitch > 0 ? '+' : '' }}{{ config.pitch }}</span>
              </div>
              <input type="range" v-model.number="config.pitch" min="-10" max="10" step="1" class="w-full" />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3">
            <!-- Text Split Button -->
            <button 
              class="w-full h-12 text-lg border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition"
              :disabled="!config.text"
              @click="handleTextSplit"
            >
              <Scissors :size="18" />
              <span>Rozdělit text</span>
            </button>

            <!-- Generate Button -->
            <button 
              class="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              :disabled="(!config.text && !file) || isLoading"
              @click="handleGenerate"
            >
              <Sparkles v-if="!isLoading" :size="18" />
              <span v-if="isLoading">⏳ Generuji audio...</span>
              <span v-else>Vygenerovat audio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.min-h-screen { min-height: 100vh }
</style>