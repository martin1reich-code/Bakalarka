<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Porovnání modelů a statistiky
        </h1>
        <p class="text-gray-600">Prozkoumejte různé hlasové modely a sledujte své využití</p>
      </div>

      <!-- Tabs Navigation -->
      <div class="flex gap-4 mb-8 border-b border-gray-200">
        <button
          @click="activeTab = 'models'"
          :class="activeTab === 'models' ? 'border-b-2 border-purple-600 text-purple-600 pb-4 font-medium' : 'text-gray-600 pb-4 hover:text-gray-800'"
          class="transition"
        >
          📊 Modely
        </button>
        <button
          @click="activeTab = 'stats'"
          :class="activeTab === 'stats' ? 'border-b-2 border-purple-600 text-purple-600 pb-4 font-medium' : 'text-gray-600 pb-4 hover:text-gray-800'"
          class="transition"
        >
          📈 Statistiky
        </button>
      </div>

      <!-- Models Tab -->
      <div v-if="activeTab === 'models'" class="space-y-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white/80 p-6 rounded-xl shadow backdrop-blur-sm">
            <p class="text-sm text-gray-600">Dostupné modely</p>
            <p class="text-3xl font-bold text-purple-600">{{ voiceModels.length }}</p>
          </div>
          <div class="bg-white/80 p-6 rounded-xl shadow backdrop-blur-sm">
            <p class="text-sm text-gray-600">Průměrné hodnocení</p>
            <p class="text-3xl font-bold text-blue-600">{{ averageRating }} ⭐</p>
          </div>
          <div class="bg-white/80 p-6 rounded-xl shadow backdrop-blur-sm">
            <p class="text-sm text-gray-600">Poskytovatelé</p>
            <p class="text-3xl font-bold text-pink-600">{{ providersCount }}</p>
          </div>
          <div class="bg-white/80 p-6 rounded-xl shadow backdrop-blur-sm">
            <p class="text-sm text-gray-600">Testů celkem</p>
            <p class="text-3xl font-bold text-green-600">{{ userStats.totalGenerations.toLocaleString() }}</p>
          </div>
        </div>

        <!-- Models Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div v-for="model in voiceModelsWithStats" :key="model.id" class="bg-white/80 p-6 rounded-xl shadow hover:shadow-lg transition">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold flex items-center gap-2">
                  {{ model.name }}
                  <span 
                    class="px-2 py-1 text-xs font-medium rounded border"
                    :class="{
                      'border-blue-500 text-blue-600': model.provider === 'google',
                      'border-green-500 text-green-600': model.provider === 'microsoft',
                      'border-orange-500 text-orange-600': model.provider === 'amazon'
                    }"
                  >
                    {{ model.provider }}
                  </span>
                </h3>
                <p class="text-sm text-gray-600 mt-2">{{ model.description }}</p>
              </div>
            </div>

            <!-- Model Info -->
            <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p class="text-gray-600">Jazyk</p>
                <p class="font-medium">{{ model.language }}</p>
              </div>
              <div>
                <p class="text-gray-600">Pohlaví</p>
                <p class="font-medium">{{ model.gender === 'female' ? '♀ Ženský' : '♂ Mužský' }}</p>
              </div>
            </div>

            <!-- Rating -->
            <div class="mb-4">
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="text-gray-600">Hodnocení (MOS)</span>
                <span class="font-medium">{{ model.rating }}/5.0</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                  :style="{ width: (model.rating / 5 * 100) + '%' }"
                ></div>
              </div>
            </div>

            <!-- Sample Count -->
            <p class="text-sm text-gray-600 mb-4">Počet testů: <span class="font-medium">{{ model.sampleCount.toLocaleString() }}</span></p>

            <!-- Play Button -->
            <button
              @click="togglePlaySample(model.id)"
              class="w-full px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 transition"
            >
              {{ playingModel === model.id ? '⏸️ Zastavit' : '▶️ Přehrát ukázku' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Tab -->
      <div v-if="activeTab === 'stats'" class="space-y-6">
        <!-- User Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white/80 p-6 rounded-xl shadow backdrop-blur-sm">
            <p class="text-sm text-gray-600 mb-2">Celkem generací</p>
            <p class="text-3xl font-bold text-purple-600">{{ userStats.totalGenerations }}</p>
          </div>
          <div class="bg-white/80 p-6 rounded-xl shadow backdrop-blur-sm">
            <p class="text-sm text-gray-600 mb-2">Celková délka</p>
            <p class="text-3xl font-bold text-blue-600">{{ totalDurationFormatted }}</p>
          </div>
          <div class="bg-white/80 p-6 rounded-xl shadow backdrop-blur-sm">
            <p class="text-sm text-gray-600 mb-2">Oblíbený model</p>
            <p class="text-lg font-bold text-pink-600">{{ favoriteModelName }}</p>
          </div>
          <div class="bg-white/80 p-6 rounded-xl shadow backdrop-blur-sm">
            <p class="text-sm text-gray-600 mb-2">Průměrné hodnocení</p>
            <p class="text-3xl font-bold text-green-600">{{ averageRating }} ⭐</p>
          </div>
        </div>

        <!-- Charts ... (simplified text-based representation for now) -->
        <div class="bg-white/80 p-6 rounded-xl shadow">
          <h3 class="text-lg font-semibold mb-4">Využití modelů</h3>
          <div class="space-y-3">
            <div v-for="item in generationsByModel" :key="item.model" class="flex items-center gap-4">
              <div class="flex-1">
                <div class="flex justify-between mb-1">
                  <span class="text-sm text-gray-700">{{ getModelName(item.model) }}</span>
                  <span class="text-sm font-medium">{{ item.count }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                    :style="{ width: ((item.count / maxModelCount) * 100) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white/80 p-6 rounded-xl shadow">
          <h3 class="text-lg font-semibold mb-4">Rozložení podle jazyků</h3>
          <div class="space-y-3">
            <div v-for="item in generationsByLanguage" :key="item.language" class="flex items-center gap-4">
              <span class="text-sm text-gray-700 w-24">{{ item.language }}</span>
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                  :style="{ width: ((item.count / maxLanguageCount) * 100) + '%' }"
                ></div>
              </div>
              <span class="text-sm font-medium w-12 text-right">{{ item.count }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white/80 p-6 rounded-xl shadow">
          <h3 class="text-lg font-semibold mb-4">Denní aktivita (poslední týden)</h3>
          <div class="space-y-2">
            <div v-for="item in dailyGenerations" :key="item.date" class="flex items-center justify-between text-sm">
              <span class="text-gray-600">{{ formatDate(item.date) }}</span>
              <div class="flex items-center gap-2">
                <div class="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                    :style="{ width: ((item.count / maxDailyCount) * 100) + '%' }"
                  ></div>
                </div>
                <span class="font-medium w-8 text-right">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { VOICE_MODELS } from '@/services/mockData'
import { fetchTtsHistory } from '@/services/api'

export default defineComponent({
  name: 'ComparisonPage',
  setup() {
    const activeTab = ref('stats')
    const playingModel = ref<string | null>(null)
    const voiceModels = ref(VOICE_MODELS)
    const records = ref<any[]>([])

    const normalizeVoiceId = (value: string) => String(value || '').trim().toLowerCase()

    const inferProvider = (voiceId: string) => {
      const normalized = normalizeVoiceId(voiceId)
      if (normalized.includes('google')) return 'google'
      if (normalized.includes('microsoft')) return 'microsoft'
      if (normalized.includes('amazon') || normalized.includes('polly')) return 'amazon'
      return 'unknown'
    }

    const inferGender = (voiceId: string) => {
      const normalized = normalizeVoiceId(voiceId)
      if (normalized.endsWith('-a') || normalized.endsWith('-f')) return 'female'
      if (normalized.endsWith('-b') || normalized.endsWith('-d') || normalized.endsWith('-m')) return 'male'
      return 'female'
    }

    const inferLanguage = (languageCode: string) => {
      if (languageCode === 'cs-CZ') return 'Čeština'
      if (languageCode === 'en-US') return 'Angličtina (US)'
      if (languageCode === 'en-GB') return 'Angličtina (UK)'
      if (languageCode === 'sk-SK') return 'Slovenština'
      return languageCode || 'Neznámý'
    }

    const loadRecords = async () => {
      const all: any[] = []
      const pageSize = 200
      let offset = 0
      let hasMore = true

      while (hasMore) {
        const response = await fetchTtsHistory({
          limit: pageSize,
          offset,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })

        const chunk = Array.isArray(response?.records) ? response.records : []
        all.push(...chunk)
        hasMore = Boolean(response?.hasMore) && chunk.length > 0
        offset += pageSize
      }

      records.value = all
    }

    onMounted(async () => {
      try {
        await loadRecords()
      } catch (error) {
        console.error('Chyba při načítání statistik:', error)
      }
    })

    const generationsByModel = computed(() => {
      const usageMap = new Map<string, number>()

      records.value.forEach((record: any) => {
        const modelId = record.voiceId || 'unknown-model'
        usageMap.set(modelId, (usageMap.get(modelId) || 0) + 1)
      })

      return Array.from(usageMap.entries())
        .map(([model, count]) => ({ model, count }))
        .sort((a, b) => b.count - a.count)
    })

    const voiceModelsWithStats = computed(() => {
      const usageMap = new Map(generationsByModel.value.map(item => [normalizeVoiceId(item.model), item.count]))
      const known = voiceModels.value.map(model => ({
        ...model,
        sampleCount: usageMap.get(normalizeVoiceId(model.id)) || 0
      }))

      const knownSet = new Set(known.map(model => normalizeVoiceId(model.id)))
      const unknownFromRecords = generationsByModel.value
        .filter(item => !knownSet.has(normalizeVoiceId(item.model)))
        .map(item => ({
          id: item.model,
          name: item.model,
          provider: inferProvider(item.model),
          language: inferLanguage(records.value.find((record: any) => record.voiceId === item.model)?.language),
          gender: inferGender(item.model),
          description: 'Model detekovaný z vašich reálných generací',
          rating: 0,
          sampleUrl: '',
          features: [],
          pricing: { characters: 0, price: 0 },
          sampleCount: item.count,
        }))

      return [...known, ...unknownFromRecords]
    })

    const averageRating = computed(() => {
      const rated = records.value.filter((record: any) => Number(record.rating) > 0)
      if (!rated.length) return '0.0'
      const sum = rated.reduce((acc, record: any) => acc + Number(record.rating || 0), 0)
      return (sum / rated.length).toFixed(1)
    })

    const generationsByLanguage = computed(() => {
      const languageMap = new Map<string, number>()

      records.value.forEach((record: any) => {
        const language = inferLanguage(record.language)
        languageMap.set(language, (languageMap.get(language) || 0) + 1)
      })

      return Array.from(languageMap.entries())
        .map(([language, count]) => ({ language, count }))
        .sort((a, b) => b.count - a.count)
    })

    const dailyGenerations = computed(() => {
      const map = new Map<string, number>()
      const dates: string[] = []

      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const key = date.toISOString().slice(0, 10)
        dates.push(key)
        map.set(key, 0)
      }

      records.value.forEach((record: any) => {
        const key = String(record.createdAt || '').slice(0, 10)
        if (map.has(key)) {
          map.set(key, (map.get(key) || 0) + 1)
        }
      })

      return dates.map(date => ({
        date,
        count: map.get(date) || 0
      }))
    })

    const userStats = computed(() => {
      const totalGenerations = records.value.length
      const totalDuration = records.value.reduce((sum: number, record: any) => sum + Number(record.duration || 0), 0)
      const favoriteModel = generationsByModel.value[0]?.model || ''

      return {
        totalGenerations,
        totalDuration,
        favoriteModel,
      }
    })

    const providersCount = computed(() => {
      const providerSet = new Set<string>()
      generationsByModel.value.forEach(item => providerSet.add(inferProvider(item.model)))
      return providerSet.size
    })

    const maxModelCount = computed(() => Math.max(...generationsByModel.value.map(item => item.count), 1))
    const maxLanguageCount = computed(() => Math.max(...generationsByLanguage.value.map(item => item.count), 1))
    const maxDailyCount = computed(() => Math.max(...dailyGenerations.value.map(item => item.count), 1))

    const togglePlaySample = (modelId: string) => {
      playingModel.value = playingModel.value === modelId ? null : modelId
    }

    const totalDurationFormatted = computed(() => {
      const hours = Math.floor(userStats.value.totalDuration / 3600)
      const minutes = Math.floor((userStats.value.totalDuration % 3600) / 60)
      return `${hours}h ${minutes}m`
    })

    const favoriteModelName = computed(() => {
      const fromCatalog = VOICE_MODELS.find(v => normalizeVoiceId(v.id) === normalizeVoiceId(userStats.value.favoriteModel))?.name
      return fromCatalog || userStats.value.favoriteModel || 'N/A'
    })

    const getModelName = (modelId: string) => {
      return VOICE_MODELS.find(v => normalizeVoiceId(v.id) === normalizeVoiceId(modelId))?.name || modelId
    }

    const formatDate = (dateString: string) => {
      const [year, month, day] = dateString.split('-')
      return `${day}.${month}`
    }

    return {
      activeTab,
      playingModel,
      voiceModels,
      voiceModelsWithStats,
      userStats,
      averageRating,
      providersCount,
      generationsByModel,
      generationsByLanguage,
      dailyGenerations,
      maxModelCount,
      maxLanguageCount,
      maxDailyCount,
      togglePlaySample,
      totalDurationFormatted,
      favoriteModelName,
      getModelName,
      formatDate
    }
  }
})
</script>
