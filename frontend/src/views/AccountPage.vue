<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Uživatelský účet
        </h1>
        <p class="text-gray-600">Spravujte své API klíče a preference</p>
      </div>

      <!-- Tabs Navigation -->
      <div class="flex gap-4 mb-8 border-b border-gray-200">
        <button
          @click="activeTab = 'profile'"
          :class="activeTab === 'profile' ? 'border-b-2 border-purple-600 text-purple-600 pb-4 font-medium' : 'text-gray-600 pb-4 hover:text-gray-800'"
          class="transition flex items-center gap-2"
        >
          👤 Profil
        </button>
        <button
          @click="activeTab = 'api'"
          :class="activeTab === 'api' ? 'border-b-2 border-purple-600 text-purple-600 pb-4 font-medium' : 'text-gray-600 pb-4 hover:text-gray-800'"
          class="transition flex items-center gap-2"
        >
          🔐 API klíče
        </button>
        <button
          @click="activeTab = 'preferences'"
          :class="activeTab === 'preferences' ? 'border-b-2 border-purple-600 text-purple-600 pb-4 font-medium' : 'text-gray-600 pb-4 hover:text-gray-800'"
          class="transition flex items-center gap-2"
        >
          ⚙️ Preference
        </button>
      </div>

      <!-- Profile Tab -->
      <div v-if="activeTab === 'profile'" class="space-y-6">
        <!-- User Info Card -->
        <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
          <!-- Header Section -->
          <div class="px-10 pt-10 pb-8 border-b border-gray-200">
            <h2 class="text-2xl font-semibold mb-2">Informace o účtu</h2>
            <p class="text-sm text-gray-600">Vaše osobní údaje (mock data)</p>
          </div>

          <!-- User Profile Section -->
          <div class="px-10 py-10">
            <div class="flex items-start gap-8 mb-10">
              <!-- Avatar -->
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                JN
              </div>
              <!-- User Info -->
              <div class="flex-1">
                <h3 class="text-2xl font-bold mb-2">Jan Novák</h3>
                <p class="text-gray-600 mb-6">jan.novak@example.com</p>
                <button class="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-medium">
                  Upravit profil
                </button>
              </div>
            </div>

            <!-- User Details Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
              <div class="space-y-3">
                <p class="text-sm text-gray-600 flex items-center gap-2">
                  📧 Email
                </p>
                <p class="text-lg font-medium text-gray-800">jan.novak@example.com</p>
              </div>
              <div class="space-y-3">
                <p class="text-sm text-gray-600 flex items-center gap-2">
                  📅 Člen od
                </p>
                <p class="text-lg font-medium text-gray-800">15. ledna 2026</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div>
          <h2 class="text-xl font-semibold mb-4">Statistiky účtu</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <p class="text-sm text-gray-600 mb-2">Generací</p>
              <p class="text-3xl font-bold text-purple-600">127</p>
            </div>
            <div class="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <p class="text-sm text-gray-600 mb-2">Audio času</p>
              <p class="text-3xl font-bold text-blue-600">6.8h</p>
            </div>
            <div class="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <p class="text-sm text-gray-600 mb-2">Průměr MOS</p>
              <p class="text-3xl font-bold text-pink-600">4.6</p>
            </div>
            <div class="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <p class="text-sm text-gray-600 mb-2">Složky</p>
              <p class="text-3xl font-bold text-green-600">4</p>
            </div>
          </div>
        </div>
      </div>

      <!-- API Keys Tab -->
      <div v-if="activeTab === 'api'" class="space-y-6">
        <div class="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
          <h2 class="text-xl font-semibold mb-2">API klíče</h2>
          <p class="text-sm text-gray-600 mb-8">Uložte své API klíče pro využití vlastních kreditů. Data jsou uložena pouze lokálně v prohlížeči.</p>

          <!-- Google Cloud TTS -->
          <div class="border border-gray-200 rounded-xl p-6 mb-6 hover:shadow-lg transition">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
                G
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold">Google Cloud TTS</h3>
                <p class="text-sm text-gray-600">Text-to-Speech API</p>
              </div>
            </div>
            <div class="space-y-3">
              <input
                v-model="apiKeys.google"
                type="password"
                placeholder="Vložte Google Cloud API klíč"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500"
              />
              <div class="flex items-center justify-between">
                <a href="https://cloud.google.com/text-to-speech" target="_blank" class="text-sm text-blue-600 hover:underline">
                  Jak získat API klíč? ↗
                </a>
                <button 
                  @click="saveApiKey('google')"
                  class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  💾 Uložit
                </button>
              </div>
            </div>
          </div>

          <!-- Microsoft Azure -->
          <div class="border border-gray-200 rounded-xl p-6 mb-6 hover:shadow-lg transition">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-xl font-bold text-green-600">
                M
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold">Microsoft Azure</h3>
                <p class="text-sm text-gray-600">Cognitive Services Speech</p>
              </div>
            </div>
            <div class="space-y-3">
              <input
                v-model="apiKeys.microsoft"
                type="password"
                placeholder="Vložte Azure API klíč"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:border-green-500"
              />
              <div class="flex items-center justify-between">
                <a href="https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/" target="_blank" class="text-sm text-blue-600 hover:underline">
                  Jak získat API klíč? ↗
                </a>
                <button 
                  @click="saveApiKey('microsoft')"
                  class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  💾 Uložit
                </button>
              </div>
            </div>
          </div>

          <!-- Amazon Polly -->
          <div class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-600">
                A
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold">Amazon Polly</h3>
                <p class="text-sm text-gray-600">AWS Text-to-Speech</p>
              </div>
            </div>
            <div class="space-y-3">
              <input
                v-model="apiKeys.amazon"
                type="password"
                placeholder="Vložte AWS Access Key"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:border-orange-500"
              />
              <div class="flex items-center justify-between">
                <a href="https://aws.amazon.com/polly/" target="_blank" class="text-sm text-blue-600 hover:underline">
                  Jak získat API klíč? ↗
                </a>
                <button 
                  @click="saveApiKey('amazon')"
                  class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  💾 Uložit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Preferences Tab -->
      <div v-if="activeTab === 'preferences'" class="space-y-6">
        <div class="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
          <h2 class="text-2xl font-semibold mb-2">Výchozí nastavení</h2>
          <p class="text-gray-600 mb-8">Nastavte svoje preferované hodnoty pro generování audio</p>

          <!-- Default Speed and Pitch Controls -->
          <div class="grid grid-cols-2 gap-8 mb-8">
            <!-- Default Speed -->
            <div>
              <label class="block font-semibold text-lg mb-4">Výchozí rychlost</label>
              <div class="flex items-center gap-3 mb-4">
                <button
                  @click="preferences.defaultSpeed = Math.max(0.5, preferences.defaultSpeed - 0.25)"
                  class="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  −
                </button>
                <input 
                  v-model.number="preferences.defaultSpeed"
                  type="number"
                  step="0.25"
                  min="0.5"
                  max="2"
                  class="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-center font-semibold text-lg"
                />
                <button
                  @click="preferences.defaultSpeed = Math.min(2, preferences.defaultSpeed + 0.25)"
                  class="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  +
                </button>
              </div>
              <p class="text-sm text-gray-600">Aktuální: {{ preferences.defaultSpeed.toFixed(2) }}x</p>
            </div>

            <!-- Default Pitch -->
            <div>
              <label class="block font-semibold text-lg mb-4">Výchozí výška hlasu</label>
              <div class="flex items-center gap-3 mb-4">
                <button
                  @click="preferences.defaultPitch = Math.max(-10, preferences.defaultPitch - 1)"
                  class="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  −
                </button>
                <input 
                  v-model.number="preferences.defaultPitch"
                  type="number"
                  step="1"
                  min="-10"
                  max="10"
                  class="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-center font-semibold text-lg"
                />
                <button
                  @click="preferences.defaultPitch = Math.min(10, preferences.defaultPitch + 1)"
                  class="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  +
                </button>
              </div>
              <p class="text-sm text-gray-600">Aktuální: {{ preferences.defaultPitch > 0 ? '+' : '' }}{{ preferences.defaultPitch }}</p>
            </div>
          </div>

          <!-- Default Language -->
          <div class="mb-8">
            <label class="block font-semibold text-lg mb-3">Výchozí jazyk</label>
            <select v-model="preferences.defaultLanguage" class="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white hover:border-gray-400 focus:outline-none focus:border-purple-600">
              <option value="cs-CZ">🇨🇿 Čeština</option>
              <option value="en-US">🇺🇸 Angličtina (US)</option>
              <option value="en-GB">🇬🇧 Angličtina (UK)</option>
              <option value="sk-SK">🇸🇰 Slovenština</option>
            </select>
          </div>

          <!-- Default Voice Model -->
          <div class="mb-8">
            <label class="block font-semibold text-lg mb-3">Výchozí hlasový model</label>
            <select v-model="preferences.defaultModel" class="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white hover:border-gray-400 focus:outline-none focus:border-purple-600">
              <option value="google-cs-neural2-a">CS-Neural2-A (Google)</option>
              <option value="microsoft-cs-antonin">Antonín (Microsoft)</option>
              <option value="microsoft-cs-vlasta">Vlasta (Microsoft)</option>
            </select>
          </div>

          <!-- Theme -->
          <div class="mb-8">
            <label class="block font-semibold text-lg mb-3">Motiv</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  v-model="preferences.theme" 
                  type="radio" 
                  value="light"
                  class="w-4 h-4"
                />
                <span>☀️ Světlý</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  v-model="preferences.theme" 
                  type="radio" 
                  value="dark"
                  class="w-4 h-4"
                />
                <span>🌙 Tmavý</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  v-model="preferences.theme" 
                  type="radio" 
                  value="system"
                  class="w-4 h-4"
                />
                <span>⚙️ Systém</span>
              </label>
            </div>
          </div>

          <!-- Notifications -->
          <div class="pt-8 border-t border-gray-200 mb-8">
            <h3 class="font-semibold text-lg mb-4">Oznámení</h3>
            <div class="space-y-3">
              <label class="flex items-center gap-3 cursor-pointer">
                <input 
                  v-model="preferences.emailNotifications" 
                  type="checkbox"
                  class="w-4 h-4"
                />
                <span>📧 Emailová oznámení</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input 
                  v-model="preferences.generationComplete" 
                  type="checkbox"
                  class="w-4 h-4"
                />
                <span>✅ Upozornit na dokončení generování</span>
              </label>
            </div>
          </div>

          <!-- Save Button -->
          <button 
            @click="savePreferences"
            class="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2 font-semibold"
          >
            💾 Uložit preference
          </button>
        </div>

        <!-- Danger Zone -->
        <div class="bg-red-50 border border-red-200 p-8 rounded-xl">
          <h2 class="text-xl font-semibold text-red-600 mb-4">⚠️ Nebezpečná zóna</h2>
          <button class="px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-100 transition">
            Smazat účet
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'

export default defineComponent({
  name: 'AccountPage',
  setup() {
    const activeTab = ref('profile')
    const apiKeys = reactive({
      google: '',
      microsoft: '',
      amazon: ''
    })
    const preferences = reactive({
      defaultLanguage: 'cs-CZ',
      defaultModel: 'google-cs-neural2-a',
      defaultSpeed: 1.0,
      defaultPitch: 0,
      theme: 'system' as 'light' | 'dark' | 'system',
      emailNotifications: true,
      generationComplete: true
    })

    const saveApiKey = (provider: 'google' | 'microsoft' | 'amazon') => {
      // TODO: V reálné aplikaci by se zde uložilo do localStorage nebo na backend
      alert(`API klíč pro ${provider} byl uložen`)
    }

    const savePreferences = () => {
      // TODO: V reálné aplikaci by se zde uložilo do localStorage nebo na backend
      alert('Preference byly uloženy')
    }

    return {
      activeTab,
      apiKeys,
      preferences,
      saveApiKey,
      savePreferences
    }
  }
})
</script>
