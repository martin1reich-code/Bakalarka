# Backend - Text-to-Speech API

Backend pro Text-to-Speech aplikaci postavený na Node.js, Express, TypeScript a Prisma ORM se SQLite databází.

## Struktura projektu

```
server/
├── src/
│   ├── index.ts           # Express app a API routes
│   └── db.ts              # Prisma servisní funkce
├── prisma/
│   └── schema.prisma      # Databázové schéma
├── audio/                 # Generovaný audio (auto-created)
├── package.json
├── tsconfig.json
└── .env
```

## 🚀 Instalace a nastavení

### 1. Instalace závislostí

```bash
cd server
npm install
```

### 2. Vytvoření .env souboru

Zkopíruj `.env.example` na `.env`:

```bash
cp .env.example .env
```

**Obsah `.env`:**
```
DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development
```

- `DATABASE_URL` určuje cestu k SQLite souboru
- `PORT` je port backendu (default 3000)

### 3. Inicializace databáze a migrace

```bash
# Vytvoří databázi a spustí inicializační migraci
npm run prisma:migrate
```

Příkaz:
- Vytvoří `dev.db` soubor v `server/` adresáři
- Vytvoří tabulky `UserSettings` a `TtsRecord`
- Automaticky generuje `@prisma/client` kód

**Tip:** Pokud někdy potřebuješ resetovat DB:
```bash
npm run prisma:reset
```

### 4. Spuštění backendu

**Development mód** (s hot reload):
```bash
npm run dev
```

**Production mód** (po build):
```bash
npm run build
npm start
```

Výstup by měl být:
```
Backend server běží na http://localhost:3000
```

---

## 📊 Databázové schéma

### `UserSettings` tabulka

Ukládá nastavení **jednoho uživatele** (ID=1) - obsahuje:

| Pole | Typ | Popis |
|------|-----|-------|
| `id` | Int (PK) | Vždy 1, identifikátor |
| `googleApiKey` | String? | Google API klíč |
| `microsoftApiKey` | String? | Microsoft API klíč |
| `geminiApiKey` | String? | Gemini API klíč |
| `defaultLanguage` | String | Výchozí jazyk (default: `cs-CZ`) |
| `defaultVoiceId` | String | Výchozí hlas (default: `cs-CZ-Wavenet-A`) |
| `defaultSpeed` | Float | Výchozí rychlost (default: `1.0`) |
| `defaultPitch` | Float | Výchozí výška tónu (default: `0.0`) |
| `defaultMode` | String | `'basic'`, `'manual-ssml'`, `'auto-ssml'` |
| `ttsProvider` | String | Aktuálně používaný provider (default: `google`) |
| `createdAt` | DateTime | Čas vytvoření |
| `updatedAt` | DateTime | Čas poslední úpravy |

### `TtsRecord` tabulka

Ukládá historii vygenerovaných audií:

| Pole | Typ | Popis |
|------|-----|-------|
| `id` | String (PK) | Unikátní ID (CUID) |
| `title` | String | Název nahrávky (automaticky z textu) |
| `originalText` | String | Originální vstupní text |
| `ssmlText` | String? | SSML text (pokud byl použit) |
| `language` | String | Kód jazyka `cs-CZ` |
| `voiceId` | String | Identifikátor hlasu `cs-CZ-Wavenet-A` |
| `mode` | String | `'basic'`, `'manual-ssml'`, `'auto-ssml'` |
| `speed` | Float | Rychlost řeči (0.25-4.0) |
| `pitch` | Float | Výška tónu (-20.0 to 20.0) |
| `audioFilePath` | String | Cesta k MP3 souboru |
| `duration` | Float | Délka audia v sekundách |
| `folder` | String? | Kategorie/složka |
| `rating` | Int | Hodnocení 0-5 (0 = neohodnoceno) |
| `isFavorite` | Boolean | True = v oblíbených |
| `provider` | String | TTS provider (default: `google`) |
| `createdAt` | DateTime | Čas vytvoření |
| `updatedAt` | DateTime | Čas poslední úpravy |

---

## 🔌 API Přehled

### TTS Generování

**POST** `/api/synthesize`
```json
{
  "text": "Ahoj světe",
  "language": "cs-CZ",
  "voiceId": "cs-CZ-Wavenet-A",
  "speed": 1.0,
  "pitch": 0,
  "mode": "basic",
  "folder": "greetings"
}
```
➡️ Vrátí: `{ id, title, audioPath, success }`

**GET** `/api/voices`
➡️ Vrátí list dostupných hlasů z Google API

**GET** `/api/audio/:filename`
➡️ Vrátí audio soubor (MP3)

---

### Uživatelská nastavení

**GET** `/api/user/settings`
➡️ Vrátí všechna nastavení

**PUT** `/api/user/settings`
```json
{
  "defaultLanguage": "en-US",
  "defaultSpeed": 1.2
}
```
➡️ Aktualizuje nastavení

**PUT** `/api/user/api-keys`
```json
{
  "googleApiKey": "...",
  "microsoftApiKey": "..."
}
```

**PUT** `/api/user/preferences`
```json
{
  "defaultVoiceId": "cs-CZ-Wavenet-B",
  "defaultPitch": 2.0
}
```

---

### Historii (Library)

**GET** `/api/tts/history?folder=greetings&limit=20&offset=0&sortBy=createdAt&sortOrder=desc&isFavorite=false`

Query parametry:
- `folder` (optional) - filtruj podle složky
- `isFavorite` (boolean) - pouze oblíbené
- `language` (optional) - filtruj podle jazyka
- `sortBy` - `'createdAt'`, `'title'` nebo `'rating'`
- `sortOrder` - `'asc'` nebo `'desc'`
- `limit` (default 50) - kolik záznamů
- `offset` (default 0) - stránkování

➡️ Vrátí: `{ records: [], total, limit, offset, hasMore }`

**GET** `/api/tts/record/:id`
➡️ Vrátí konkrétní záznam

**GET** `/api/tts/folders`
➡️ Vrátí seznam všech složek

**GET** `/api/tts/statistics`
➡️ Vrátí statistiky: totalRecords, favoriteCount, ratedCount, averageRating, topRatedRecords

---

### Úpravy záznamů

**PUT** `/api/tts/record/:id/rating`
```json
{
  "rating": 5
}
```

**PUT** `/api/tts/record/:id/favorite`
➡️ Toggle oblíbené (bez body)

**PUT** `/api/tts/record/:id`
```json
{
  "title": "Nový název",
  "folder": "nová-složka",
  "rating": 4
}
```

**DELETE** `/api/tts/record/:id`
➡️ Smaže záznam a audio soubor

---

## 📚 Použití v TypeScript kódu

### Import servisních funkcí

```typescript
import * as db from './db';

// Načtení nastavení
const settings = await db.getUserSettings();

// Uložení nového záznamu
const record = await db.createTtsRecord({
  title: 'Můj první zvuk',
  originalText: 'Ahoj',
  language: 'cs-CZ',
  voiceId: 'cs-CZ-Wavenet-A',
  mode: 'basic',
  speed: 1.0,
  pitch: 0,
  audioFilePath: '/path/to/audio.mp3',
  folder: 'my-folder'
});

// Načtení historie s filtrováním
const history = await db.getTtsHistory({
  folder: 'my-folder',
  isFavorite: false,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  limit: 10,
  offset: 0
});

// Aktualizace hodnocení
await db.updateTtsRating(record.id, 5);

// Toggle oblíbené
await db.toggleFavorite(record.id);

// Smazání
await db.deleteTtsRecord(record.id, true); // true = smaž i soubor
```

---

## 🔍 Prisma Studio (GUI pro databázi)

Otevření grafického rozhraní Prismy:

```bash
npm run prisma:studio
```

Pak jdi na `http://localhost:5555`

---

## 📝 Poznámky

- **Databáze:** SQLite (dev.db) - ideální pro development, v produkci zvážit PostgreSQL
- **Audio soubory:** Ukládají se do `server/audio/` adresáře (cesty se ukládají do DB)
- **Jeden uživatel:** `UserSettings` má vždy ID=1, pro multi-user aplikaci upravit schéma
- **Migrací:** Prisma automaticky vytváří migrace v `prisma/migrations/`
- **TypeScript:** Celý backend je v TypeScript, kompiluje se do `dist/`

---

## 🛠️ Troubleshooting

### Chyba: "Cannot find module 'tsx'"
```bash
npm install -g tsx
```

### Chyba: "Databáze je uzamčena"
- SQLite má problémy s konkurenčním přístupem
- Ujisti se, že server běží jen na jednom portu
- Smaž `dev.db-journal` soubor

### Chyba: "Google API klíč není iniciálem"
```bash
# Ujisti se, že google-credentials.json je v server/ adresáři
ls -la server/google-credentials.json
```

---

## 🚀 Deployment

### Build pro produkci:
```bash
npm run build
npm run prisma:migrate:deploy  # Produkční migrace
npm start
```

### Environment variables pro produkci:
```
DATABASE_URL="file:./prod.db"
# nebo pro PostgreSQL:
# DATABASE_URL="postgresql://user:password@host/db"

PORT=3000
NODE_ENV=production
```

---

© 2024 - Text-to-Speech aplikace
