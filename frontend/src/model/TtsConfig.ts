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
    speed: number; // např. 0.5 až 2.0 (1.0 default)
    pitch: number; // např. -20Hz až +20Hz (0 default)
    mode: TtsMode;
}

// Mock dat pro dropdowny
export const AVAILABLE_VOICES: VoiceOption[] = [
    { id: 'cs-CZ-Wavenet-A', name: 'Čeština - Žena A (Wavenet)', gender: 'female', language: 'cs-CZ' },
    { id: 'cs-CZ-Standard-A', name: 'Čeština - Žena B (Standard)', gender: 'female', language: 'cs-CZ' },
    { id: 'cs-CZ-Wavenet-B', name: 'Čeština - Muž A (Wavenet)', gender: 'male', language: 'cs-CZ' },
    { id: 'en-US-Neural2-A', name: 'English - Female (Neural)', gender: 'female', language: 'en-US' },
];