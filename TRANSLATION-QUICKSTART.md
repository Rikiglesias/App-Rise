# 🌍 Traduzione APP con AI - Quick Start

## 🚀 Setup (5 minuti)

### 1. Ottieni API Key OpenAI

```bash
# Vai su: https://platform.openai.com/api-keys
# Crea nuovo API key
# Copia la chiave (inizia con sk-proj-...)
```

### 2. Configura la chiave

```bash
# Windows PowerShell
$env:OPENAI_API_KEY="sk-proj-TUA-CHIAVE-QUI"

# Mac/Linux
export OPENAI_API_KEY=sk-proj-TUA-CHIAVE-QUI
```

### 3. Traduci!

```bash
# Inglese
npm run translate -- --target=en

# Inglese + Spagnolo + Francese
npm run translate -- --target=en,es,fr
```

---

## 📝 Cosa Succede

1. **Legge** `src/locales/it.ts` (il tuo master italiano)
2. **Chiama GPT-4** con contesto intelligente
3. **Genera** `src/locales/en.ts` (o es, fr, etc.)
4. **Crea report** `translation-reviews/en-review.md` per review

---

## ✅ Review Traduzioni

```bash
# Apri report
code translation-reviews/en-review.md

# Controlla traduzioni marcate "NEEDS REVIEW"
# Se OK → lascia così
# Se no → correggi in src/locales/en.ts
```

---

## 💰 Costo

**~$0.12 per lingua** (pochissimo!)

- Inglese: $0.12
- 5 lingue: $0.60
- 10 lingue: $1.20

---

## 🎯 Lingue Prioritarie

```bash
# Europa (donatori)
npm run translate -- --target=en,fr,de,es

# Globale
npm run translate -- --target=en,fr,de,es,pl,pt
```

---

## 🆘 Problemi?

### API Key non funziona

```bash
# Verifica sia impostata
echo $OPENAI_API_KEY  # Mac/Linux
echo $env:OPENAI_API_KEY  # Windows

# Se vuoto, reimpostala
```

### Rate Limit

```bash
# Aspetta 1 minuto e riprova
# Oppure rallenta requests
npm run translate -- --target=en --batch-delay=2000
```

---

## 📚 Documentazione Completa

Vedi: `docs/i18n/AI-TRANSLATION-GUIDE.md`

---

## ✨ Esempio Output

```
🌍 AI Translation Pipeline Started

✅ Loaded 120 source keys from it.ts

📝 Translating to en...
   Processing batch 1/12...
   Processing batch 2/12...
   ...
✅ en.ts generated!
   📄 Review report: translation-reviews/en-review.md

🎉 Translation complete!
```

**Fatto! Ora hai l'app in più lingue! 🎉**
