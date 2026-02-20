<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTtsStore } from '@/stores/ttsStore'
import { useAppStore } from '@/stores/appStore'
import { generateMergedAudio } from '@/services/api'
import appConfig from '@/config'
import { storeToRefs } from 'pinia'
import { ArrowLeft, Copy, Check, FileText, Sparkles, Loader2 } from 'lucide-vue-next'
import SSMLEditorWrapper from '@/components/SSMLEditorWrapper.vue'

const router = useRouter()
const ttsStore = useTtsStore()
const appStore = useAppStore()
const { config, isLoading } = storeToRefs(ttsStore)

const textParts = ref<string[]>([])
const copiedIndex = ref<number | null>(null)
const isGeneratingAll = ref(false)
const generatedPartsCount = ref(0)

const GOOGLE_TTS_BYTE_LIMIT = 5000
const TARGET_MAX_BYTES = 4200

const byteLength = (value: string) => new TextEncoder().encode(value).length

const findSafeSplitIndex = (text: string, maxBytes: number): number => {
  let low = 1
  let high = text.length
  let best = Math.min(text.length, 1)

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const candidate = text.slice(0, mid)
    const size = byteLength(candidate)

    if (size <= maxBytes) {
      best = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  const windowStart = Math.max(0, best - 300)
  const windowText = text.slice(windowStart, best)
  const splitCandidates = ['\n\n', '. ', '! ', '? ', '\n', ', ', ' ']

  for (const separator of splitCandidates) {
    const localIndex = windowText.lastIndexOf(separator)
    if (localIndex !== -1) {
      const absoluteIndex = windowStart + localIndex + separator.length
      if (absoluteIndex > 0) {
        return absoluteIndex
      }
    }
  }

  return Math.max(best, 1)
}

const splitByByteLimit = (text: string, maxBytes: number = TARGET_MAX_BYTES): string[] => {
  const parts: string[] = []
  let remaining = text.trim()

  while (remaining.length > 0) {
    if (byteLength(remaining) <= maxBytes) {
      parts.push(remaining)
      break
    }

    const splitIndex = findSafeSplitIndex(remaining, maxBytes)
    const part = remaining.slice(0, splitIndex).trim()

    if (!part) {
      break
    }

    parts.push(part)
    remaining = remaining.slice(splitIndex).trim()
  }

  return parts
}

const normalizePartsForTtsLimit = (parts: string[]): string[] => {
  return parts.flatMap(part => splitByByteLimit(part, TARGET_MAX_BYTES))
}

// Funkce pro inteligentní rozdělení textu
const splitTextIntelligently = (text: string, minLength: number = 3500, maxLength: number = 4500): string[] => {
  if (!text || text.length === 0) return []
  
  const parts: string[] = []
  let remainingText = text
  
  while (remainingText.length > 0) {
    // Pokud zbývá méně než maxLength, přidáme celý zbytek
    if (remainingText.length <= maxLength) {
      parts.push(remainingText.trim())
      break
    }
    
    // Hledáme ideální místo pro rozdělení mezi minLength a maxLength
    let splitPoint = maxLength
    const searchText = remainingText.substring(minLength, maxLength + 1)
    
    // 1. Priorita: Odstavec (dva řádky za sebou)
    const paragraphMatch = searchText.lastIndexOf('\n\n')
    if (paragraphMatch !== -1) {
      splitPoint = minLength + paragraphMatch + 2
    }
    // 2. Priorita: Konec věty s tečkou, vykřičníkem nebo otazníkem následovaný mezerou
    else {
      const sentenceRegex = /[.!?]\s+/g
      let lastSentenceEnd = -1
      let match
      
      while ((match = sentenceRegex.exec(searchText)) !== null) {
        lastSentenceEnd = match.index + match[0].length
      }
      
      if (lastSentenceEnd !== -1) {
        splitPoint = minLength + lastSentenceEnd
      }
      // 3. Priorita: Jeden řádek
      else {
        const newlineMatch = searchText.lastIndexOf('\n')
        if (newlineMatch !== -1) {
          splitPoint = minLength + newlineMatch + 1
        }
        // 4. Priorita: Čárka následovaná mezerou
        else {
          const commaMatch = searchText.lastIndexOf(', ')
          if (commaMatch !== -1) {
            splitPoint = minLength + commaMatch + 2
          }
          // 5. Poslední možnost: Mezera
          else {
            const spaceMatch = searchText.lastIndexOf(' ')
            if (spaceMatch !== -1) {
              splitPoint = minLength + spaceMatch + 1
            }
          }
        }
      }
    }
    
    // Přidáme část textu
    const part = remainingText.substring(0, splitPoint).trim()
    parts.push(part)
    remainingText = remainingText.substring(splitPoint).trim()
  }
  
  return parts
}

// Při načtení stránky rozdělit text
onMounted(() => {
  if (config.value.text) {
    const isSsmlMode = config.value.mode === 'manual-ssml' || config.value.mode === 'auto-ssml'
    const initiallySplit = isSsmlMode
      ? splitTextIntelligently(config.value.text, 2800, 3600)
      : splitTextIntelligently(config.value.text)
    textParts.value = normalizePartsForTtsLimit(initiallySplit)
  } else {
    // Pokud není text, vrátíme se na home
    router.push('/')
  }
})

// Statistiky
const stats = computed(() => {
  if (textParts.value.length === 0) return null
  
  const lengths = textParts.value.map(part => part.length)
  const total = lengths.reduce((sum, len) => sum + len, 0)
  const min = Math.min(...lengths)
  const max = Math.max(...lengths)
  const avg = Math.round(total / textParts.value.length)
  
  return { total, min, max, avg, count: textParts.value.length }
})

const generationProgressPercent = computed(() => {
  if (!textParts.value.length) return 0
  return Math.min(100, Math.round((generatedPartsCount.value / textParts.value.length) * 100))
})

// Kopírování do schránky
const copyToClipboard = async (text: string, index: number) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedIndex.value = index
    setTimeout(() => {
      copiedIndex.value = null
    }, 2000)
  } catch (err) {
    console.error('Chyba při kopírování:', err)
  }
}

// Generování audia pro všechny části jedním kliknutím
const generateAudioForAllParts = async () => {
  if (!textParts.value.length) {
    alert('Není co generovat')
    return
  }

  const oversizedPartIndex = textParts.value.findIndex(part => byteLength(part) > GOOGLE_TTS_BYTE_LIMIT)
  if (oversizedPartIndex !== -1) {
    alert(`Část ${oversizedPartIndex + 1} je stále delší než limit Google TTS 5000 bytů. Zkraťte ji prosím v editoru.`)
    return
  }

  isGeneratingAll.value = true
  generatedPartsCount.value = 0

  try {
    const result = await generateMergedAudio({
      texts: textParts.value,
      language: config.value.language,
      voiceId: config.value.voiceId,
      speed: config.value.speed,
      pitch: config.value.pitch,
      mode: config.value.mode,
    })

    const returnedPath = result.audioPath || result.url || result.audioUrl
    if (!returnedPath) {
      throw new Error('Backend nevrátil cestu k výslednému audio souboru')
    }

    const audioUrl = returnedPath?.startsWith('http')
      ? returnedPath
      : `${appConfig.backendUrl}${returnedPath}`

    appStore.addToLibrary({
      id: result.id,
      title: result.title || `Spojené audio - ${new Date().toLocaleTimeString()}`,
      text: config.value.text,
      audio: audioUrl,
      duration: 0,
      language: config.value.language,
      createdAt: new Date().toISOString()
    })

    generatedPartsCount.value = result.partsCount || textParts.value.length

    if (!result.success) {
      alert('Generování doběhlo, ale backend nevrátil success')
      return
    }

    alert(`Hotovo: ${generatedPartsCount.value} částí bylo spojeno do jednoho audia`) 

    router.push('/library')
  } catch (error) {
    console.error('Chyba při hromadném generování:', error)
    alert('Došlo k chybě při hromadném generování')
  } finally {
    isGeneratingAll.value = false
  }
}

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
      <!-- Header -->
      <div class="mb-8">
        <button 
          @click="goBack"
          class="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft :size="20" />
          Zpět
        </button>
        
        <div class="text-center">
          <h1 class="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
            Rozdělení textu
          </h1>
          <p class="text-gray-600">Text byl inteligentně rozdělen podle struktury a délek vět</p>
        </div>
      </div>

      <!-- Statistiky -->
      <div v-if="stats" class="bg-white/80 p-6 rounded-xl shadow-xl mb-6">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-purple-600">{{ stats.count }}</div>
            <div class="text-sm text-gray-600">Částí</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ stats.total }}</div>
            <div class="text-sm text-gray-600">Celkem znaků</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600">{{ stats.min }}</div>
            <div class="text-sm text-gray-600">Min. znaků</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-orange-600">{{ stats.max }}</div>
            <div class="text-sm text-gray-600">Max. znaků</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-pink-600">{{ stats.avg }}</div>
            <div class="text-sm text-gray-600">Průměr znaků</div>
          </div>
        </div>
      </div>

      <div v-if="isGeneratingAll" class="bg-white/90 border border-blue-200 rounded-xl p-5 shadow-xl mb-6">
        <div class="flex items-center gap-3 mb-3">
          <Loader2 :size="20" class="text-blue-600 animate-spin" />
          <div>
            <p class="font-semibold text-blue-900">Probíhá generování audia</p>
            <p class="text-sm text-gray-600">Prosím čekejte, připravuji výsledný spojený soubor...</p>
          </div>
        </div>

        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div
            class="bg-gradient-to-r from-purple-600 to-blue-600 h-2.5 rounded-full transition-all duration-500"
            :style="{ width: generationProgressPercent + '%' }"
          ></div>
        </div>
        <p class="text-sm text-gray-700">Hotovo {{ generatedPartsCount }} / {{ textParts.length }} ({{ generationProgressPercent }}%)</p>
      </div>

      <div class="mb-6">
        <button
          @click="generateAudioForAllParts"
          class="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          :disabled="isLoading || isGeneratingAll || textParts.length === 0"
        >
          <Sparkles :size="18" />
          <span v-if="isGeneratingAll">⏳ Generuji {{ generatedPartsCount }}/{{ textParts.length }} částí...</span>
          <span v-else>Vygenerovat všechny části jedním kliknutím</span>
        </button>
      </div>

      <!-- Části textu -->
      <div class="space-y-4">
        <div 
          v-for="(part, index) in textParts" 
          :key="index"
          class="bg-white/80 p-6 rounded-xl shadow-xl"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center font-bold">
                {{ index + 1 }}
              </div>
              <div>
                <h3 class="font-bold text-lg">Část {{ index + 1 }}</h3>
                <p class="text-sm text-gray-600">{{ textParts[index].length }} znaků</p>
              </div>
            </div>
            
            <div class="flex gap-2">
              <button
                @click="copyToClipboard(textParts[index], index)"
                class="px-4 py-2 border rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                :class="copiedIndex === index ? 'bg-green-50 border-green-300' : ''"
              >
                <Check v-if="copiedIndex === index" :size="16" class="text-green-600" />
                <Copy v-else :size="16" />
                {{ copiedIndex === index ? 'Zkopírováno' : 'Kopírovat' }}
              </button>
            </div>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4">
            <SSMLEditorWrapper v-model="textParts[index]" />
          </div>
        </div>
      </div>

      <!-- Info box -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div class="flex gap-4">
          <FileText :size="24" class="text-blue-600 flex-shrink-0" />
          <div>
            <h4 class="font-bold text-blue-900 mb-2">Jak funguje inteligentní dělení?</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Text se dělí na části o délce 3500-4500 znaků</li>
              <li>• Prioritizuje rozdělení na konci odstavců</li>
              <li>• Pokud to není možné, dělí na konci vět</li>
              <li>• Nikdy nerozdělí text uprostřed věty</li>
              <li>• V krajním případě rozdělí na mezeře nebo čárce</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- SSML Tips -->
      <div class="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-6">
        <div>
          <h4 class="font-bold text-purple-900 mb-3">💡 SSML Tagy - Tipy</h4>
          <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p class="font-semibold text-purple-800 mb-1">Základní struktura:</p>
              <code class="block bg-white p-2 rounded text-xs">&lt;speak&gt;Váš text&lt;/speak&gt;</code>
            </div>
            <div>
              <p class="font-semibold text-purple-800 mb-1">Pauza:</p>
              <code class="block bg-white p-2 rounded text-xs">&lt;break time="500ms"/&gt;</code>
            </div>
            <div>
              <p class="font-semibold text-purple-800 mb-1">Důraz:</p>
              <code class="block bg-white p-2 rounded text-xs">&lt;emphasis&gt;důležité&lt;/emphasis&gt;</code>
            </div>
            <div>
              <p class="font-semibold text-purple-800 mb-1">Rychlost:</p>
              <code class="block bg-white p-2 rounded text-xs">&lt;prosody rate="slow"&gt;text&lt;/prosody&gt;</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.min-h-screen { min-height: 100vh }
</style>
