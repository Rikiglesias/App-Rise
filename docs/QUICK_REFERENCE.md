# 🚀 QUICK REFERENCE - RISE AGAINST HUNGER ITALIA

## 🚨 COMANDI CRITICI QUOTIDIANI

```bash
# 🔍 VERIFICA PROBLEMI
npm run conta-problemi

# 🔧 WORKFLOW SVILUPPO
npm run pre-modifiche    # Prima di iniziare
npm run post-modifiche   # Prima del commit

# 💾 COMMIT SICURO
git add .
git commit -m "feat: Descrizione"  # Solo se ZERO problemi
```

---

## 🚀 DEPLOY EAS - COMANDI RAPIDI

```bash
# 📱 BUILD TESTING
eas build --profile preview --platform all

# 🏪 BUILD PRODUCTION
eas build --profile production --platform all

# 📤 SUBMIT STORES
eas submit --platform all --profile production

# ⚡ HOTFIX OTA
eas update --branch production --message "Fix: Descrizione"
```

---

## 🔍 TROUBLESHOOTING VELOCE

```bash
# 📊 STATUS PROGETTO
eas whoami              # Account loggato
eas project:info        # Info progetto
git status             # Status git

# 🐛 DEBUG BUILD
eas build:list         # Lista build recenti
eas config            # Configurazione attuale

# 🔧 RESET CERTIFICATI
eas credentials --platform ios --clear
```

---

## 📊 SITUAZIONE ATTUALE

- **Problemi**: 172 totali (170 TS + 1 ESLint + 1 Jest)
- **Account EAS**: rikiglesias ✅
- **Commit**: ac7d1db (stato pulito)
- **Next**: Correggere errori TypeScript

---

## 🎯 PRIORITÀ IMMEDIATE

1. **Correggi errori TypeScript** in VS Code Problems tab
2. **Verifica**: `npm run conta-problemi` → ZERO
3. **Test build**: `eas build --profile preview --platform ios`
4. **Deploy**: Quando tutto funziona

---

## �� SISTEMA RESPONSIVE SEMPLIFICATO

### FormattedText - Best Practices Aligned

```tsx
// ✅ CASO 1: Flusso naturale (90% dei casi)
<FormattedText variant="body-large">
  Testo che fluisce naturalmente
</FormattedText>

// ✅ CASO 2: Controllo preciso layout
<FormattedText fontSize={35} fixedLines={2}>
  Rise Against{'\n'}Hunger Italia
</FormattedText>

// ✅ CASO 3: Solo variant
<FormattedText variant="headline-large">
  Titolo Importante
</FormattedText>
```

### Sistema a 2 Livelli

**1️⃣ SCALING RESPONSIVE (sempre attivo)**
- `fontSize={40}` → Scala automaticamente
- iPhone SE: 36px | iPhone 15: 40px | iPad: 52px

**2️⃣ FIXED LINES (opzionale)**
- `fixedLines={2}` → Garantisce 2 righe esatte
- Se non ci sta → riduce font proporzionalmente

### Typography Variants

```tsx
// Display
display-large    → 57px base
display-medium   → 45px base  
display-small    → 32px base

// Headlines
headline-large   → 30px base
headline-medium  → 28px base
headline-small   → 24px base

// Titles
title-large      → 22px base
title-medium     → 16px base
title-small      → 14px base

// Body
body-large       → 16px base
body-medium      → 15px base
body-small       → 12px base

// Labels
label-large      → 14px base
label-medium     → 12px base
label-small      → 11px base
```

## 🎨 ESEMPI PRATICI

### Titolo Hero
```tsx
<FormattedText 
  fontSize={60}
  fixedLines={2}
  fontWeight="bold"
>
  Rise Against{'\n'}Hunger Italia
</FormattedText>
```

### Card Description
```tsx
<FormattedText 
  variant="body-medium"
  fixedLines={3}
>
  {description}
</FormattedText>
```

### CTA Button
```tsx
<FormattedText 
  variant="title-medium"
  fixedLines={1}
  fontWeight="semibold"
>
  Dona Ora
</FormattedText>
```

## ⚡ COMANDI RAPIDI

### Sviluppo
```bash
npm start              # Avvia Expo
npm run pre-modifiche  # Check qualità pre-commit
npm run post-modifiche # Check qualità post-modifiche
```

### Test
```bash
npm test              # Tutti i test
npm test -- --watch   # Test in watch mode
npm run test:coverage # Coverage report
```

### Build
```bash
# Commit normale (0 build)
git commit -m "feat: nuova funzione"

# Trigger build automatiche
git commit -m "release: v1.0.0 [build]"        # Android + iOS
git commit -m "fix: hotfix [build android]"    # Solo Android
git commit -m "update: iOS [build ios]"        # Solo iOS
```

## 🔗 LINK UFFICIALI APP

- **Progetti**: https://riseagainsthunger.org.welfare4charity.com/org/projects
- **Shop**: https://riseagainsthunger.org.welfare4charity.com/charity/ecommerce
- **Gift Cards**: https://riseagainsthunger.org.welfare4charity.com/charity/giftcards
- **Eventi**: https://riseagainsthunger.org.welfare4charity.com/organization/events
- **Tracciabilità**: https://italy.riseagainsthunger.org/chi-siamo/tracciabilita/

## 📋 CHECKLIST VELOCE

```tsx
// ❌ EVITARE
<FormattedText fontSize={scaleFont(35)}>  // Doppio scaling!

// ✅ CORRETTO  
<FormattedText fontSize={35}>             // Scaling automatico

// ✅ BEST PRACTICE
<FormattedText 
  variant="headline-large"    // Design system
  fixedLines={2}             // Solo se serve controllo
>
  Titolo{'\n'}Importante
</FormattedText>
```

## 🎯 REGOLE D'ORO

1. **fontSize** = sempre valore RAW (es. 35)
2. **scaleFont()** = applicato automaticamente
3. **fixedLines** = solo quando serve controllo preciso
4. **variant** = preferire per consistenza design
5. **\n manuale** = controllo a capo quando necessario

---

**v2.0 - Sistema Semplificato Best Practices Aligned** 🚀
