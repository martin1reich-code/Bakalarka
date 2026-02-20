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
            <textarea v-model="text" class="w-full min-h-[150px] p-3 resize-none rounded border" placeholder="Zadejte text, který chcete převést..."></textarea>
            <div v-if="file" class="text-sm text-gray-600">{{ file.name }}</div>
            <div class="text-sm text-gray-500">{{ text.length }} znaků</div>
          </div>

          <!-- Mode Selection (Pills/Tabs) -->
          <div class="space-y-3">
            <label class="block font-medium">Režim převodu</label>
            <div class="grid grid-cols-3 gap-2 mb-4">
              <button 
                v-for="m in modes" 
                :key="m"
                class="px-4 py-2 rounded-lg transition font-medium flex items-center justify-center gap-2"
                :class="mode === m ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'border bg-white text-gray-700 hover:bg-gray-50'"
                @click="mode = m"
              >
                <component :is="modeIcons[m]" :size="18" />
                {{ modeLabels[m] }}
              </button>
            </div>
            
            <div class="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
              <div v-if="mode === 'basic'">Standardní převod textu na hlas bez pokročilých úprav.</div>
              <div v-if="mode === 'manual'">Ručně upravte SSML tagy pro přesnější kontrolu nad výslovností a intonací.</div>
              <div v-if="mode === 'ai'">Automaticky vygenerujte SSML tagy pomocí AI (Gemini API) pro přirozenější výslovnost.</div>
            </div>
            
            <div v-if="mode === 'manual'" class="space-y-3">
              <textarea v-model="ssmlText" class="w-full min-h-[100px] p-3 font-mono text-sm rounded border" placeholder="<speak>Váš text s <emphasis>SSML</emphasis> tagy...</speak>"></textarea>
            </div>
            
            <div v-if="mode === 'ai'" class="space-y-3">
              <button 
                class="w-full px-4 py-2 border rounded text-center hover:bg-gray-100 flex items-center justify-center gap-2"
                :disabled="!text || isGeneratingSSML"
                @click="handleGenerateSSML"
              >
                <Wand2 v-if="!isGeneratingSSML" :size="16" />
                {{ isGeneratingSSML ? '⏳ Generuji SSML...' : 'Vygenerovat SSML' }}
              </button>
              <textarea v-if="ssmlText" v-model="ssmlText" class="w-full min-h-[100px] p-3 font-mono text-sm rounded border" />
            </div>
          </div>

          <!-- Settings Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Language -->
            <div class="space-y-2">
              <label class="block font-medium">Jazyk</label>
              <select v-model="language" class="w-full border rounded p-2">
                <option value="cs-CZ">🇨🇿 Čeština</option>
                <option value="en-US">🇺🇸 Angličtina (US)</option>
                <option value="en-GB">🇬🇧 Angličtina (UK)</option>
                <option value="sk-SK">🇸🇰 Slovenština</option>
              </select>
            </div>

            <!-- Voice -->
            <div class="space-y-2">
              <label class="block font-medium">Hlas</label>
              <select v-model="voice" class="w-full border rounded p-2">
                <option v-for="v in availableVoices" :key="v.id" :value="v.id">
                  {{ v.name }} ({{ v.gender === 'female' ? '♀' : '♂' }}) - {{ v.provider }}
                </option>
              </select>
            </div>

            <!-- Speed -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="block font-medium">Rychlost</label>
                <span class="text-sm text-gray-600">{{ speed.toFixed(2) }}x</span>
              </div>
              <input type="range" v-model.number="speed" min="0.5" max="2" step="0.05" class="w-full" />
            </div>

            <!-- Pitch -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="block font-medium">Výška hlasu</label>
                <span class="text-sm text-gray-600">{{ pitch > 0 ? '+' : '' }}{{ pitch }}</span>
              </div>
              <input type="range" v-model.number="pitch" min="-10" max="10" step="1" class="w-full" />
            </div>
          </div>

          <!-- Generate Button -->
          <button 
            class="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            :disabled="(!text && !file) || isGenerating"
            @click="handleGenerate"
          >
            <Sparkles v-if="!isGenerating" :size="18" />
            <span v-if="isGenerating">⏳ Generuji audio...</span>
            <span v-else>Vygenerovat audio</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { FileText, Code, Sparkles, Upload, Wand2 } from 'lucide-vue-next'
import { generateAudio, generateSSML, VOICE_MODELS } from '@/services/mockData'
import { generateAudio as generateAudioAPI } from '@/services/api'
import { useAppStore } from '@/stores/appStore'

export default defineComponent({
  name: 'HomePage',
  components: { FileText, Code, Sparkles, Upload, Wand2 },
  setup() {
    const text = ref('')
    const ssmlText = ref('')
    const file = ref<File | null>(null)
    const language = ref('cs-CZ')
    const voice = ref('google-cs-neural2-a')
    const speed = ref(1)
    const pitch = ref(0)
    const mode = ref<'basic' | 'manual' | 'ai'>('basic')
    const isGenerating = ref(false)
    const isGeneratingSSML = ref(false)

    const fileInput = ref<HTMLInputElement | null>(null)

    const modeLabels: Record<string, string> = {
      basic: 'Základní',
      manual: 'Ruční SSML',
      ai: 'AI SSML'
    }

    const modeIcons: Record<string, any> = {
      basic: FileText,
      manual: Code,
      ai: Sparkles
    }

    const modes = ['basic', 'manual', 'ai']

    const triggerFile = () => fileInput.value?.click()

    const handleFileChange = (e: Event) => {
      const el = e.target as HTMLInputElement
      const selected = el.files?.[0] ?? null
      if (selected) {
        file.value = selected
        const reader = new FileReader()
        reader.onload = (ev) => {
          text.value = ev.target?.result as string || ''
        }
        reader.readAsText(selected)
      }
    }

    const handleGenerateSSML = async () => {
      if (!text.value) {
        alert('Zadejte prosím text')
        return
      }
      isGeneratingSSML.value = true
      try {
        const generated = await generateSSML(text.value)
        ssmlText.value = generated
        alert('SSML bylo vygenerováno')
      } catch (err) {
        alert('Chyba při generování SSML')
      } finally {
        isGeneratingSSML.value = false
      }
    }

    const handleGenerate = async () => {
      if (!text.value && !file.value) {
        alert('Zadejte text nebo nahrajte soubor')
        return
      }
      isGenerating.value = true
      try {
        const store = useAppStore()
        
        // Volání skutečného API
        const result = await generateAudioAPI({
          text: text.value,
          language: language.value,
          voiceId: voice.value,
          speed: speed.value,
          pitch: pitch.value,
          mode: mode.value === 'basic' ? 'basic' : mode.value === 'manual' ? 'manual-ssml' : 'auto-ssml'
        })

        console.log('Generated audio:', result)

        // Přidej do knihovny
        if (result.success) {
          store.addToLibrary({
            id: result.id,
            title: `Audio_${new Date().toLocaleTimeString()}`,
            text: text.value,
            audio: result.url,
            duration: 0,
            language: language.value,
            createdAt: new Date().toISOString()
          })
          alert('Audio vygenerováno a uloženo!')
          // Vyčisti textaru
          text.value = ''
        }
      } catch (err) {
        console.error(err)
        alert(`Chyba při generování: ${(err as Error).message}`)
      } finally {
        isGenerating.value = false
      }
    }

    const availableVoices = computed(() => VOICE_MODELS.filter(v => v.language === language.value))

    return {
      text,
      ssmlText,
      file,
      language,
      voice,
      speed,
      pitch,
      mode,
      modes,
      modeLabels,
      modeIcons,
      isGenerating,
      isGeneratingSSML,
      handleFileChange,
      handleGenerate,
      handleGenerateSSML,
      availableVoices,
      fileInput,
      triggerFile
    }
  }
})
</script>

<style scoped>
.min-h-screen { min-height: 100vh }
</style>
