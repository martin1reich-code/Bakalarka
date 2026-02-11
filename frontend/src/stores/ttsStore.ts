import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TtsResult } from '@/model/TtsSession';
import type { TtsConfig } from '@/model/TtsConfig';
// 1. PŘIDAT IMPORT: Potřebujeme seznam hlasů, abychom zjistili jejich jazyk
import { AVAILABLE_VOICES } from '@/model/TtsConfig';

export const useTtsStore = defineStore('tts', () => {
    const config = ref<TtsConfig>({
        text: '',
        language: 'cs-CZ',
        voiceId: 'cs-CZ-Wavenet-A',
        speed: 1.0,
        pitch: 0,
        mode: 'basic'
    });

    const currentResult = ref<TtsResult | null>(null);
    const isLoading = ref(false);

    async function processFileUpload(file: File) {
        if (file.type === 'text/plain') {
            config.value.text = await file.text();
        } else {
            config.value.text = "OCR zatím není implementováno, prosím vložte TXT soubor.";
        }
    }

    async function generateAudio() {
        isLoading.value = true;
        try {
            // 2. LOGIKA PRO JAZYK: Najdeme objekt vybraného hlasu
            const selectedVoice = AVAILABLE_VOICES.find(v => v.id === config.value.voiceId);

            // Pokud hlas najdeme, použijeme jeho jazyk. Pokud ne, necháme tam to, co tam je.
            const correctLanguage = selectedVoice ? selectedVoice.language : config.value.language;

            // Aktualizujeme config o správný jazyk, aby se to propsalo i do UI
            config.value.language = correctLanguage;

            console.log('%c FRONTEND: Odesílám konfiguraci: ', 'background: #222; color: #bada55');
            console.log(`Vybraný hlas: ${config.value.voiceId}, Jazyk automaticky nastaven na: ${correctLanguage}`);

            const response = await fetch('http://localhost:3000/api/synthesize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Odesíláme aktualizovaný config se správným jazykem
                body: JSON.stringify(config.value),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `Chyba backendu: ${response.statusText}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            currentResult.value = {
                id: Date.now().toString(),
                audioUrl: audioUrl,
                originalText: config.value.text,
                ssmlText: config.value.mode === 'basic'
                    ? `<speak>${config.value.text}</speak>`
                    : config.value.text,
                duration: 0,
                format: 'mp3',
                rating: 0
            };

        } catch (error: any) {
            console.error('Generování selhalo:', error);
            alert(`Chyba: ${error.message}`);
        } finally {
            isLoading.value = false;
        }
    }

    function updateRating(score: number) {
        if (currentResult.value) currentResult.value.rating = score;
    }

    function downloadAudio() {
        if (!currentResult.value?.audioUrl) return;
        const link = document.createElement('a');
        link.href = currentResult.value.audioUrl;
        link.download = `audio-${currentResult.value.id}.mp3`;
        link.click();
    }

    return {
        config,
        currentResult,
        isLoading,
        processFileUpload,
        generateAudio,
        updateRating,
        downloadAudio
    };
});