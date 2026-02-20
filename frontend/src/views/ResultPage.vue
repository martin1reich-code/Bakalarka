<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
      <div v-if="!audio" class="pt-20 text-center">
        <p class="text-gray-600 mb-4">Žádné audio nebylo vygenerováno</p>
        <Button @click="goHome">Zpět na úvodní stránku</Button>
      </div>

      <div v-else>
        <div class="mb-6">
          <Button variant="ghost" @click="goHome" class="mb-4">Zpět</Button>
          <h1 class="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Výsledek převodu</h1>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div class="p-6 space-y-6">
              <h3 class="flex items-center gap-2 font-semibold text-lg"><Volume2 :size="20" /> Audio přehrávač</h3>

              <div class="relative h-32 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl overflow-hidden"></div>

              <div class="space-y-4">
                <div>
                  <input type="range" :min="0" :max="audio.duration" step="0.1" v-model.number="currentTime" @input="seek" class="w-full" />
                  <div class="flex justify-between text-sm text-gray-600"><span>{{ formatTime(currentTime) }}</span><span>{{ formatTime(audio.duration) }}</span></div>
                </div>

                <div class="flex items-center justify-center gap-4">
                  <Button @click="togglePlay" size="lg" class="w-16 h-16 rounded-full flex items-center justify-center">
                    <Play v-if="!isPlaying" :size="24" />
                    <Pause v-else :size="24" />
                  </Button>
                </div>

                <audio ref="audioRef" @timeupdate="onTimeUpdate" @ended="onEnded">
                  <source :src="audio.audioUrl" type="audio/mpeg" />
                </audio>

                <Button variant="outline" class="w-full flex items-center justify-center gap-2" @click="download"><Download :size="16" /> Stáhnout MP3</Button>

                <div class="pt-4 border-t">
                  <p class="text-sm font-medium text-gray-700">Ohodnoťte přirozenost hlasu (MOS):</p>
                  <div class="flex items-center justify-center gap-2 mt-2">
                    <button v-for="v in [1,2,3,4,5]" :key="v" @click="rate(v)" class="transition-transform hover:scale-110">
                      <Star :size="24" :class="v <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'" />
                    </button>
                  </div>
                  <p v-if="rating > 0" class="text-center text-sm text-gray-600 mt-2">Vaše hodnocení: {{ rating }}/5</p>
                </div>
              </div>
            </div>
          </Card>

          <div class="space-y-6">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm"><div class="p-6"><h3 class="font-semibold mb-2">Původní text</h3><div class="max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg"><p class="text-gray-700 whitespace-pre-wrap">{{ audio.text }}</p></div></div></Card>

            <Card v-if="audio.ssmlText" className="shadow-xl border-0 bg-white/80 backdrop-blur-sm"><div class="p-6"><h3 class="font-semibold mb-2">SSML tagy</h3><div class="max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg"><code class="text-sm text-gray-700 whitespace-pre-wrap font-mono">{{ audio.ssmlText }}</code></div></div></Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm"><div class="p-6"><h3 class="font-semibold mb-2">Informace o audio</h3><div class="space-y-3 text-sm"><div><p class="text-gray-600">Model:</p><p class="font-medium">{{ audio.model }}</p></div><div><p class="text-gray-600">Jazyk:</p><p class="font-medium">{{ audio.language }}</p></div><div><p class="text-gray-600">Délka:</p><p class="font-medium">{{ formatTime(audio.duration) }}</p></div></div></div></Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from '@/app/components/ui/button.vue'
import Card from '@/app/components/ui/card.vue'
import { useAppStore } from '@/stores/appStore'
import { Volume2, Play, Pause, Download, Star } from 'lucide-vue-next'

export default defineComponent({
  name: 'ResultPage',
  components: { Button, Card, Volume2, Play, Pause, Download, Star },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useAppStore()
    const audio = route?.state?.audio ?? null

    const audioRef = ref<HTMLAudioElement | null>(null)
    const isPlaying = ref(false)
    const currentTime = ref(0)
    const rating = ref(audio?.rating || 0)

    const goHome = () => router.push('/')

    const togglePlay = () => {
      const el = audioRef.value
      if (!el) return
      if (isPlaying.value) el.pause(); else el.play()
      isPlaying.value = !isPlaying.value
    }

    const onTimeUpdate = () => {
      if (audioRef.value) currentTime.value = audioRef.value.currentTime
    }
    const onEnded = () => { isPlaying.value = false }
    const seek = () => { if (audioRef.value) audioRef.value.currentTime = currentTime.value }
    const download = () => alert('Audio soubor byl stažen (mock)')
    const rate = (v: number) => { rating.value = v; store.updateAudioRating(audio.id, v); alert(`Hodnocení: ${v}/5`)}

    const formatTime = (s: number) => { const m = Math.floor(s/60); const sec = Math.floor(s%60).toString().padStart(2,'0'); return `${m}:${sec}` }

    return { audio, audioRef, isPlaying, currentTime, togglePlay, onTimeUpdate, onEnded, seek, download, rating, rate, goHome, formatTime }
  }
})
</script>
