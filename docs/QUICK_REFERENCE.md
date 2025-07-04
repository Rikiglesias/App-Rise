# ⚡ QUICK REFERENCE - COMANDI ESSENZIALI

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

## 📱 SISTEMA RESPONSIVE BI-DIREZIONALE UNIVERSALE

SISTEMA RESPONSIVE BI-DIREZIONALE UNIVERSALE implementato nel progetto Rise Against Hunger Italia - sistema cross-platform che funziona IDENTICAMENTE su iOS e Android.

ARCHITETTURA SEMPLIFICATA:
- Calcolo basato ESCLUSIVAMENTE su width dispositivo 
- Zero differenze iOS/Android - stesso device = stesso risultato
- Dynamic Type iOS disabilitato per garantire consistenza

BREAKPOINTS UNIVERSALI (basati su width):
- ≤375px: scale 0.9 (iPhone SE, piccoli Android)
- ≤414px: scale 1.0 (iPhone standard, Android standard)  
- ≤480px: scale 1.15 (iPhone Plus, grandi Android)
- ≤600px: scale 1.25 (Fold, mini tablet)
- >600px: scale 1.3 (iPad, tablet)

FORMULA SCALING SEMPLIFICATA: finalSize = baseSize * scaleBasedOnWidth

UTILIZZO: fontSize: scaleFont(valore) - funziona identicamente ovunque
ESEMPIO: scaleFont(60) → iPhone SE: 54px, iPhone 15: 60px, iPad: 78px

SISTEMA TEXT WRAPPING INTELLIGENTE:
- wrapMode="fixed": Numero righe FISSO su tutti i dispositivi
- wrapMode="auto": Wrapping automatico bilanciato
- wrapMode="strict": Controllo rigido lunghezza righe
- wrapMode="flexible": Adattamento flessibile
- wrapMode="none": Nessun wrapping

ESEMPIO RIGHE FISSE:
```jsx
<FormattedText 
  wrapMode="fixed" 
  fixedLines={2}
  variant="headline-large"
>
  Titolo sempre su 2 righe esatte
</FormattedText>
```

INTELLIGENZA NETFLIX UX:
- Lunghezza ottimale: 45-65 caratteri per riga
- Bilanciamento automatico righe per leggibilità
- Calcolo larghezza container ottimale
- Suggerimenti numero righe intelligenti

VANTAGGI CROSS-PLATFORM:
- Comportamento IDENTICO iOS e Android per stessa larghezza
- Prevedibile: stessa width = stesso fontSize garantito
- Layout consistente: stesso numero righe su tutti i device
- Automatico: un parametro funziona su tutti i dispositivi
- Performance ottimizzata: calcolo diretto senza breakpoint complessi
- Zero bug platform-specific: risolve inconsistenze iOS/Android

FIX IMPLEMENTATI:
- Dynamic Type iOS disabilitato (textScaling: false, allowFontScaling: false)
- Sistema breakpoint semplificato per eliminare differenze di detection
- Cross-platform consistency garantita nel core scaleFont()
- Text wrapping intelligente con algoritmi Netflix UX

FILES CORE: 
- src/shared/constants/responsiveSystem.ts (sistema responsive)
- src/shared/hooks/useResponsive.ts (hook responsive)
- src/components/ui/FormattedText.tsx (text wrapping)
- docs/SISTEMA_RESPONSIVE_REFERENCE.md (documentazione completa)

UTILIZZO: 
- Font scaling: scaleFont() ovunque per scaling automatico
- Text wrapping: FormattedText con wrapMode per layout consistente
- Container: scaleSize() e scaleSpacing() per dimensioni responsive
