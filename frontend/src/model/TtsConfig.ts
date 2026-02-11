export type TtsMode = 'basic' | 'manual-ssml' | 'auto-ssml';

export interface VoiceOption {
    id: string;
    name: string;
    gender: 'male' | 'female';
    language: string;
}

export interface TtsConfig {
    text: string;
    language: string;
    voiceId: string;
    speed: number;
    pitch: number;
    mode: TtsMode;
}

export const AVAILABLE_VOICES: VoiceOption[] = [
    // --- CHIRP 3 HD (Nejnovější generace - Velmi přirozené) ---
    {
        id: 'cs-CZ-Chirp3-HD-Achird',
        name: '🇨🇿 Čeština - Muž 1 (HD Achird)',
        gender: 'male',
        language: 'cs-CZ'
    },
    {
        id: 'cs-CZ-Chirp3-HD-Fenrir',
        name: '🇨🇿 Čeština - Muž 2 (HD Fenrir)',
        gender: 'male',
        language: 'cs-CZ'
    },
    {
        id: 'cs-CZ-Chirp3-HD-Puck',
        name: '🇨🇿 Čeština - Muž 3 (HD Puck)',
        gender: 'male',
        language: 'cs-CZ'
    },
    {
        id: 'cs-CZ-Chirp3-HD-Achernar',
        name: '🇨🇿 Čeština - Žena 1 (HD Achernar)',
        gender: 'female',
        language: 'cs-CZ'
    },
    {
        id: 'cs-CZ-Chirp3-HD-Aoede',
        name: '🇨🇿 Čeština - Žena 2 (HD Aoede)',
        gender: 'female',
        language: 'cs-CZ'
    },

    // --- KLASICKÉ WAVENET (Starší, robotičtější) ---
    {
        id: 'cs-CZ-Wavenet-A',
        name: '🇨🇿 Čeština - Žena (Klasická Wavenet)',
        gender: 'female',
        language: 'cs-CZ'
    },

    // --- ANGLIČTINA ---
    {
        id: 'en-US-Neural2-A',
        name: '🇺🇸 English - Neural Female',
        gender: 'female',
        language: 'en-US'
    },
    {
        id: 'en-US-Neural2-D',
        name: '🇺🇸 English - Neural Male',
        gender: 'male',
        language: 'en-US'
    }
];