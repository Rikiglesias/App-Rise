# 🌍 AI Translation System - Guida Completa

## 📋 Overview

Sistema di traduzione AI-powered che usa **GPT-4** per tradurre l'app mantenendo contesto e tono appropriati.

### ✨ Features

- **Comprensione Contestuale**: GPT-4 capisce "Dona" (button) vs "dona" (verbo)
- **Preserva Formattazione**: Line breaks `\n`, emoji 🎉, variabili `{{name}}`
- **Batch Processing**: Traduce gruppi di stringhe insieme (più efficiente)
- **Human Review**: Genera report per review manuale
- **Confidence Scoring**: Identifica automaticamente traduzioni dubbie

---

## 🚀 Quick Start

### 1. Setup API Key

```bash
# OpenAI API Key (get from https://platform.openai.com/api-keys)
export OPENAI_API_KEY=sk-proj-...

# O aggiungi a .env
echo "OPENAI_API_KEY=sk-proj-..." >> .env
```

### 2. Traduci in Una Lingua

```bash
# Inglese
npm run translate -- --target=en

# Spagnolo
npm run translate -- --target=es

# Francese
npm run translate -- --target=fr
```

### 3. Traduci Multiple Lingue

```bash
# Inglese, Spagnolo, Francese in un colpo
npm run translate -- --target=en,es,fr
```

### 4. Review Traduzioni

```bash
# Apri report generato
code translation-reviews/en-review.md

# Correggi manualmente src/locales/en.ts se necessario
```

---

## 📖 Come Funziona

### Pipeline

```
┌─────────────┐
│  it.ts      │  Italiano (source)
│  (master)   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  AI Translation Engine  │
│                         │
│  • Flatten structure    │
│  • Add context hints    │
│  • Call GPT-4 API       │
│  • Parse responses      │
│  • Calculate confidence │
└──────┬──────────────────┘
       │
       ▼
┌─────────────┐    ┌──────────────────┐
│  en.ts      │───▶│  en-review.md    │
│  (generated)│    │  (human review)  │
└─────────────┘    └──────────────────┘
```

### Context Hints

Lo script aggiunge automaticamente contesto per traduzioni migliori:

```typescript
// Esempio input per GPT-4:
{
  key: "home.ctaImpactButton",
  context: "CTA button text - keep concise, max 2 lines",
  italian: "Scopri\nImpatto",
  targetLanguage: "English"
}

// Output GPT-4 (capisce che serve concisione):
"Discover\nImpact"  ✅

// Senza contesto potrebbe tradurre:
"Discover our Impact"  ❌ (troppo lungo per button!)
```

---

## 🎛️ Configurazione Avanzata

### Custom Context Hints

Edita `scripts/ai-translate.ts`:

```typescript
contextHints: {
  // Aggiungi hint per chiavi specifiche
  'impact.communitySubtitle': 'Slogan - emotional, mission-focused, max 2 lines',
  'actions.donate': 'Button label - single word preferred',
  'common.appName': 'Brand name - DO NOT TRANSLATE',
}
```

### Cambia AI Model

```bash
# GPT-4 Turbo (più veloce, cheaper)
npm run translate -- --target=en --model=gpt-4-turbo

# GPT-4 (più accurato, più costoso)
npm run translate -- --target=en --model=gpt-4

# Claude 3 Opus (alternativa)
npm run translate -- --target=en --model=claude-3-opus
```

### Skip Human Review

```bash
# Per traduzioni automatiche senza review
npm run translate -- --target=en --no-review
```

---

## 💰 Costi Stimati

### OpenAI API Pricing (GPT-4 Turbo)

```
Il tuo file it.ts: ~120 chiavi = ~3000 tokens input

Per lingua:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Input:   3000 tokens × $0.01/1K  = $0.03
Output:  3000 tokens × $0.03/1K  = $0.09
TOTALE per lingua:                 $0.12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5 lingue (en,es,fr,de,pl):         $0.60
10 lingue complete:                $1.20

VERY AFFORDABLE! 🎉
```

### Alternative Gratuite

1. **LibreTranslate** (self-hosted, gratis ma meno accurato)
2. **Google Translate API Free Tier** (100K char/month gratis)
3. **DeepL API Free** (500K char/month)

---

## 🔍 Review Process

### 1. Confidence Scoring

Lo script calcola automaticamente confidenza:

```
✅ High (>80%):  Probabilmente OK
⚠️ Medium (50-80%): Verifica raccomandata
❌ Low (<50%):   Review obbligatoria
```

### 2. Review Checklist

Per ogni traduzione nel report:

```markdown
### 1. home.ctaImpactButton
**Confidence:** 85.0%
**Original (IT):** Scopri\nImpatto
**Translated (EN):** Discover\nImpact

**Review Points:**
☐ Line breaks preservati correttamente?
☐ Lunghezza testo OK per UI button?
☐ Tono appropriato (warm, inspiring)?
☐ Grammatica corretta?

**Action:** ☐ Approve ☐ Modify ☐ Reject
```

### 3. Modifica Manuale

Se serve correzione:

```typescript
// src/locales/en.ts
export default {
  home: {
    // ❌ AI translation
    ctaImpactButton: 'Discover\nImpact',
    
    // ✅ Correzione umana
    ctaImpactButton: 'See Our\nImpact',
  }
}
```

---

## 🛠️ Troubleshooting

### Error: API Key Not Set

```bash
❌ Error: OPENAI_API_KEY environment variable not set

# Soluzione:
export OPENAI_API_KEY=sk-proj-your-key-here
```

### Error: Rate Limit

```bash
❌ OpenAI API error: Rate limit exceeded

# Soluzione 1: Aspetta 1 minuto
# Soluzione 2: Usa --batch-delay=2000 per rallentare requests
npm run translate -- --target=en --batch-delay=2000
```

### Traduzione Non Soddisfacente

```bash
# Opzione 1: Aggiungi context hint più specifico
# Opzione 2: Usa GPT-4 invece di GPT-4-turbo
npm run translate -- --target=en --model=gpt-4

# Opzione 3: Review e correzione manuale
```

---

## 📊 Best Practices

### 1. Master File (it.ts)

```typescript
// ✅ GOOD: Chiavi descrittive
home: {
  ctaImpactButton: 'Scopri\nImpatto',  // CTA button
  heroTitle: 'Volontari uniti...',     // Hero section
}

// ❌ BAD: Chiavi generiche
home: {
  btn1: 'Scopri\nImpatto',
  text1: 'Volontari uniti...',
}
```

### 2. Commenti per Contesto

```typescript
// Aggiungi commenti nel master file
export default {
  home: {
    // CTA principale home - max 2 righe
    ctaImpactButton: 'Scopri\nImpatto',
    
    // Hero title - emotivo, mission-focused
    heroTitle: 'Volontari e partner uniti nella\nmissione #famezero',
  }
}
```

### 3. Variabili & Placeholders

```typescript
// ✅ GOOD: Usa placeholders chiari
welcome: 'Benvenuto, {{userName}}!',

// AI preserva automaticamente {{userName}}
// EN: 'Welcome, {{userName}}!'
// ES: 'Bienvenido, {{userName}}!'
```

---

## 🚦 Workflow Completo

```bash
# 1. Aggiorna master file italiano
code src/locales/it.ts

# 2. Traduci con AI
npm run translate -- --target=en,es,fr

# 3. Review automatica
code translation-reviews/en-review.md
code translation-reviews/es-review.md
code translation-reviews/fr-review.md

# 4. Correzioni manuali se necessario
code src/locales/en.ts

# 5. Test nell'app
npm run ios -- --locale=en
npm run android -- --locale=en

# 6. Commit
git add src/locales/*.ts
git commit -m "feat(i18n): Add English, Spanish, French translations"
```

---

## 🎯 Lingue Raccomandate

Per Rise Against Hunger Italia:

```
Priority 1 (European donors):
✅ en - English
✅ fr - French
✅ de - German
✅ es - Spanish

Priority 2 (Global reach):
☐ pl - Polish (partner countries)
☐ pt - Portuguese (Brazil)
☐ nl - Dutch

Priority 3 (Future):
☐ sw - Swahili (beneficiary countries)
☐ ar - Arabic (Middle East operations)
```

---

## 📚 Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [i18n Best Practices](https://www.w3.org/International/questions/qa-i18n)
- [React Native i18n](https://react.i18next.com/)

---

## 🆘 Support

Problemi? Contatta il team dev o apri issue su GitHub.
