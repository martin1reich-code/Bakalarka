<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50" :class="activeAudioUrl ? 'pb-36' : 'pb-12'">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Knihovna</h1>
        <p class="text-gray-600">Vaše vygenerovaná audio nahrávky</p>
      </div>

      <!-- Folders/Filters -->
      <div class="mb-6 flex items-center gap-3 overflow-x-auto pb-2 flex-wrap">
        <button
          class="px-4 py-2 rounded-full font-medium transition whitespace-nowrap"
          :class="filterFolder === 'all' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'border bg-white text-gray-700'"
          @click="filterFolder = 'all'"
        >
          Všechny ({{ library.length }})
        </button>
        <button
          v-for="folder in folders"
          :key="folder.id"
          class="px-4 py-2 rounded-full font-medium transition whitespace-nowrap"
          :class="filterFolder === folder.id ? 'text-white' : 'border bg-white text-gray-700'"
          :style="filterFolder === folder.id ? { backgroundImage: `linear-gradient(to right, ${folder.color}dd, ${folder.color}99)`, borderColor: folder.color } : { borderColor: folder.color, borderWidth: '2px' }"
          @click="filterFolder = folder.id"
        >
          {{ folder.name }} ({{ folder.itemCount }})
        </button>
        <button
          class="px-4 py-2 rounded-full font-medium transition whitespace-nowrap border bg-white text-gray-700 hover:bg-gray-50"
          style="border-width: 2px; border-image: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) 1"
          @click="showAddFolderDialog = true"
        >
          Nová složka
        </button>
      </div>

      <!-- Search & Sort -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Hledat v knihovně..."
            class="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select v-model="sortBy" class="border rounded-lg px-4 py-2">
          <option value="date">Podle data</option>
          <option value="title">Podle názvu</option>
          <option value="duration">Podle délky</option>
        </select>
      </div>

      <!-- Audio Cards Grid -->
      <div v-if="filteredLibrary.length === 0" class="rounded-lg bg-white/60 p-12 text-center">
        <p class="text-gray-600 mb-4">{{ searchQuery ? 'Žádné výsledky nenalezeny' : 'Vaše knihovna je prázdná' }}</p>
        <p class="text-sm text-gray-500">{{ searchQuery ? 'Zkuste jiný vyhledávací dotaz' : 'Začněte generováním vašeho prvního audia' }}</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="item in filteredLibrary"
          :key="item.id"
          class="relative group rounded-3xl overflow-hidden shadow-lg bg-white/80 backdrop-blur-sm border-l-4 hover:shadow-xl transition"
          :style="{ borderLeftColor: getFolderById(item.folderId)?.color || '#d1d5db' }"
        >
          <!-- Color Bar (app gradient) -->
          <div class="h-3 rounded-t-3xl bg-gradient-to-r from-purple-600 to-blue-600"></div>

          <!-- Card Content -->
          <div class="p-6 space-y-4">
            <!-- Header -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-lg truncate">{{ item.title }}</h3>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: getFolderById(item.folderId)?.color || '#d1d5db' }"></div>
                  <p class="text-sm text-gray-600">{{ formatDate(item.createdAt) }}</p>
                </div>
              </div>
              <button
                class="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                @click="removeFromLibrary(item.id)"
                aria-label="Smazat položku"
              >
                <X :size="18" />
              </button>
            </div>

            <!-- Text Preview -->
            <p class="text-sm text-gray-600 line-clamp-2">{{ item.text }}</p>

            <!-- Tags -->
            <div class="flex flex-wrap gap-2">
              <span class="text-xs border rounded-full px-3 py-1">{{ item.language }}</span>
              <span class="text-xs border rounded-full px-3 py-1">{{ formatDuration(item.duration) }}</span>
              <span v-if="getFolderById(item.folderId)" class="text-xs border rounded-full px-3 py-1">{{ getFolderById(item.folderId)?.name }}</span>
            </div>

            <!-- Rating -->
            <div v-if="item.rating" class="flex items-center gap-1">
              <Star v-for="i in 5" :key="i" :size="16" :class="['text-lg', i <= item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300']" />
            </div>

            <!-- Actions -->
            <div class="flex gap-2 pt-2">
              <button 
                class="flex-1 py-3 border rounded-full text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
                @click="playAudio(item)"
              >
                <Play :size="16" /> Přehrát
              </button>
              <button 
                class="flex-1 py-3 border rounded-full text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
                @click="downloadAudio(item)"
              >
                <Download :size="16" /> Stáhnout
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Folder Dialog -->
      <div v-if="showAddFolderDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div class="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
          <h2 class="text-xl font-bold mb-2">Vytvořit novou složku</h2>
          <p class="text-gray-600 mb-4">Uspořádejte si svá audio do složek</p>
          <div class="space-y-4">
            <div>
              <label class="block font-medium mb-1">Název složky</label>
              <input v-model="newFolderName" type="text" placeholder="Např. Audio knihy" class="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label class="block font-medium mb-2">Barva</label>
              <div class="flex gap-2">
                <button
                  v-for="color in colors"
                  :key="color"
                  :style="{ backgroundColor: color }"
                  class="w-10 h-10 rounded-lg transition"
                  :class="newFolderColor === color ? 'ring-2 ring-offset-2 ring-purple-600 scale-110' : ''"
                  @click="newFolderColor = color"
                ></button>
              </div>
            </div>
            <button
              class="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded font-medium hover:from-purple-700 hover:to-blue-700"
              @click="addFolder"
            >
              Vytvořit složku
            </button>
          </div>
          <button
            class="mt-4 w-full py-2 border rounded text-gray-600 hover:bg-gray-50"
            @click="showAddFolderDialog = false"
          >
            Zavřít
          </button>
        </div>
      </div>

      <div
        v-if="activeAudioUrl"
        class="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-2xl"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div class="flex items-center gap-4 mb-2">
            <button
              class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center hover:opacity-90 transition"
              @click="togglePlayerPlayback"
            >
              <Pause v-if="isPlayerPlaying" :size="18" />
              <Play v-else :size="18" class="ml-0.5" />
            </button>

            <div class="min-w-0 flex-1">
              <p class="font-medium truncate">{{ activeAudioTitle || 'Přehrávání' }}</p>
              <div class="flex items-center gap-2 text-xs text-gray-600">
                <span>{{ formatDuration(currentTimeSeconds) }}</span>
                <span>/</span>
                <span>{{ formatDuration(durationSeconds) }}</span>
              </div>
            </div>
          </div>

          <input
            type="range"
            class="w-full"
            min="0"
            :max="Math.max(durationSeconds, 0)"
            step="0.1"
            :value="currentTimeSeconds"
            @input="seekAudio"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { Search, X, Star, Play, Pause, Download } from 'lucide-vue-next'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale/cs'
import appConfig from '@/config'

export default defineComponent({
  name: 'LibraryPage',
  components: { Search, X, Star, Play, Pause, Download },
  setup() {
    const store = useAppStore()
    const searchQuery = ref('')
    const sortBy = ref<'date' | 'title' | 'duration'>('date')
    const filterFolder = ref('all')
    const showAddFolderDialog = ref(false)
    const newFolderName = ref('')
    const newFolderColor = ref('#3b82f6')
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444']
    const audioElement = new Audio()
    const activeAudioUrl = ref('')
    const activeAudioTitle = ref('')
    const isPlayerPlaying = ref(false)
    const currentTimeSeconds = ref(0)
    const durationSeconds = ref(0)

    const handleTimeUpdate = () => {
      currentTimeSeconds.value = audioElement.currentTime || 0
    }

    const handleLoadedMetadata = () => {
      durationSeconds.value = Number.isFinite(audioElement.duration) ? audioElement.duration : 0
    }

    const handleEnded = () => {
      isPlayerPlaying.value = false
      currentTimeSeconds.value = 0
    }

    onMounted(() => {
      audioElement.addEventListener('timeupdate', handleTimeUpdate)
      audioElement.addEventListener('loadedmetadata', handleLoadedMetadata)
      audioElement.addEventListener('ended', handleEnded)
    })

    onBeforeUnmount(() => {
      audioElement.pause()
      audioElement.removeEventListener('timeupdate', handleTimeUpdate)
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audioElement.removeEventListener('ended', handleEnded)
    })

    const resolveAudioUrl = (item: any) => {
      let audioUrl = item.audio || item.audioUrl

      if (audioUrl && (audioUrl.includes('\\') || (audioUrl.includes('/') && audioUrl.includes(':\\')))) {
        const filename = audioUrl.split('\\').pop() || audioUrl.split('/').pop()
        audioUrl = `/api/audio/${filename}`
      }

      if (audioUrl && !audioUrl.includes('http')) {
        audioUrl = `${appConfig.backendUrl}${audioUrl}`
      }

      return audioUrl
    }

    // Načtení audio souborů z databáze
    onMounted(async () => {
      try {
        const response = await fetch(`${appConfig.backendUrl}/api/tts/history?limit=200&offset=0`)
        if (response.ok) {
          const payload = await response.json()
          const records = Array.isArray(payload) ? payload : (payload.records || [])
          // Naplňte store daty z databáze - správně mapujte audioFilePath -> audio
          records.forEach((record: any) => {
            const rawPath = record.audioPath || record.audioFilePath || ''
            let filename = rawPath

            if (filename.includes('\\') || filename.includes('/')) {
              filename = filename.split('\\').pop() || filename.split('/').pop()
            }

            store.addToLibrary({
              id: record.id,
              title: record.title,
              text: record.originalText || '',
              audio: filename ? `/api/audio/${filename}` : rawPath,
              audioFilePath: filename,
              duration: record.duration || 0,
              language: record.language,
              createdAt: record.createdAt
            })
          })
        }
      } catch (error) {
        console.error('Chyba při načítání knihovny:', error)
      }
    })

    const filteredLibrary = computed(() => {
      let filtered = [...store.library]

      if (searchQuery.value) {
        filtered = filtered.filter(item =>
          item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          item.text.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      if (filterFolder.value !== 'all') {
        filtered = filtered.filter(item => item.folderId === filterFolder.value)
      }

      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'date':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          case 'title':
            return a.title.localeCompare(b.title)
          case 'duration':
            return b.duration - a.duration
          default:
            return 0
        }
      })

      return filtered
    })

    const formatDate = (date: Date) => {
      return format(new Date(date), 'dd. MM. yyyy HH:mm', { locale: cs })
    }

    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getFolderById = (id?: string) => {
      return store.folders.find(f => f.id === id)
    }

    const removeFromLibrary = (id: string) => {
      store.removeFromLibrary(id)
    }

    const playAudio = (item: any) => {
      if (!item.audio && !item.audioUrl && !item.audioFilePath) {
        alert('Audio se nenačetlo')
        return
      }

      const audioUrl = resolveAudioUrl(item)
      if (!audioUrl) {
        alert('Audio URL je neplatná')
        return
      }

      if (activeAudioUrl.value === audioUrl) {
        if (isPlayerPlaying.value) {
          audioElement.pause()
          isPlayerPlaying.value = false
        } else {
          audioElement.play().then(() => {
            isPlayerPlaying.value = true
          }).catch(err => {
            console.error('❌ Chyba při přehrávání:', err)
            alert('Nelze přehrát audio: ' + err.message)
          })
        }
        return
      }

      activeAudioUrl.value = audioUrl
      activeAudioTitle.value = item.title || 'Audio nahrávka'
      currentTimeSeconds.value = 0
      durationSeconds.value = 0
      audioElement.src = audioUrl
      audioElement.play().then(() => {
        isPlayerPlaying.value = true
      }).catch(err => {
        console.error('❌ Chyba při přehrávání:', err)
        alert('Nelze přehrát audio: ' + err.message)
      })
    }

    const togglePlayerPlayback = () => {
      if (!activeAudioUrl.value) return

      if (isPlayerPlaying.value) {
        audioElement.pause()
        isPlayerPlaying.value = false
      } else {
        audioElement.play().then(() => {
          isPlayerPlaying.value = true
        }).catch(err => {
          console.error('❌ Chyba při přehrávání:', err)
          alert('Nelze přehrát audio: ' + err.message)
        })
      }
    }

    const seekAudio = (event: Event) => {
      const target = event.target as HTMLInputElement
      const value = Number(target.value)
      if (Number.isNaN(value)) return
      audioElement.currentTime = value
      currentTimeSeconds.value = value
    }

    const downloadAudio = (item: any) => {
      // Stáhne audio soubor
      if (!item.audio && !item.audioUrl && !item.audioFilePath) {
        alert('Audio se nenačetlo')
        return
      }
      
      // Zkonstruovat správnou URL
      let audioUrl = item.audio || item.audioUrl
      
      // Pokud obsahuje backslash nebo forward slash (cesta), extrahej jen filename
      if (audioUrl && (audioUrl.includes('\\') || (audioUrl.includes('/') && audioUrl.includes(':\\')))) {
        const filename = audioUrl.split('\\').pop() || audioUrl.split('/').pop()
        audioUrl = `/api/audio/${filename}`
      }
      
      // Pokud nechybí domain, přidej ho
      if (!audioUrl.includes('http')) {
        audioUrl = `${appConfig.backendUrl}${audioUrl}`
      }

      console.log('⬇️ Stahuji audio z:', audioUrl)
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = `${item.title || 'audio'}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    const addFolder = () => {
      if (newFolderName.value.trim()) {
        store.addFolder(newFolderName.value, newFolderColor.value)
        newFolderName.value = ''
        showAddFolderDialog.value = false
      }
    }

    return {
      library: computed(() => store.library),
      folders: computed(() => store.folders),
      searchQuery,
      sortBy,
      filterFolder,
      showAddFolderDialog,
      newFolderName,
      newFolderColor,
      colors,
      filteredLibrary,
      activeAudioUrl,
      activeAudioTitle,
      isPlayerPlaying,
      currentTimeSeconds,
      durationSeconds,
      formatDate,
      formatDuration,
      getFolderById,
      removeFromLibrary,
      playAudio,
      togglePlayerPlayback,
      seekAudio,
      downloadAudio,
      addFolder
    }
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
