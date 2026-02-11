require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const path = require('path'); // <--- 1. PŘIDÁNO: Modul pro práci s cestami

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

        res.set('Content-Type', 'audio/mpeg');
        res.send(response.audioContent);

    } catch (error) {
        console.error('CHYBA BACKENDU:', error);
        res.status(500).send({ error: error.message });
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

app.listen(port, () => {
    console.log(`Backend server běží na http://localhost:${port}`);
});

//node server/index.js