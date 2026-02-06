export interface TtsRating {
    score: number; // 1-5
    label: string; // např. "úplně přirozené"
}

export interface TtsResult {
    id: string;
    audioUrl: string; // URL k vygenerovanému blob/souboru
    originalText: string;
    ssmlText: string; // Text s tagy
    duration: number; // v sekundách
    format: 'mp3' | 'wav';
    rating?: number; // Uživatelské hodnocení 1-5
}

export const RATING_SCALES: TtsRating[] = [
    { score: 5, label: 'úplně přirozené' },
    { score: 4, label: 'velmi dobré' },
    { score: 3, label: 'přijatelné' },
    { score: 2, label: 'dost strojové' },
    { score: 1, label: 'nepřirozené' },
];