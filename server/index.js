import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as textToSpeechModule from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const textToSpeech = textToSpeechModule.default;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Google Cloud Klient
// 2. UPRAVENO: Cesta ke klíči je definována natvrdo a absolutně
const client = new textToSpeech.TextToSpeechClient({
    keyFilename: path.join(__dirname, 'google-credentials.json')
});

app.post('/api/synthesize', async (req, res) => {
    try {
        const { text, language, voiceId, speed, pitch, mode } = req.body;

        // --- LOG 1: Co přišlo z frontendu? ---
        console.log('--------------------------------------------------');
        console.log('BACKEND: Nový požadavek');
        console.log('BACKEND: Přijaté Voice ID:', voiceId);
        console.log('BACKEND: Celé body:', JSON.stringify(req.body, null, 2));

        // Příprava vstupu (Text vs SSML)
        const input = {};
        if (mode === 'manual-ssml' || mode === 'auto-ssml') {
            input.ssml = text;
        } else {
            input.text = text;
        }

        // Konfigurace hlasu
        const voice = {
            languageCode: language,
            name: voiceId, // Tady musí být přesný název, např. 'cs-CZ-Wavenet-A'
        };

        // Konfigurace audia
        const audioConfig = {
            audioEncoding: 'MP3',
            speakingRate: speed,
            pitch: pitch,
        };

        const request = {
            input: input,
            voice: voice,
            audioConfig: audioConfig,
        };

        // --- LOG 2: Co posíláme Googlu? ---
        console.log('BACKEND: Odesílám do Google API tento objekt:');
        console.log(JSON.stringify(request, null, 2));
        console.log('--------------------------------------------------');

        // Volání Google API
        const [response] = await client.synthesizeSpeech(request);

        // Uložit audio do souboru
        const audioDir = path.join(__dirname, 'audio');
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
        }

        // Generovat název souboru (s timestamps aby byl jedinečný)
        const timestamp = Date.now();
        const filename = `audio_${timestamp}.mp3`;
        const filePath = path.join(audioDir, filename);

        // Uložit audio obsah
        fs.writeFileSync(filePath, response.audioContent);

        console.log('✅ Audio uloženo:', filename);

        // Uložit záznam do databáze
        const record = await prisma.ttsRecord.create({
            data: {
                title: text.substring(0, 50) || 'Audio',
                originalText: text,
                language: language,
                voiceId: voiceId,
                mode: mode,
                speed: speed,
                pitch: pitch,
                audioFilePath: filename,
                duration: 0,
                provider: 'google'
            }
        });

        console.log('✅ Záznam v databázi vytvořen:', record.id);

        // Vrátit JSON s informacemi o souboru
        res.json({
            success: true,
            id: record.id,
            filename: filename,
            url: `/audio/${filename}`,
            message: 'Audio vygenerováno a uloženo'
        });

    } catch (error) {
        console.error('CHYBA BACKENDU:', error);
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/voices', async (req, res) => {
    try {
        const [result] = await client.listVoices({ languageCode: 'cs-CZ' });

        console.log('Dostupné hlasy pro cs-CZ:');
        result.voices.forEach(voice => {
            console.log(`Name: ${voice.name}, Gender: ${voice.ssmlGender}`);
        });

        res.json(result.voices);
    } catch (error) {
        console.error('Chyba při načítání hlasů:', error);
        res.status(500).send({ error: error.message });
    }
});

// ENDPOINT: Získání seznamu audio záznamů z databáze
app.get('/api/library', async (req, res) => {
    try {
        const records = await prisma.ttsRecord.findMany({
            orderBy: { createdAt: 'desc' }
        });

        res.json(records);
    } catch (error) {
        console.error('Chyba při načítání knihovny:', error);
        res.status(500).json({ error: error.message });
    }
});

// ENDPOINT: Mazání audio záznamu
app.delete('/api/library/:id', async (req, res) => {
    try {
        const recordId = req.params.id;

        // Najít záznam v databázi
        const record = await prisma.ttsRecord.findUnique({
            where: { id: recordId }
        });

        if (!record) {
            return res.status(404).json({ error: 'Záznam nenalezen' });
        }

        // Smazat audio soubor
        if (record.audioFilePath) {
            const filePath = path.join(__dirname, 'audio', record.audioFilePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('✅ Audio soubor smazán:', record.audioFilePath);
            }
        }

        // Smazat záznam z databáze
        await prisma.ttsRecord.delete({
            where: { id: recordId }
        });

        console.log('✅ Záznam smazán z databáze:', recordId);

        res.json({ success: true, message: 'Audio bylo smazáno' });
    } catch (error) {
        console.error('Chyba při mazání:', error);
        res.status(500).json({ error: error.message });
    }
});

// ENDPOINT: Servírování audio souborů s CORS headery
app.get('/audio/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'audio', filename);

        // Bezpečnostní check
        if (!filePath.startsWith(path.join(__dirname, 'audio'))) {
            return res.status(400).json({ error: 'Neplatné jméno souboru' });
        }

        // Zkontrolovat existenci souboru
        if (!fs.existsSync(filePath)) {
            console.error('❌ Soubor nenalezen:', filePath);
            return res.status(404).json({ error: 'Soubor nenalezen' });
        }

        // Nastavit správné CORS a audio headery
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Disposition', 'inline');

        // Vrátit soubor jako stream
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('error', (err) => {
            console.error('❌ Chyba streamingu:', err);
            res.status(500).json({ error: 'Chyba při čtení souboru' });
        });

        console.log('✅ Servíruji audio:', filename);
    } catch (error) {
        console.error('Chyba při servírování audio:', error);
        res.status(500).json({ error: error.message });
    }
});

// Fallback pro static audio (pro ostatní soubory)
app.use('/audio', express.static(path.join(__dirname, 'audio'), {
    setHeaders: (res, path) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'audio/mpeg');
    }
}));

app.listen(port, () => {
    console.log(`Backend server běží na http://localhost:${port}`);
});

//node server/index.js