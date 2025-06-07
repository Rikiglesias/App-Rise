# 🚀 Migrazione a React Native CLI per Publishing

## Perché Migrare da Expo Managed?

### ❌ Expo Managed Svantaggi

- **Costi**: $29-99/mese per EAS Build
- **Limitazioni**: Non puoi aggiungere dipendenze native custom
- **Dipendenza**: Legato ai server Expo
- **Controllo**: Meno flessibilità su configurazioni native

### ✅ React Native CLI Vantaggi

- **Gratuito**: Solo costi store ($99 iOS + $25 Android)
- **Controllo totale**: Accesso completo al codice native
- **Flessibilità**: Aggiungi qualsiasi libreria native
- **Performance**: Build ottimizzate
- **Indipendenza**: Nessuna dipendenza da servizi terzi

## 🛠️ Processo di Migrazione

### Step 1: Eject da Expo

```bash
# Genera il codice native (Android/iOS)
npx expo run:ios
npx expo run:android
```

### Step 2: Setup Fastlane

```bash
# Installa Fastlane
gem install fastlane

# Setup per iOS
cd ios && fastlane init

# Setup per Android  
cd android && fastlane init
```

### Step 3: Configurazione Fastlane iOS

```ruby
# ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Build and upload to App Store"
  lane :release do
    # Increment build number
    increment_build_number(xcodeproj: "RiseAgainstHungerItalia.xcodeproj")
    
    # Build app
    build_app(
      workspace: "RiseAgainstHungerItalia.xcworkspace",
      scheme: "RiseAgainstHungerItalia",
      export_method: "app-store"
    )
    
    # Upload to App Store Connect
    upload_to_app_store(
      skip_waiting_for_build_processing: true,
      skip_screenshots: true
    )
    
    # Send notification
    slack(
      message: "🍎 iOS build uploaded to App Store Connect!",
      channel: "#development"
    )
  end
  
  desc "Build for TestFlight"
  lane :beta do
    build_app(
      workspace: "RiseAgainstHungerItalia.xcworkspace", 
      scheme: "RiseAgainstHungerItalia"
    )
    upload_to_testflight
  end
end
```

### Step 4: Configurazione Fastlane Android

```ruby
# android/fastlane/Fastfile
default_platform(:android)

platform :android do
  desc "Build and upload to Play Store"
  lane :release do
    # Increment version code
    increment_version_code(
      gradle_file_path: "app/build.gradle"
    )
    
    # Build AAB
    gradle(
      task: "bundle",
      build_type: "release"
    )
    
    # Upload to Play Store
    upload_to_play_store(
      track: "production",
      aab: "app/build/outputs/bundle/release/app-release.aab"
    )
    
    # Send notification
    slack(
      message: "🤖 Android build uploaded to Play Store!",
      channel: "#development"
    )
  end
  
  desc "Build for internal testing"
  lane :internal do
    gradle(task: "bundle", build_type: "release")
    upload_to_play_store(
      track: "internal",
      aab: "app/build/outputs/bundle/release/app-release.aab"
    )
  end
end
```

## 🔧 Automazione con GitHub Actions

### Workflow iOS

```yaml
# .github/workflows/ios-release.yml
name: iOS Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: macos-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Setup Ruby
      uses: ruby/setup-ruby@v1
      with:
        ruby-version: 3.0
        
    - name: Install Fastlane
      run: gem install fastlane
      
    - name: Build and upload to App Store
      run: |
        cd ios
        fastlane release
      env:
        APP_STORE_CONNECT_API_KEY: ${{ secrets.APP_STORE_CONNECT_API_KEY }}
```

### Workflow Android

```yaml
# .github/workflows/android-release.yml
name: Android Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '11'
        
    - name: Install dependencies
      run: npm install
      
    - name: Setup Ruby
      uses: ruby/setup-ruby@v1
      with:
        ruby-version: 3.0
        
    - name: Build and upload to Play Store
      run: |
        cd android
        fastlane release
      env:
        GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}
```

## 📱 Comandi Semplificati

### Development (mantieni Expo)

```bash
# Per development usa sempre Expo
npm start  # o npx expo start
```

### Production Builds

```bash
# iOS App Store
cd ios && fastlane release

# Android Play Store  
cd android && fastlane release

# TestFlight Beta
cd ios && fastlane beta

# Play Store Internal Testing
cd android && fastlane internal
```

## 💰 Confronto Costi

### Expo EAS (Annuale)

- **Team Plan**: $348/anno
- **Production Plan**: $1188/anno  
- **Store Fees**: $124/anno
- **TOTALE**: $472-1312/anno

### React Native CLI + Fastlane

- **Fastlane**: **GRATUITO**
- **GitHub Actions**: **GRATUITO** (2000 min/mese)
- **Store Fees**: $124/anno
- **TOTALE**: **$124/anno**

## 🚀 Vantaggi per Rise Against Hunger

1. **Risparmio**: ~$350-1200/anno
2. **Controllo**: Accesso completo al codice
3. **Flessibilità**: Aggiungi qualsiasi feature nativa
4. **Indipendenza**: Nessuna dipendenza da Expo
5. **Performance**: Build ottimizzate
6. **Professionalità**: Setup standard industry

## ⚠️ Considerazioni

### Pro

- ✅ Risparmio significativo per no-profit
- ✅ Controllo completo
- ✅ Setup professionale
- ✅ Nessun vendor lock-in

### Contro

- ⚠️ Setup iniziale più complesso
- ⚠️ Richiede più conoscenza native
- ⚠️ Manutenzione dipendenze native

## 🎯 Raccomandazione

**Per Rise Against Hunger Italia**: Migra a React Native CLI + Fastlane

**Perché?**

- Budget limitato da no-profit
- Controllo necessario per growth futuro
- Setup una tantum vs costi ricorrenti
- Standard professionale per team development
