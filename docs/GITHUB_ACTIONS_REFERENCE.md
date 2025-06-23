# 🚀 GitHub Actions - Riferimento Rapido

Sistema di build automatiche attivato il 24/06/2025 - **FUNZIONANTE E SICURO**

## 📋 COMANDI PRINCIPALI

### ❌ SVILUPPO NORMALE (ZERO BUILD)

```bash
# Push standard - NESSUNA build consumata
git commit -m "feat: nuova funzione"
git commit -m "fix: corretto bug layout"
git commit -m "refactor: cleanup codice"
git commit -m "docs: aggiornato README"
git push  # ← 0 build utilizzate
```

### ✅ BUILD AUTOMATICHE (QUANDO SERVE)

```bash
# Build per TUTTE le piattaforme (Android + iOS)
git commit -m "release: versione 1.2.1 [build]"
git commit -m "deploy: production ready [build all]"
git commit -m "build: final version for stores"

# Build SOLO per Android (1 build)
git commit -m "fix: crash Android risolto [build android]"
git commit -m "hotfix: problema specifico Android [build android]"

# Build SOLO per iOS (1 build)
git commit -m "feat: nuovo design iOS [build ios]"
git commit -m "deploy: iOS app store [build ios]"

git push  # ← Build automatica parte
```

## 🎯 PAROLE CHIAVE TRIGGER

| Parola Chiave     | Effetto       | Build Consumate |
| ----------------- | ------------- | --------------- |
| `[build]`         | Android + iOS | 2               |
| `[build all]`     | Android + iOS | 2               |
| `build:` (inizio) | Android + iOS | 2               |
| `[build android]` | Solo Android  | 1               |
| `[build ios]`     | Solo iOS      | 1               |

## 🔍 VERIFICA SISTEMA

### Controllo GitHub Actions

```bash
# URL per verificare workflow
https://github.com/Rikiglesias/App-Rise/actions
```

### Controllo Secret Configurato

```bash
# Repository → Settings → Secrets and variables → Actions
# Deve essere presente: EXPO_TOKEN
```

### Test Sintassi Workflow

```bash
# Verifica file workflow
cat .github/workflows/conditional-build.yml
```

## 💰 STRATEGIA OTTIMALE - CONSERVA LE 30 BUILD

### 🔄 Sviluppo Quotidiano (0 build)

```bash
git commit -m "wip: sviluppo in corso"
git commit -m "feat: aggiunta funzione X"
git commit -m "fix: corretto styling"
git commit -m "test: aggiunti test unitari"
git push  # ← Sync codice, zero build
```

### 🎯 Test/Debug (0 build - usa locale)

```bash
# Per test durante sviluppo
npm run build:android  # ← Build locale, zero build remote
expo build:android     # ← Build locale, zero build remote
```

### 🚀 Release Production (1-2 build)

```bash
# Solo quando DAVVERO pronto per deploy
git commit -m "release: v1.2.1 ready for production [build android]"
git commit -m "deploy: iOS v1.2.1 to App Store [build ios]"
git push  # ← Build automatica per deployment
```

### 🆘 Emergency Hotfix (1 build)

```bash
# Solo per fix critici urgenti
git commit -m "hotfix: crash critico risolto [build android]"
git push  # ← Build immediata per emergency
```

## 📊 MONITORAGGIO BUILD

### Controlla Build su EAS

```bash
# Dashboard Expo per monitorare build
https://expo.dev/accounts/[username]/projects/rise-against-hunger-italia/builds
```

### Feedback GitHub

- ✅ **Commento automatico** su commit quando build parte
- ✅ **Status verde/rosso** nella history commits
- ✅ **Log completi** nella sezione Actions

## 🔧 TROUBLESHOOTING

### Build Non Parte

```bash
# 1. Verifica parola chiave nel commit message
git log --oneline -1  # Controlla ultimo commit

# 2. Verifica workflow su GitHub
https://github.com/Rikiglesias/App-Rise/actions

# 3. Verifica secret
# Repository → Settings → Secrets → EXPO_TOKEN deve esistere
```

### Errore di Build

```bash
# 1. Controlla log su GitHub Actions
# 2. Verifica EAS Dashboard
# 3. Controlla qualità locale prima del commit
npm run post-modifiche  # Deve essere tutto pulito
```

## 🎉 VANTAGGI SISTEMA

✅ **Zero sprechi**: Build solo quando dici tu  
✅ **Controllo totale**: Nessuna build accidentale  
✅ **Integrato**: Funziona con il tuo sistema qualità  
✅ **Automatico**: Una volta pushato, build parte da sola  
✅ **Sicuro**: Token protetto nei GitHub Secrets  
✅ **Tracciabile**: Log completi di ogni build

## 📝 ESEMPI PRATICI

### Settimana di Sviluppo Normale

```bash
# Lunedì - Nuova feature
git commit -m "feat: aggiunta login utenti"
git push  # 0 build

# Martedì - Bug fix
git commit -m "fix: corretto problema validazione"
git push  # 0 build

# Mercoledì - Refactoring
git commit -m "refactor: migliorata struttura componenti"
git push  # 0 build

# Giovedì - Test
git commit -m "test: aggiunti test per login"
git push  # 0 build

# Venerdì - Release pronta
git commit -m "release: v1.3.0 ready [build android]"
git push  # 1 build utilizzata per deployment
```

**Risultato**: 1 sola build utilizzata per l'intera settimana di sviluppo!

---

**💡 Ricorda**: Questo sistema ti fa risparmiare build preziose mantenendo l'automazione quando serve!
