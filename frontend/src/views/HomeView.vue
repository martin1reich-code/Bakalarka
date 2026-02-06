<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // Předpokládám vue-router
import { useTtsStore } from '@/stores/ttsStore';
import { storeToRefs } from 'pinia';
import TtsSettingsPanel from '@/components/TtsSettingsPanel.vue';

const router = useRouter();
const ttsStore = useTtsStore();
const { config } = storeToRefs(ttsStore);
const fileInput = ref<HTMLInputElement | null>(null);

// Obsluha nahrání souboru
const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    ttsStore.processFileUpload(target.files[0]);
  }
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleSubmit = async () => {
  if (!config.value.text) {
    alert('Prosím zadejte text nebo nahrajte soubor.');
    return;
  }

  // 1. Zavoláme akci pro generování (nebo přípravu)
  await ttsStore.generateAudio();

  // 2. Přesměrujeme na stránku s výsledkem
  // Předpokládám, že máš v routeru cestu '/result'
  router.push('/result');
};
</script>

<template>
  <div class="max-w-6xl mx-auto p-6">

    <header class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-800">TTS Syntetizér</h1>
      <p class="text-gray-500 mt-2">Bakalářská práce - Generování audioknih s využitím SSML</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <div class="lg:col-span-2 space-y-4">

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex justify-between items-center mb-2">
            <label class="text-sm font-semibold text-gray-700">Vstupní text</label>

            <button
                @click="triggerFileUpload"
                class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>📂</span> Nahrát soubor (TXT, PDF)
            </button>
            <input
                type="file"
                ref="fileInput"
                class="hidden"
                accept=".txt,.pdf"
                @change="onFileChange"
            >
          </div>

          <textarea
              v-model="config.text"
              placeholder="Sem vložte text nebo nahrajte soubor..."
              class="w-full h-96 p-4 border rounded bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-sans leading-relaxed"
          ></textarea>

          <div class="text-right mt-2 text-xs text-gray-400">
            Počet znaků: {{ config.text.length }}
          </div>
        </div>
      </div>

      <div class="lg:col-span-1">
        <TtsSettingsPanel />

        <button
            @click="handleSubmit"
            class="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5 transition duration-200 flex justify-center items-center gap-2"
        >
          <span>Generovat Audio</span>
          <span>➜</span>
        </button>
      </div>

    </div>
  </div>
</template>