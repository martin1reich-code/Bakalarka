# 🚀 QUICK START GUIDE - Instalace Databáze

Zde jsou všechny příkazy, které potřebuješ k nainstalování a spuštění backendu s Prisma ORM a SQLite.

---

## ✅ Krok 1: Instalace závislostí

```bash
cd server
npm install
```

**Co se nainstaluje:**
- `express` - webový framework
- `@google-cloud/text-to-speech` - Google TTS API
- `@prisma/client` - Prisma ORM runtime
- `prisma` - Prisma CLI (dev)
- `typescript`, `tsx` - TypeScript support

---

## ✅ Krok 2: Vytvoření .env souboru

```bash
# Zkopíruj .env.example na .env
cp .env.example .env
```

**Obsah `.env` (již je nastaven):**
```
DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development
```

---

## ✅ Krok 3: Inicializace databáze

```bash
# Vytvoří databázi (dev.db) a spustí migraci
npm run prisma:migrate
```

**Co se stane:**
1. Vytvoří se `dev.db` soubor v `server/` adresáři
2. Vytvoří se tabulky `UserSettings` a `TtsRecord`
3. Vytvoří se složka `prisma/migrations/` s SQL migracemi

**Příkaz pytá:** "Co chceš pojmenovat migraci?" → Odpověz např. `init`

---

## ✅ Krok 4: Spuštění backendu (Development)

```bash
npm run dev
```

**Výstup by měl být:**
```
Backend server běží na http://localhost:3000
```

**Hot reload:** Automaticky se restartuje když změníš soubory v `src/`

---

## 📊 Kontrola databáze (Interaktivní GUI)

```bash
npm run prisma:studio
```

Pak otevři: `http://localhost:5555`

Tady vidíš:
- `UserSettings` tabulku (jedna řádka s nastavením)
- `TtsRecord` tabulku (všechny vygenerované audio)
- Můžeš ručně editovat, smazat, přidávat záznamy

---

## 📋 Další užitečné příkazy

```bash
# Build pro produkci
npm run build

# Spustit produkční verzi
npm start

# Reset databáze (smaže všechna data!)
npm run prisma:reset

# Příslušné novo migraci (bez spuštění)
npm run prisma:migrate

# Aplikuj migraci (pro produkci)
npm run prisma:migrate:deploy

# Vygeneruj @prisma/client (automaticky)
npm run prisma:generate
```

---

## 🟢 Verifikace instalace

Zkus tyto příkazy:

### 1️⃣ Existuje databáze?
```bash
ls -la server/dev.db
```

### 2️⃣ Backend běží?
```bash
curl http://localhost:3000/api/voices
```

Měl by vrátit JSON s hlasy z Google API

### 3️⃣ Existují tabulky?
```bash
npm run prisma:studio
# a podívej se na tabulky
```

---

## 🔗 Jak se volá API z frontendu

```typescript
// V frontend/src/services/api.ts (již existuje)

// Příklad: Generuj audio
const result = await generateAudio({
  text: "Ahoj světe",
  language: "cs-CZ",
  voiceId: "cs-CZ-Wavenet-A",
  speed: 1.0,
  pitch: 0,
  mode: "basic"
});

// Příklad: Načti historii
const history = await fetchTtsHistory({
  sortBy: 'createdAt',
  limit: 20,
  offset: 0
});
```

Viz `frontend/src/services/api.ts` pro více příkladů
(Viz také `FRONTEND_API_EXAMPLES.ts` v root)

---

## 📁 Struktura po instalaci

```
server/
├── src/
│   ├── index.ts              ✅ Express app
│   └── db.ts                 ✅ Prisma funkce
├── prisma/
│   ├── schema.prisma         ✅ Databázové schéma
│   └── migrations/           ✅ SQL migrace (auto-generated)
├── audio/                    ✅ Složka pro audio (auto-created)
├── dev.db                    ✅ SQLite databáze (auto-created)
├── dist/                     ✅ Compiled JS (po npm run build)
├── node_modules/             ✅ Dependencies
├── package.json              ✅ Dependencies
├── tsconfig.json             ✅ TypeScript config
└── .env                      ✅ Environment variables
```

---

## 🐛 Troubleshooting

### ❌ Chyba: "Cannot find module '@prisma/client'"
```bash
npm run prisma:generate
```

### ❌ Chyba: "ENOENT: no such file or directory, open 'dev.db'"
```bash
npm run prisma:migrate
```

### ❌ Chyba: "Cannot find module 'tsx'"
```bash
npm install -g tsx
# nebo
npm install tsx
```

### ❌ Chyba: "SQLITE_CANTOPEN"
- Ujisti se, že `DATABASE_URL="file:./dev.db"` je správně v `.env`
- Zkus: `rm server/dev.db && npm run prisma:migrate`

### ❌ Databáze je "uzamčena"
```bash
# SQLite někdy zanechá zámek
cd server
rm dev.db-journal
```

---

## 📚 Dokumentace

- **Backend README:** `server/README.md`
- **API Reference:** `server/README.md` (API Přehled)
- **Frontend API Service:** `frontend/src/services/api.ts`
- **Prisma Docs:** https://www.prisma.io/docs/

---

## ✨ Co máš hotovo?

✅ **Databáze schéma** - `schema.prisma` s taženkami UserSettings a TtsRecord
✅ **ORM funkce** - `db.ts` se všema CRUD operacema
✅ **Express API** - `index.ts` s kompletníma endpoints
✅ **Frontend API servis** - `services/api.ts` pro volání z Vue
✅ **Dokumentace** - README.md s všema info

---

## 🎯 Další kroky

1. **Test v Postman/Insomnia:**
   - POST http://localhost:3000/api/synthesize
   - GET http://localhost:3000/api/user/settings

2. **Frontend integrace:**
   - Importuj funkce z `frontend/src/services/api.ts`
   - Volej v Vue componenty

3. **Produkce:**
   ```bash
   npm run build
   npm start
   ```

---

Všechno hotovo! 🎉 Teď můžeš generovat audio a ukládat do databáze!
