/**
 * API servisní funkce pro frontend (Vue/TypeScript)
 * 
 * Příklady, jak volat backend API ze frontendu
 * Používej tyto funkce ve svých Vue componentech
 */

const API_BASE = 'http://localhost:3000/api';

/**
 * ==========================================
 * Generování audia
 * ==========================================
 */

export async function generateAudio(params: {
  text: string;
  language: string;
  voiceId: string;
  speed: number;
  pitch: number;
  mode: 'basic' | 'manual-ssml' | 'auto-ssml';
  folder?: string;
}) {
  try {
    const response = await fetch(`${API_BASE}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Chyba při generování audia:', error);
    throw error;
  }
}

export async function generateMergedAudio(params: {
  texts: string[];
  language: string;
  voiceId: string;
  speed: number;
  pitch: number;
  mode: 'basic' | 'manual-ssml' | 'auto-ssml';
  folder?: string;
}) {
  try {
    const response = await fetch(`${API_BASE}/synthesize/merged`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      let backendError = '';
      try {
        const errorData = await response.json();
        backendError = errorData?.error || '';
      } catch {
        backendError = '';
      }

      throw new Error(backendError || `API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Chyba při hromadném generování audia:', error);
    throw error;
  }
}

/**
 * Načte dostupné hlasy
 */
export async function fetchVoices() {
  try {
    const response = await fetch(`${API_BASE}/voices`);
    if (!response.ok) throw new Error('Chyba při načítání hlasů');
    return await response.json();
  } catch (error) {
    console.error('Chyba:', error);
    throw error;
  }
}

/**
 * Vrátí URL pro přehrávání audio souboru
 */
export function getAudioUrl(filename: string) {
  return `${API_BASE}/audio/${filename}`;
}

/**
 * ==========================================
 * Uživatelská nastavení
 * ==========================================
 */

export async function getUserSettings() {
  try {
    const response = await fetch(`${API_BASE}/user/settings`);
    if (!response.ok) throw new Error('Chyba při načítání nastavení');
    return await response.json();
  } catch (error) {
    console.error('Chyba:', error);
    throw error;
  }
}

export async function updateUserSettings(data: any) {
  try {
    const response = await fetch(`${API_BASE}/user/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Chyba při aktualizaci');
    return await response.json();
  } catch (error) {
    console.error('Chyba:', error);
    throw error;
  }
}

export async function updateApiKeys(keys: {
  googleApiKey?: string;
  microsoftApiKey?: string;
  geminiApiKey?: string;
}) {
  try {
    const response = await fetch(`${API_BASE}/user/api-keys`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keys),
    });

    if (!response.ok) throw new Error('Chyba při aktualizaci klíčů');
    return await response.json();
  } catch (error) {
    console.error('Chyba:', error);
    throw error;
  }
}

export async function updatePreferences(prefs: {
  defaultLanguage?: string;
  defaultVoiceId?: string;
  defaultSpeed?: number;
  defaultPitch?: number;
  defaultMode?: string;
}) {
  try {
    const response = await fetch(`${API_BASE}/user/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    });

    if (!response.ok) throw new Error('Chyba při aktualizaci preferencí');
    return await response.json();
  } catch (error) {
    console.error('Chyba:', error);
    throw error;
  }
}

/**
 * ==========================================
 * TTS Záznamy (Historii a Library)
 * ==========================================
 */

export interface FetchHistoryParams {
  folder?: string;
  isFavorite?: boolean;
  language?: string;
  sortBy?: 'createdAt' | 'title' | 'rating';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Načte historii nahrávek s filtrováním
 */
export async function fetchTtsHistory(params: FetchHistoryParams = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (params.folder) queryParams.append('folder', params.folder);
    if (params.isFavorite) queryParams.append('isFavorite', 'true');
    if (params.language) queryParams.append('language', params.language);
    queryParams.append('sortBy', params.sortBy || 'createdAt');
    queryParams.append('sortOrder', params.sortOrder || 'desc');
    queryParams.append('limit', String(params.limit || 50));
    queryParams.append('offset', String(params.offset || 0));

    const response = await fetch(
      `${API_BASE}/tts/history?${queryParams.toString()}`
    );
    if (!response.ok) throw new Error('Chyba při načítání historie');

    return await response.json();
  } catch (error) {
    console.error('Chyba:', error);
    throw error;
  }
}

/**
 * Načte konkrétní záznam
 */
export async function fetchTtsRecord(id: string) {
  try {
    const response = await fetch(`${API_BASE}/tts/record/${id}`);
    if (!response.ok) throw new Error('Záznam nenalezen');
    return await response.json();
  } catch (error) {
    console.error('Chyba:', error);
    throw error;
  }
}

/**
 * Načte seznam všech složek
 */
export async function fetchFolders() {
  try {
    const response = await fetch(`${API_BASE}/tts/folders`);
    if (!response.ok) throw new Error('Chyba');
    return await response.json();
  } catch (error) {
    console.error('Chyba:', error);
    return [];
  }
}

/**
 * Aktualizuje hodnocení
 */
export async function updateRating(id: string, rating: number) {
  try {
    const response = await fetch(`${API_BASE}/tts/record/${id}/rating`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });

    if (!response.ok) throw new Error('Chyba při aktualizaci');
    return await response.json();
  } catch (error) {
    console.error('Chyba:', error);
    throw error;
  }
}

/**
 * Toggle oblíbení
 */
export async function toggleFavorite(id: string) {
  try {
    const response = await fetch(`${API_BASE}/tts/record/${id}/favorite`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Chyba');
    return await response.json();
  } catch (error) {
    console.error('Chyba:', error);
    throw error;
  }
}

/**
 * Aktualizuje záznam (název, složka, atd.)
 */
export async function updateTtsRecord(
  id: string,
  data: { title?: string; folder?: string; rating?: number }
) {
  try {
    const response = await fetch(`${API_BASE}/tts/record/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Chyba při aktualizaci');
    return await response.json();
  } catch (error) {
    console.error('Chyba:', error);
    throw error;
  }
}

/**
 * Smaže záznam a audio soubor
 */
export async function deleteTtsRecord(id: string) {
  try {
    const response = await fetch(`${API_BASE}/tts/record/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Chyba při mazání');
    return { success: true };
  } catch (error) {
    console.error('Chyba:', error);
    throw error;
  }
}

/**
 * Načte statistiky
 */
export async function fetchStatistics() {
  try {
    const response = await fetch(`${API_BASE}/tts/statistics`);
    if (!response.ok) throw new Error('Chyba');
    return await response.json();
  } catch (error) {
    console.error('Chyba:', error);
    throw error;
  }
}

/**
 * ==========================================
 * PŘÍKLADY POUŽITÍ V KOMPONENTĚ
 * ==========================================
 */

/**
 * Příklad 1: HomePage - Generování audia
 * 
 * async function handleGenerateAudio() {
 *   try {
 *     const settings = await getUserSettings();
 *     
 *     const result = await generateAudio({
 *       text: "Ahoj světe",
 *       language: settings.defaultLanguage,
 *       voiceId: settings.defaultVoiceId,
 *       speed: settings.defaultSpeed,
 *       pitch: settings.defaultPitch,
 *       mode: 'basic',
 *     });
 *     
 *     console.log('Záznam vytvořen:', result);
 *     audioUrl.value = getAudioUrl(result.audioPath);
 *   } catch (error) {
 *     console.error(error);
 *   }
 * }
 */

/**
 * Příklad 2: LibraryPage - Načtení a filtrování historie
 * 
 * async function loadHistory() {
 *   try {
 *     const data = await fetchTtsHistory({
 *       folder: selectedFolder.value,
 *       sortBy: 'createdAt',
 *       sortOrder: 'desc',
 *       limit: 20,
 *       offset: currentPage.value * 20,
 *     });
 *     
 *     records.value = data.records;
 *     totalRecords.value = data.total;
 *   } catch (error) {
 *     console.error(error);
 *   }
 * }
 */

/**
 * Příklad 3: ResultPage - Šetření hodnocení
 * 
 * async function handleRating(recordId: string, stars: number) {
 *   try {
 *     const updated = await updateRating(recordId, stars);
 *     console.log('Hodnocení uloženo:', updated);
 *   } catch (error) {
 *     console.error(error);
 *   }
 * }
 */

/**
 * Příklad 4: SettingsPage - Uložení preferencí
 * 
 * async function saveSettings() {
 *   try {
 *     await updateDefaultPreferences({
 *       defaultLanguage: selectedLanguage.value,
 *       defaultVoiceId: selectedVoice.value,
 *       defaultSpeed: speedSlider.value,
 *       defaultPitch: pitchSlider.value,
 *     });
 *     
 *     console.log('Preference uloženy');
 *   } catch (error) {
 *     console.error(error);
 *   }
 * }
 */

/**
 * Příklad 5: AccountPage - Uložení API klíčů
 * 
 * async function saveApiKeys() {
 *   try {
 *     await updateApiKeys({
 *       googleApiKey: googleKeyInput.value,
 *       microsoftApiKey: microsoftKeyInput.value,
 *     });
 *     
 *     console.log('API klíče uloženy (bezpečně!)');
 *   } catch (error) {
 *     console.error(error);
 *   }
 * }
 */
