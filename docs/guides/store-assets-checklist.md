# 📸 Store Assets Checklist - Google Play Store

Checklist completa di tutti gli asset richiesti per pubblicazione su Google Play Store.

---

## 🎨 Assets Obbligatori

### 1. App Icon

**Requisiti**:
- **Dimensione**: 512x512 px
- **Formato**: PNG (32-bit)
- **Trasparenza**: Permessa (ma sconsigliata)
- **File attuale**: `assets/icons/app/app-icon.png`

**Linee guida design**:
- ✅ Design semplice e riconoscibile
- ✅ Buon contrasto su sfondo bianco/nero
- ✅ Evita testo troppo piccolo
- ❌ No bordi o ombre (li aggiunge Android)

**Status**: ✅ Già presente nel progetto

---

### 2. Feature Graphic

**Requisiti**:
- **Dimensione**: 1024x500 px
- **Formato**: JPEG o PNG (24-bit)
- **Peso max**: 1 MB
- **File da creare**: `assets/store/feature-graphic.png`

**Cosa includere**:
- Logo Rise Against Hunger Italia
- Tagline: "Combattiamo la fame nel mondo"
- Visual accattivante (es. mani che confezionano pasti, mappa mondiale)
- Colori brand: Rosso (#DC2626), Bianco (#FFFFFF)

**Dove appare**:
- Banner principale su Google Play Store
- Share link preview
- Google Play search results

**Status**: ❌ Da creare

**Template suggerito**:
```
┌─────────────────────────────────────────────┐
│  [Logo RAH]    COMBATTIAMO LA FAME          │
│                NEL MONDO                    │
│                                             │
│  [Visual: mani + pasti + mondo]             │
└─────────────────────────────────────────────┘
```

---

### 3. Screenshots

**Requisiti**:
- **Minimo**: 2 screenshot
- **Massimo**: 8 screenshot
- **Dimensioni**: 320-3840 px (lato più lungo)
- **Formato**: JPEG o PNG (24-bit)
- **Ratio**: 16:9 o 9:16 raccomandato

#### 3.1 Phone Screenshots (Obbligatorio)

**Da creare - Minimo 2, consigliato 5**:

1. **Home Screen** (`assets/store/screenshots/phone/01-home.png`)
   - Dashboard principale
   - Call-to-action evidenti
   - Highlight: "Unisciti alla missione"

2. **Progetti/Impatto** (`assets/store/screenshots/phone/02-impact.png`)
   - Statistiche real-time
   - Grafici impatto
   - Highlight: "Milioni di vite cambiate"

3. **Eventi** (`assets/store/screenshots/phone/03-events.png`)
   - Calendario eventi
   - Card eventi attivi
   - Highlight: "Partecipa agli eventi"

4. **Mappa Interattiva** (`assets/store/screenshots/phone/04-map.png`)
   - Mappa progetti mondiali
   - Pin location
   - Highlight: "Progetti nel mondo"

5. **Donazioni/Azioni** (`assets/store/screenshots/phone/05-actions.png`)
   - Sezione donazioni
   - Modi per contribuire
   - Highlight: "Ogni azione conta"

**Come crearli**:

```bash
# Metodo 1: Manuale con emulatore
# 1. Avvia app su emulatore Android
npm run android

# 2. Naviga alle schermate
# 3. Screenshot: Ctrl+S (Android Studio) o icona camera

# Metodo 2: Con Expo Go
# 1. Esegui app su dispositivo fisico
npm start

# 2. Scannerizza QR code
# 3. Screenshot nativi device (Volume Down + Power)
# 4. Ritaglia e ottimizza

# Metodo 3: Script automatico (avanzato)
npm run screenshot:generate
```

**Ottimizzazione screenshots**:

```bash
# Dimensioni consigliate phone
Width: 1080px (Full HD)
Height: 1920px (9:16 ratio)
DPI: 320

# Tool suggeriti:
- Figma/Sketch: Add device frames + annotations
- Photoshop: Batch resize + compress
- Online: screely.com, mockuphone.com
```

#### 3.2 Tablet Screenshots (Opzionale)

**Se supporti tablet, crea 7" e 10"**:

- **7-inch tablet**: 1920x1200 px (min)
- **10-inch tablet**: 2560x1600 px (min)

**Status attuale**: ⏭️ Skip (focus su phone first)

---

### 4. Video Promo (Opzionale - Raccomandato)

**Requisiti**:
- **Durata**: 30 secondi - 2 minuti
- **Formato**: MOV, MP4
- **Peso max**: 100 MB
- **Risoluzione**: 1920x1080 px minimum
- **Aspect ratio**: 16:9

**Contenuto suggerito**:

```
0:00-0:05 → Logo + Intro "Rise Against Hunger Italia"
0:05-0:15 → Problema: Fame nel mondo (statistiche)
0:15-0:35 → Soluzione: App features (swipe veloce schermate)
0:35-0:50 → Impatto: Numeri e risultati
0:50-1:00 → Call to action: "Scarica ora" + Logo
```

**Status**: ❌ Da creare (opzionale)

---

## 📝 Contenuti Testuali

### 5. App Name

**Requisito**: Max 30 caratteri

**Proposta**:
```
Rise Against Hunger Italia
```

**Lunghezza**: 27 caratteri ✅

---

### 6. Short Description

**Requisito**: Max 80 caratteri

**Proposta**:
```
App ufficiale RAH Italia per combattere la fame nel mondo
```

**Lunghezza**: 58 caratteri ✅

**Alternative**:
```
Unisciti alla lotta contro la fame. Dona, partecipa, cambia vite.
(65 caratteri)

Combatti la fame: eventi, donazioni, impatto reale. Unisciti a noi!
(67 caratteri)
```

---

### 7. Full Description

**Requisito**: Max 4000 caratteri

**Template** (vedi `google-play-setup.md` Step 5.1) ✅

**Lunghezza attuale**: ~1850 caratteri ✅

---

### 8. Privacy Policy URL

**Requisito**: URL pubblico valido

**Proposta**:
```
https://italy.riseagainsthunger.org/privacy
```

**Status**: ⚠️ Verifica che URL esista e sia accessibile

---

## 🎨 Design Guidelines

### Brand Colors

```css
Primary: #DC2626 (Rosso RAH)
Secondary: #FFFFFF (Bianco)
Background: #F5F5F5 (Grigio chiaro)
Text: #1F2937 (Grigio scuro)
Accent: #059669 (Verde successo)
```

### Typography

```
Heading: System Bold
Body: System Regular
Size: 16-18px body, 24-32px headings
```

### Visual Style

- ✅ Foto reali di packaging events
- ✅ Grafici e statistiche chiare
- ✅ Icone semplici e riconoscibili
- ✅ Spazio bianco generoso
- ❌ Evita stock photos generiche
- ❌ No testo troppo denso

---

## 🛠️ Tools Consigliati

### Design & Mockup

- **Figma**: Design collaborativo
  - Template: "App Store Screenshots"
  - Plugin: "Mockup" per device frames

- **Canva**: Quick & easy
  - Template: "Mobile App Screenshot"
  - Dimensioni custom: 1080x1920px

- **Sketch**: Professional design (Mac only)

### Screenshot Tools

- **Android Studio**: Built-in screenshot
- **Screener.io**: Automated app screenshots
- **Fastlane Snapshot**: Automated localized screenshots

### Image Optimization

```bash
# ImageMagick - Batch resize
convert input.png -resize 1080x1920 output.png

# OptiPNG - Compress
optipng -o7 screenshot.png

# Online: tinypng.com, squoosh.app
```

---

## ✅ Checklist Pre-Submit

Prima di submit a Google Play Store:

### Assets Grafici

- [ ] ✅ App icon 512x512px
- [ ] ❌ Feature graphic 1024x500px
- [ ] ❌ Screenshots phone (min 2, consigliato 5)
  - [ ] 01 - Home
  - [ ] 02 - Impact/Projects
  - [ ] 03 - Events
  - [ ] 04 - Map
  - [ ] 05 - Actions
- [ ] ⏭️ Screenshots tablet (opzionale)
- [ ] ⏭️ Video promo (opzionale)

### Contenuti

- [ ] ✅ App name (max 30 caratteri)
- [ ] ✅ Short description (max 80 caratteri)
- [ ] ✅ Full description (max 4000 caratteri)
- [ ] ⚠️ Privacy policy URL (verifica accessibilità)

### Configurazioni

- [ ] ❌ Category: Social
- [ ] ❌ Tags: Volontariato, Beneficenza, Nonprofit
- [ ] ❌ Content rating: Completato
- [ ] ❌ Target audience: 13+ / Everyone
- [ ] ❌ Data Safety: Compilata

---

## 📋 Template Feature Graphic

### Opzione 1: Minimalista

```
╔═════════════════════════════════════════╗
║  [Logo RAH]                             ║
║                                         ║
║  COMBATTIAMO LA FAME NEL MONDO          ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   ║
║  Ogni azione conta. Unisciti a noi.     ║
╚═════════════════════════════════════════╝
```

### Opzione 2: Visual-First

```
╔═════════════════════════════════════════╗
║   [Foto: volontari packaging pasti]     ║
║                                         ║
║   Rise Against Hunger Italia            ║
║   #FameZero                             ║
╚═════════════════════════════════════════╝
```

### Opzione 3: Stats-Focused

```
╔═════════════════════════════════════════╗
║  10M+           50K+         20+        ║
║  Pasti          Volontari    Paesi      ║
║                                         ║
║  UNISCITI ALLA MISSIONE                 ║
║  Rise Against Hunger Italia             ║
╚═════════════════════════════════════════╝
```

---

## 🎯 Priorità Azioni

### Must Have (Blocca Release)

1. ✅ App icon 512x512
2. ❌ Feature graphic 1024x500
3. ❌ Min 2 screenshots phone
4. ❌ Short description
5. ❌ Full description

### Should Have (Migliora Conversione)

6. ❌ 5 screenshots phone ottimizzati
7. ❌ Privacy policy URL verificato
8. ❌ Content rating completato

### Nice to Have (Bonus)

9. ⏭️ Video promo
10. ⏭️ Screenshots tablet
11. ⏭️ Traduzioni multiple

---

## 📚 Risorse

- [Google Play Console Asset Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Material Design Guidelines](https://material.io/design)
- [App Store Screenshot Best Practices](https://developer.android.com/distribute/best-practices/launch/store-listing)

---

## 🚀 Next Steps

1. **Ora**: Crea feature graphic (1024x500)
2. **Poi**: Genera 5 screenshots phone (1080x1920)
3. **Infine**: Ottimizza e carica su Play Console

**Tempo stimato**: 2-4 ore per asset completi

---

**Rise Against Hunger Italia** 🌍
