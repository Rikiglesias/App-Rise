# 🎨 Guida Generazione Icone iOS - Rise Against Hunger Italia

## 🚨 **PROBLEMA RISOLTO: Icona Diversa iOS Search Bar**

### **📱 Problema**

L'icona appare diversa nella barra di ricerca iOS perché iOS richiede formati specifici che non stiamo fornendo.

### **✅ Soluzione**

Generare icone iOS specifiche con le dimensioni corrette.

---

## 📐 **Requisiti Icone iOS**

### **🍎 App Store Connect**

- **File**: `ios-icon-1024.png`
- **Dimensioni**: 1024x1024px
- **Formato**: PNG (24-bit, senza trasparenza)
- **Uso**: App Store listing + generazione automatica tutte le dimensioni

### **📱 Device Sizes (Generate automaticamente da 1024px)**

- **iPhone**: 180x180, 120x120, 87x87, 80x80, 60x60, 58x58, 40x40, 29x29, 20x20px
- **iPad**: 152x152, 76x76px
- **Spotlight**: 120x120, 80x80px (quello della barra di ricerca!)

---

## 🛠️ **Strumenti Raccomandati**

### **1. 🌐 Online (Gratis)**

- **App Icon Generator**: [appicon.co](https://appicon.co)
- **Icon Kitchen**: [icon.kitchen](https://icon.kitchen)
- **MakeAppIcon**: [makeappicon.com](https://makeappicon.com)

### **2. 🎨 Design Tools**

- **Figma**: Template icon iOS
- **Sketch**: iOS App Icon template
- **Photoshop**: Action per batch export

### **3. 📱 App (Mac)**

- **Icon Set Creator**: App Store
- **Asset Catalog Creator**: Free su Mac App Store

---

## 🚀 **Processo Step-by-Step**

### **Step 1: Prepara Design Base**

```text
Dimensioni: 1024x1024px
Formato: PNG, 24-bit
Background: Opaco (no trasparenza)
Angoli: NON arrotondati (iOS lo fa automaticamente)
Margini: 10% di padding interno per evitare clip
```

### **Step 2: Genera Tutte le Dimensioni**

```bash
# Usa uno strumento online o crea manualmente:

# iPhone Sizes
- icon-20@1x.png (20x20)
- icon-20@2x.png (40x40)
- icon-20@3x.png (60x60)
- icon-29@1x.png (29x29)
- icon-29@2x.png (58x58)
- icon-29@3x.png (87x87)
- icon-40@2x.png (80x80)
- icon-40@3x.png (120x120)
- icon-60@2x.png (120x120)
- icon-60@3x.png (180x180)

# iPad Sizes
- icon-76@1x.png (76x76)
- icon-76@2x.png (152x152)

# App Store
- icon-1024@1x.png (1024x1024)
```

### **Step 3: Struttura File**

```text
assets/
├── icons/
│   ├── app/
│   │   ├── ios-icon-1024.png      # 🍎 iOS App Store (1024x1024)
│   │   ├── logo.png               # 🤖 Android/Generic (attuale)
│   │   ├── adaptive-icon.png      # 🤖 Android Adaptive
│   │   └── favicon.png            # 🌐 Web
│   └── ios/                       # 📱 Set completo iOS (opzionale)
│       ├── icon-20@1x.png
│       ├── icon-20@2x.png
│       └── ...
```

---

## ⚡ **Fix Rapido (Raccomandato)**

### **Opzione A: Tool Online (5 minuti)**

1. 🌐 Vai su [appicon.co](https://appicon.co)
2. 📤 Upload il logo attuale (`assets/icons/app/logo.png`)
3. 📐 Imposta 1024x1024px con padding
4. ⬇️ Download il file iOS 1024x1024
5. 📁 Salva come `assets/icons/app/ios-icon-1024.png`

### **Opzione B: Figma Template (10 minuti)**

1. 🎨 Apri [Figma iOS Icon Template](https://www.figma.com/community/file/857303226040871623)
2. 🔄 Importa il tuo logo
3. 📐 Adatta alla griglia 1024x1024
4. 📤 Export come PNG 1024x1024
5. 📁 Salva come `ios-icon-1024.png`

---

## 🔧 **Configurazione Expo**

### **app.config.js - Aggiornato**

```javascript
{
  icon: './assets/icons/app/logo.png', // Android/Web fallback
  ios: {
    icon: './assets/icons/app/ios-icon-1024.png', // 🍎 iOS specifico
    // ...
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/icons/app/logo.png', // 🤖 Android
      backgroundColor: '#FFFFFF',
    }
  }
}
```

---

## ✅ **Test della Correzione**

### **1. 📱 Test Locale**

```bash
# Build preview per test
npx eas build --platform ios --profile preview

# Installa su device e verifica:
# - Icona home screen
# - Icona Spotlight search
# - Icona Settings
```

### **2. 🏪 Test App Store Connect**

```bash
# Build production
npx eas build --platform ios --profile production-store

# Verifica in App Store Connect:
# - Icon preview corretto
# - Tutte le dimensioni generate
```

---

## 🎨 **Design Guidelines iOS**

### **📐 Proporzioni**

- **Contenuto visibile**: 80% dell'icona
- **Padding**: 10% su ogni lato
- **Background**: Sempre opaco

### **🎨 Stile**

- **Angoli**: iOS aggiunge automaticamente corner radius
- **Shadow**: iOS aggiunge automaticamente
- **Background**: Colore solido, no gradienti complessi

### **✅ Do's**

- ✅ Design semplice e riconoscibile
- ✅ Colori contrastanti
- ✅ Forma geometrica chiara
- ✅ Test su sfondo scuro/chiaro

### **❌ Don'ts**

- ❌ Testo troppo piccolo
- ❌ Dettagli troppo fini
- ❌ Trasparenza
- ❌ Angoli pre-arrotondati

---

## 🚀 **Risultato Atteso**

### **Prima (Problema)**

```text
🔍 iOS Search: Icona pixelata/diversa
📱 Home Screen: Icona low-res
🏪 App Store: Icona non ottimale
```

### **Dopo (Risolto)**

```text
🔍 iOS Search: Icona sharp e consistente ✅
📱 Home Screen: Icona alta qualità ✅
🏪 App Store: Icona professionale ✅
```

---

## 🛟 **Troubleshooting**

### **❌ Icona ancora pixelata**

```text
Causa: File 1024x1024 non trovato
Fix: Verifica path in app.config.js
```

### **❌ Build fallisce**

```text
Causa: File PNG corrotto
Fix: Re-export da design tool
```

### **❌ Icona troppo piccola su device**

```text
Causa: Padding eccessivo nel design
Fix: Riduci padding al 5-8%
```

---

## 📞 **Tool Support**

- **Figma Community**: Template gratuiti iOS icons
- **Apple HIG**: [developer.apple.com/design/human-interface-guidelines/app-icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- **Icon Generator**: [appicon.co](https://appicon.co)

---

**🎯 Obiettivo**: Icona iOS perfetta in **10 minuti di lavoro**!
