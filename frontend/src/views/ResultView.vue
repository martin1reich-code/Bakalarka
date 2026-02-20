<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTtsStore } from '@/stores/ttsStore'
import { useAppStore } from '@/stores/appStore'
import AudioPlayer from '@/components/AudioPlayer.vue'
import StarRating from '@/components/StarRating.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const ttsStore = useTtsStore()
const appStore = useAppStore()
const { currentResult } = storeToRefs(ttsStore)

const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)

const goHome = () => router.push('/')

const togglePlay = () => {
  const el = audioRef.value
  if (!el) return
  if (isPlaying.value) {
    el.pause()
  } else {
    el.play()
  }
  isPlaying.value = !isPlaying.value
}

const onTimeUpdate = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
  }
}

const onEnded = () => {
  isPlaying.value = false
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const rate = (rating: number) => {
  ttsStore.updateRating(rating)
}

const saveToLibrary = () => {
  if (currentResult.value) {
    appStore.addToLibrary({
      id: currentResult.value.id,
      title: currentResult.value.originalText.substring(0, 100),
      audioUrl: currentResult.value.audioUrl,
      originalText: currentResult.value.originalText,
      ssmlText: currentResult.value.ssmlText,
      duration: currentResult.value.duration,
      format: currentResult.value.format,
      rating: currentResult.value.rating,
      createdAt: new Date().toISOString()
    })
    alert('✅ Audio bylo uloženo do knihovny!')
  }
}

const download = () => {
  ttsStore.downloadAudio()
}

const seek = () => {
  if (audioRef.value) {
    audioRef.value.currentTime = currentTime.value
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
      <div v-if="!currentResult" class="pt-20 text-center">
        <p class="text-gray-600 mb-4">Žádné audio nebylo vygenerováno</p>
        <button @click="goHome" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Zpět na úvodní stránku</button>
      </div>

      <div v-else>
        <div class="mb-6">
          <button @click="goHome" class="mb-4 text-gray-600 hover:text-purple-600 font-medium">← Zpět</button>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Výsledek převodu</h1>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Audio Player Card -->
          <div class="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden">
            <div class="p-6 space-y-6">
              <h3 class="flex items-center gap-2 font-semibold text-lg">🔊 Audio přehrávač</h3>

              <div class="relative h-32 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl overflow-hidden"></div>

              <div class="space-y-4">
                <div>
                  <input type="range" :min="0" :max="currentResult.duration || 100" step="0.1" v-model.number="currentTime" @input="seek" class="w-full" />
                  <div class="flex justify-between text-sm text-gray-600">
                    <span>{{ formatTime(currentTime) }}</span>
                    <span>{{ formatTime(currentResult.duration || 0) }}</span>
                  </div>
                </div>

                <div class="flex items-center justify-center gap-4">
                  <button @click="togglePlay" class="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700">
                    <span v-if="!isPlaying" class="text-2xl">▶️</span>
                    <span v-else class="text-2xl">⏸️</span>
                  </button>
                </div>

                <audio ref="audioRef" @timeupdate="onTimeUpdate" @ended="onEnded">
                  <source :src="currentResult.audioUrl" type="audio/mpeg" />
                </audio>

                <button @click="download" class="w-full px-4 py-2 border rounded text-center hover:bg-gray-100 flex items-center justify-center gap-2">
                  ⬇️ Stáhnout MP3
                </button>

                <div class="pt-4 border-t">
                  <p class="text-sm font-medium text-gray-700">Ohodnotyť přirozenost hlasu (MOS):</p>
                  <div class="flex items-center justify-center gap-2 mt-2">
                    <button v-for="v in [1,2,3,4,5]" :key="v" @click="rate(v)" class="transition-transform hover:scale-110">
                      <span :class="v <= (currentResult?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'">⭐</span>
                    </button>
                  </div>
                  <p v-if="currentResult?.rating && currentResult.rating > 0" class="text-center text-sm text-gray-600 mt-2">Vaše hodnocení: {{ currentResult.rating }}/5</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Info Panels -->
          <div class="space-y-6">
            <!-- Original Text Card -->
            <div class="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden">
              <div class="p-6">
                <h3 class="font-semibold mb-2">Původní text</h3>
                <div class="max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                  <p class="text-gray-700 whitespace-pre-wrap">{{ currentResult.originalText }}</p>
                </div>
              </div>
            </div>

            <!-- SSML Tags Card -->
            <div v-if="currentResult.ssmlText" class="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden">
              <div class="p-6">
                <h3 class="font-semibold mb-2">SSML tagy</h3>
                <div class="max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                  <code class="text-sm text-gray-700 whitespace-pre-wrap font-mono">{{ currentResult.ssmlText }}</code>
                </div>
              </div>
            </div>

            <!-- Audio Info Card -->
            <div class="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden">
              <div class="p-6">
                <h3 class="font-semibold mb-2">Informace o audio</h3>
                <div class="space-y-3 text-sm">
                  <div>
                    <p class="text-gray-600">Formát:</p>
                    <p class="font-medium">{{ currentResult.format?.toUpperCase() || 'MP3' }}</p>
                  </div>
                  <div>
                    <p class="text-gray-600">Délka:</p>
                    <p class="font-medium">{{ formatTime(currentResult.duration || 0) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-10 flex gap-4">
          <button @click="saveToLibrary" class="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition border border-gray-200">
            📂 Uložit do knihovny
          </button>
          <button @click="goHome" class="flex-1 bg-purple-50 text-purple-700 font-semibold py-3 rounded-xl hover:bg-purple-100 transition border border-purple-100">
            ✨ Nový převod
          </button>
        </div>
      </div>
    </div>
  </div>
</template>