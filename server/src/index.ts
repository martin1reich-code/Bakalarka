import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as db from './db.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security headers - relax CSP to allow audio and images
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self' http://localhost:* http://127.0.0.1:*; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: http://localhost:* http://127.0.0.1:*; media-src 'self' http://localhost:* http://127.0.0.1:* blob:; connect-src 'self' http://localhost:* http://127.0.0.1:*;");
  next();
});

app.use(bodyParser.json({ limit: '50mb' }));

// Google Cloud Client
const client = new TextToSpeechClient({
  keyFilename: path.join(__dirname, '..', 'google-credentials.json'),
});

// Adresář pro audio soubory
const AUDIO_DIR = path.join(__dirname, '..', 'audio');

// Vytvoření adresáře, pokud neexistuje
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

const buildSynthesizeRequest = (
  text: string,
  language: string,
  voiceId: string,
  speed: number,
  pitch: number,
  mode: string
) => {
  const input: any = {};
  if (mode === 'manual-ssml' || mode === 'auto-ssml') {
    const trimmed = text.trim();
    const ssml = trimmed.includes('<speak') ? trimmed : `<speak>${trimmed}</speak>`;
    input.ssml = ssml;
  } else {
    input.text = text;
  }

  return {
    input,
    voice: {
      languageCode: language,
      name: voiceId,
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: speed,
      pitch,
    },
  };
};

/**
 * POST /api/synthesize - Generuje audio a uloží do DB
 */
app.post('/api/synthesize', async (req, res) => {
  try {
    const { text, language, voiceId, speed, pitch, mode, folder } = req.body;

    console.log('--------------------------------------------------');
    console.log('BACKEND: Nový požadavek TTS');
    console.log('BACKEND: Přijaté Voice ID:', voiceId);
    console.log('BACKEND: Text:', text.substring(0, 50) + '...');

    const request = buildSynthesizeRequest(text, language, voiceId, speed, pitch, mode);

    console.log('BACKEND: Odesílám do Google API...');

    // Volání Google API
    const [response] = await client.synthesizeSpeech(request as any);

    // Generování jedinečného jména souboru
    const timestamp = Date.now();
    const audioFileName = `${timestamp}-${Math.random().toString(36).substr(2, 9)}.mp3`;
    const audioFilePath = path.join(AUDIO_DIR, audioFileName);

    // Uložení audio souboru na disk
    await fsPromises.writeFile(audioFilePath, response.audioContent as Buffer);
    console.log(`Audio soubor uložen: ${audioFilePath}`);

    // Generování titulku z textu (prvních 100 znaků)
    const title = (text.substring(0, 100) + '...').replace(/<[^>]*>/g, '');

    // Vytvoření záznamu v DB
    const ttsRecord = await db.createTtsRecord({
      title,
      originalText: text,
      ssmlText: mode !== 'basic' ? text : undefined,
      language,
      voiceId,
      mode,
      speed,
      pitch,
      audioFilePath,
      folder,
      provider: 'google',
      duration: 0, // Google API zatím nevrací délku
    });

    // Odpověď
    res.json({
      id: ttsRecord.id,
      title: ttsRecord.title,
      audioPath: `/api/audio/${audioFileName}`,
      success: true,
    });

    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('CHYBA BACKENDU:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Neznámá chyba',
    });
  }
});

/**
 * POST /api/synthesize/merged - Vygeneruje více částí a spojí je do jednoho audia (1 DB záznam)
 */
app.post('/api/synthesize/merged', async (req, res) => {
  try {
    const { texts, language, voiceId, speed, pitch, mode, folder } = req.body;

    if (!Array.isArray(texts) || texts.length === 0) {
      res.status(400).json({ error: 'Pole texts je povinné a musí obsahovat alespoň jednu část.' });
      return;
    }

    const cleanedParts = texts
      .map((part: unknown) => (typeof part === 'string' ? part.trim() : ''))
      .filter((part: string) => part.length > 0);

    if (cleanedParts.length === 0) {
      res.status(400).json({ error: 'Všechny části textu jsou prázdné.' });
      return;
    }

    const chunks: Buffer[] = [];

    for (let index = 0; index < cleanedParts.length; index++) {
      const partText = cleanedParts[index];
      const request = buildSynthesizeRequest(partText, language, voiceId, speed, pitch, mode);
      let response: any;

      try {
        [response] = await client.synthesizeSpeech(request as any);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Neznámá chyba Google TTS';
        throw new Error(`Chyba při syntéze části ${index + 1}/${cleanedParts.length}: ${message}`);
      }

      if (!response.audioContent) {
        throw new Error(`Google API nevrátilo audioContent pro část ${index + 1}/${cleanedParts.length}.`);
      }

      chunks.push(Buffer.from(response.audioContent as Buffer));
    }

    const mergedAudio = Buffer.concat(chunks);
    const timestamp = Date.now();
    const audioFileName = `${timestamp}-${Math.random().toString(36).substr(2, 9)}.mp3`;
    const audioFilePath = path.join(AUDIO_DIR, audioFileName);

    await fsPromises.writeFile(audioFilePath, mergedAudio);

    const fullText = cleanedParts.join('\n\n');
    const plainTextTitle = fullText.replace(/<[^>]*>/g, '').trim();
    const title = (plainTextTitle.substring(0, 100) + '...');

    const ttsRecord = await db.createTtsRecord({
      title,
      originalText: fullText,
      ssmlText: mode !== 'basic' ? fullText : undefined,
      language,
      voiceId,
      mode,
      speed,
      pitch,
      audioFilePath,
      folder,
      provider: 'google',
      duration: 0,
    });

    res.json({
      id: ttsRecord.id,
      title: ttsRecord.title,
      audioPath: `/api/audio/${audioFileName}`,
      partsCount: cleanedParts.length,
      success: true,
    });
  } catch (error) {
    console.error('CHYBA BACKENDU (MERGED):', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Neznámá chyba při hromadném generování',
    });
  }
});

/**
 * GET /api/voices - Vrátí dostupné hlasy
 */
app.get('/api/voices', async (req, res) => {
  try {
    const [result] = await client.listVoices({
      languageCode: 'cs-CZ',
    } as any);

    res.json(result.voices);
  } catch (error) {
    console.error('Chyba při načítání hlasů:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Chyba při načítání hlasů',
    });
  }
});

/**
 * GET /api/audio/:filename - Vrátí audio soubor
 */
app.get('/api/audio/:filename', async (req, res) => {
  try {
    const filePath = path.join(AUDIO_DIR, req.params.filename);

    // Bezpečnostní kontrola - zabránění path traversal
    if (!filePath.startsWith(AUDIO_DIR)) {
      res.status(403).json({ error: 'Přístup odepřen' });
      return;
    }

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Soubor nenalezen' });
      return;
    }

    res.set('Content-Type', 'audio/mpeg');
    res.sendFile(filePath);
  } catch (error) {
    console.error('Chyba při servírování audio souboru:', error);
    res.status(500).json({ error: 'Chyba při servírování audio souboru' });
  }
});

/**
 * ==========================================
 * API PRO UŽIVATELSKÁ NASTAVENÍ
 * ==========================================
 */

/**
 * GET /api/user/settings - Načte nastavení uživatele
 */
app.get('/api/user/settings', async (req, res) => {
  try {
    const settings = await db.getUserSettings();
    res.json(settings);
  } catch (error) {
    console.error('Chyba při načítání nastavení:', error);
    res.status(500).json({ error: 'Chyba při načítání nastavení' });
  }
});

/**
 * PUT /api/user/settings - Aktualizuje nastavení uživatele
 */
app.put('/api/user/settings', async (req, res) => {
  try {
    const settings = await db.updateUserSettings(req.body);
    res.json(settings);
  } catch (error) {
    console.error('Chyba při aktualizaci nastavení:', error);
    res.status(500).json({ error: 'Chyba při aktualizaci nastavení' });
  }
});

/**
 * PUT /api/user/api-keys - Aktualizuje jen API klíče
 */
app.put('/api/user/api-keys', async (req, res) => {
  try {
    const keys = await db.updateApiKeys(req.body);
    res.json(keys);
  } catch (error) {
    console.error('Chyba při aktualizaci API klíčů:', error);
    res.status(500).json({ error: 'Chyba při aktualizaci API klíčů' });
  }
});

/**
 * PUT /api/user/preferences - Aktualizuje výchozí preference
 */
app.put('/api/user/preferences', async (req, res) => {
  try {
    const prefs = await db.updateDefaultPreferences(req.body);
    res.json(prefs);
  } catch (error) {
    console.error('Chyba při aktualizaci preferencí:', error);
    res.status(500).json({ error: 'Chyba při aktualizaci preferencí' });
  }
});

/**
 * ==========================================
 * API PRO TTS ZÁZNAMY
 * ==========================================
 */

/**
 * GET /api/tts/history - Vrátí historii nahrávek s filtrováním
 * Query parametry: folder, isFavorite, language, sortBy, sortOrder, limit, offset
 */
app.get('/api/tts/history', async (req, res) => {
  try {
    const filters = {
      folder: req.query.folder as string | undefined,
      isFavorite: req.query.isFavorite === 'true',
      language: req.query.language as string | undefined,
      sortBy: (req.query.sortBy as
        | 'createdAt'
        | 'title'
        | 'rating'
        | undefined) || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc' | undefined) || 'desc',
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };

    const history = await db.getTtsHistory(filters);
    res.json(history);
  } catch (error) {
    console.error('Chyba při načítání historie:', error);
    res.status(500).json({ error: 'Chyba při načítání historie' });
  }
});

/**
 * GET /api/tts/record/:id - Vrátí konkrétní záznam
 */
app.get('/api/tts/record/:id', async (req, res) => {
  try {
    const record = await db.getTtsRecord(req.params.id);

    if (!record) {
      res.status(404).json({ error: 'Záznam nenalezen' });
      return;
    }

    res.json(record);
  } catch (error) {
    console.error('Chyba při načítání záznamu:', error);
    res.status(500).json({ error: 'Chyba při načítání záznamu' });
  }
});

/**
 * GET /api/tts/folders - Vrátí všechny složky
 */
app.get('/api/tts/folders', async (req, res) => {
  try {
    const folders = await db.getFolders();
    res.json(folders);
  } catch (error) {
    console.error('Chyba při načítání složek:', error);
    res.status(500).json({ error: 'Chyba při načítání složek' });
  }
});

/**
 * PUT /api/tts/record/:id/rating - Aktualizuje hodnocení
 */
app.put('/api/tts/record/:id/rating', async (req, res) => {
  try {
    const { rating } = req.body;

    const record = await db.updateTtsRating(req.params.id, rating);
    res.json(record);
  } catch (error) {
    console.error('Chyba při aktualizaci hodnocení:', error);
    res.status(500).json({ error: 'Chyba při aktualizaci hodnocení' });
  }
});

/**
 * PUT /api/tts/record/:id/favorite - Přidá/odebere z oblíbených
 */
app.put('/api/tts/record/:id/favorite', async (req, res) => {
  try {
    const record = await db.toggleFavorite(req.params.id);
    res.json(record);
  } catch (error) {
    console.error('Chyba při toggle favorite:', error);
    res.status(500).json({ error: 'Chyba při toggle favorite' });
  }
});

/**
 * PUT /api/tts/record/:id - Aktualizuje záznam
 */
app.put('/api/tts/record/:id', async (req, res) => {
  try {
    const record = await db.updateTtsRecord(req.params.id, req.body);
    res.json(record);
  } catch (error) {
    console.error('Chyba při aktualizaci záznamu:', error);
    res.status(500).json({ error: 'Chyba při aktualizaci záznamu' });
  }
});

/**
 * DELETE /api/tts/record/:id - Smaže záznam a audio soubor
 */
app.delete('/api/tts/record/:id', async (req, res) => {
  try {
    await db.deleteTtsRecord(req.params.id, true);
    res.json({ success: true });
  } catch (error) {
    console.error('Chyba při mazání záznamu:', error);
    res.status(500).json({ error: 'Chyba při mazání záznamu' });
  }
});

/**
 * GET /api/tts/statistics - Vrátí statistiky
 */
app.get('/api/tts/statistics', async (req, res) => {
  try {
    const stats = await db.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Chyba při počítání statistik:', error);
    res.status(500).json({ error: 'Chyba při počítání statistik' });
  }
});

/**
 * ==========================================
 * Server startup
 * ==========================================
 */

const server = app.listen(port, () => {
  console.log(`Backend server běží na http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM přijat, vypínám server...');
  server.close(async () => {
    await db.closePrisma();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT přijat, vypínám server...');
  server.close(async () => {
    await db.closePrisma();
    process.exit(0);
  });
});

export default app;
