import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TtsResult } from '@/model/TtsSession';
import type { TtsConfig } from '@/model/TtsConfig';

export const useTtsStore = defineStore('tts', () => {
    // --- STATE: Input (Obrazovka 1) ---
    const config = ref<TtsConfig>({
        text: '',
        language: 'cs-CZ',
        voiceId: 'cs-CZ-Wavenet-A',
        speed: 1.0,
        pitch: 0,
        mode: 'basic'
    });

    // --- STATE: Result (Obrazovka 2) ---
    const currentResult = ref<TtsResult | null>(null);

    // --- ACTIONS ---

    // Simulace zpracování souboru (TXT/PDF)
    async function processFileUpload(file: File) {
        // Zde by byla logika pro čtení souboru nebo volání OCR API
        console.log(`Zpracovávám soubor: ${file.name}`);

        // Mock: načteme jen název jako text pro ukázku
        if (file.type === 'text/plain') {
            const text = await file.text();
            config.value.text = text;
        } else {
            config.value.text = `[Simulace OCR pro soubor ${file.name}]...\nZde bude rozpoznaný text.`;
        }
    }

    // Simulace generování audia (přechod z 1 -> 2)
    async function generateAudio() {
        console.log('Odesílám konfiguraci na API:', config.value);

        // Mock response
        currentResult.value = {
            id: Date.now().toString(),
            audioUrl: 'mock-audio.mp3',
            originalText: config.value.text,
            ssmlText: `<speak>${config.value.text}</speak>`, // Zjednodušené
            duration: 120,
            format: 'mp3',
            rating: 0
        };
    }

    // Akce
    function updateRating(score: number) {
        if (currentResult.value) {
            currentResult.value.rating = score;
            // Zde by později bylo volání API pro uložení hodnocení
            console.log(`Hodnocení uloženo: ${score}`);
        }
    }

    function updateSsml(newSsml: string) {
        if (currentResult.value) {
            currentResult.value.ssmlText = newSsml;
        }
    }

    function downloadAudio() {
        if (!currentResult.value?.audioUrl) {
            console.warn('Žádné audio ke stažení');
            return;
        }
        // Logika pro stažení souboru
        const link = document.createElement('a');
        link.href = currentResult.value.audioUrl;
        link.download = `audio-${currentResult.value.id}.${currentResult.value.format}`;
        link.click();
    }

    return {
        config,
        currentResult,
        processFileUpload,
        generateAudio,
        updateRating,
        updateSsml,
        downloadAudio
    };
});