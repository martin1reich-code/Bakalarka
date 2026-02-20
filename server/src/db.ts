import { PrismaClient } from '@prisma/client';
import path from 'path';

// Singleton instance Prismy
const prisma = new PrismaClient();

/**
 * ==========================================
 * UŽIVATELSKÁ NASTAVENÍ (UserSettings)
 * ==========================================
 */

export interface UserSettingsInput {
  googleApiKey?: string;
  microsoftApiKey?: string;
  geminiApiKey?: string;
  defaultLanguage?: string;
  defaultVoiceId?: string;
  defaultSpeed?: number;
  defaultPitch?: number;
  defaultMode?: string;
  ttsProvider?: string;
}

/**
 * Načte nastavení uživatele (vždy je jen jeden záznam s id=1)
 */
export async function getUserSettings() {
  try {
    let settings = await prisma.userSettings.findUnique({
      where: { id: 1 },
    });

    // Pokud nastavení neexistuje, vytvoř výchozí
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { id: 1 },
      });
    }

    return settings;
  } catch (error) {
    console.error('Chyba při načítání nastavení:', error);
    throw error;
  }
}

/**
 * Aktualizuje nastavení uživatele nebo vytvoří nové, pokud neexistuje
 */
export async function updateUserSettings(data: UserSettingsInput) {
  try {
    const settings = await prisma.userSettings.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        ...data,
      },
    });

    return settings;
  } catch (error) {
    console.error('Chyba při aktualizaci nastavení:', error);
    throw error;
  }
}

/**
 * Aktualizuje jen API klíče (bezpečně)
 */
export async function updateApiKeys(keys: {
  googleApiKey?: string;
  microsoftApiKey?: string;
  geminiApiKey?: string;
}) {
  try {
    return await updateUserSettings(keys);
  } catch (error) {
    console.error('Chyba při aktualizaci API klíčů:', error);
    throw error;
  }
}

/**
 * Aktualizuje jen výchozí preference
 */
export async function updateDefaultPreferences(prefs: {
  defaultLanguage?: string;
  defaultVoiceId?: string;
  defaultSpeed?: number;
  defaultPitch?: number;
  defaultMode?: string;
}) {
  try {
    return await updateUserSettings(prefs);
  } catch (error) {
    console.error('Chyba při aktualizaci preferencí:', error);
    throw error;
  }
}

/**
 * ==========================================
 * TTS ZÁZNAMY (TtsRecord)
 * ==========================================
 */

export interface CreateTtsRecordInput {
  title: string;
  originalText: string;
  ssmlText?: string;
  language: string;
  voiceId: string;
  mode: string;
  speed: number;
  pitch: number;
  audioFilePath: string;
  duration?: number;
  folder?: string;
  provider?: string;
}

export interface UpdateTtsRecordInput {
  title?: string;
  rating?: number;
  isFavorite?: boolean;
  folder?: string;
}

export interface FilterOptions {
  folder?: string;
  isFavorite?: boolean;
  language?: string;
  sortBy?: 'createdAt' | 'title' | 'rating';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Vytvoří nový TTS záznam po vygenerování audia
 */
export async function createTtsRecord(data: CreateTtsRecordInput) {
  try {
    const record = await prisma.ttsRecord.create({
      data: {
        title: data.title,
        originalText: data.originalText,
        ssmlText: data.ssmlText,
        language: data.language,
        voiceId: data.voiceId,
        mode: data.mode,
        speed: data.speed,
        pitch: data.pitch,
        audioFilePath: data.audioFilePath,
        duration: data.duration || 0,
        folder: data.folder,
        provider: data.provider || 'google',
      },
    });

    console.log(`Vytvořen TTS záznam: ${record.id}`);
    return record;
  } catch (error) {
    console.error('Chyba při vytvoření TTS záznamu:', error);
    throw error;
  }
}

/**
 * Načte jeden TTS záznam podle ID
 */
export async function getTtsRecord(id: string) {
  try {
    const record = await prisma.ttsRecord.findUnique({
      where: { id },
    });

    return record;
  } catch (error) {
    console.error('Chyba při načítání TTS záznamu:', error);
    throw error;
  }
}

/**
 * Načte historii nahrávek s filtrováním a stránkováním
 * Používá se pro LibraryScreen
 */
export async function getTtsHistory(filters: FilterOptions = {}) {
  try {
    const {
      folder,
      isFavorite,
      language,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 50,
      offset = 0,
    } = filters;

    // Sestavení WHERE podmínek
    const where: any = {};

    if (folder !== undefined) {
      where.folder = folder;
    }

    if (isFavorite !== undefined) {
      where.isFavorite = isFavorite;
    }

    if (language !== undefined) {
      where.language = language;
    }

    // Řazení
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Dotaz
    const [records, total] = await Promise.all([
      prisma.ttsRecord.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.ttsRecord.count({ where }),
    ]);

    return {
      records,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error('Chyba při načítání historie:', error);
    throw error;
  }
}

/**
 * Vrátí všechny unikátní složky pro kategorii
 */
export async function getFolders() {
  try {
    const folders = await prisma.ttsRecord.findMany({
      where: {
        folder: {
          not: null,
        },
      },
      distinct: ['folder'],
      select: {
        folder: true,
      },
    });

    return folders
      .filter((f) => f.folder !== null)
      .map((f) => f.folder) as string[];
  } catch (error) {
    console.error('Chyba při načítání složek:', error);
    throw error;
  }
}

/**
 * Aktualizuje hodnocení (rating) TTS záznamu
 */
export async function updateTtsRating(id: string, rating: number) {
  try {
    if (rating < 0 || rating > 5) {
      throw new Error('Rating musí být mezi 0 a 5');
    }

    const record = await prisma.ttsRecord.update({
      where: { id },
      data: { rating },
    });

    console.log(`Hodnocení aktualizováno: ${id} -> ${rating}`);
    return record;
  } catch (error) {
    console.error('Chyba při aktualizaci hodnocení:', error);
    throw error;
  }
}

/**
 * Přidá/odebere záznam z oblíbených
 */
export async function toggleFavorite(id: string) {
  try {
    const record = await prisma.ttsRecord.findUnique({
      where: { id },
      select: { isFavorite: true },
    });

    if (!record) {
      throw new Error('Záznam nenalezen');
    }

    const updated = await prisma.ttsRecord.update({
      where: { id },
      data: { isFavorite: !record.isFavorite },
    });

    return updated;
  } catch (error) {
    console.error('Chyba při toggle favorite:', error);
    throw error;
  }
}

/**
 * Aktualizuje TTS záznam
 */
export async function updateTtsRecord(id: string, data: UpdateTtsRecordInput) {
  try {
    const record = await prisma.ttsRecord.update({
      where: { id },
      data,
    });

    return record;
  } catch (error) {
    console.error('Chyba při aktualizaci TTS záznamu:', error);
    throw error;
  }
}

/**
 * Smaže TTS záznam a opcionálně i jeho audio soubor
 */
export async function deleteTtsRecord(id: string, deleteFile: boolean = true) {
  try {
    const record = await prisma.ttsRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new Error('Záznam nenalezen');
    }

    // Smazání souboru z disku (pokud existuje)
    if (deleteFile && record.audioFilePath) {
      const fs = require('fs').promises;
      try {
        await fs.unlink(record.audioFilePath);
        console.log(`Audio soubor smazán: ${record.audioFilePath}`);
      } catch (fileError) {
        console.warn(
          `Varování: Nelze smazat soubor ${record.audioFilePath}`,
          fileError
        );
      }
    }

    // Smazání záznamu z DB
    await prisma.ttsRecord.delete({
      where: { id },
    });

    console.log(`TTS záznam smazán: ${id}`);
  } catch (error) {
    console.error('Chyba při mazání TTS záznamu:', error);
    throw error;
  }
}

/**
 * Vrátí statistiky
 */
export async function getStatistics() {
  try {
    const [totalRecords, favoriteCount, ratedCount, topRated] =
      await Promise.all([
        prisma.ttsRecord.count(),
        prisma.ttsRecord.count({ where: { isFavorite: true } }),
        prisma.ttsRecord.count({ where: { rating: { gt: 0 } } }),
        prisma.ttsRecord.findMany({
          where: { rating: { gt: 0 } },
          orderBy: { rating: 'desc' },
          take: 5,
          select: { id: true, title: true, rating: true },
        }),
      ]);

    return {
      totalRecords,
      favoriteCount,
      ratedCount,
      averageRating:
        ratedCount > 0
          ? Math.round(
              (topRated.reduce((sum, r) => sum + r.rating, 0) / ratedCount) *
                100
            ) / 100
          : 0,
      topRatedRecords: topRated,
    };
  } catch (error) {
    console.error('Chyba při počítání statistik:', error);
    throw error;
  }
}

/**
 * ==========================================
 * CLEANUP
 * ==========================================
 */

/**
 * Zavře Prisma připojení
 * Zavolej v express shutdown handleru
 */
export async function closePrisma() {
  await prisma.$disconnect();
}

export default prisma;
