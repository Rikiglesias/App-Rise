# 🆓 Setup GitHub Actions per Publishing GRATUITO

## Vantaggi GitHub Actions

- ✅ **100% Gratuito** (2000 min/mese gratis)
- ✅ **Automazione completa**
- ✅ **Build su push/tag**
- ✅ **Integrazione Git nativa**
- ✅ **Secrets management**

## 🔧 Setup Completo

### 1. Configurazione Secrets

In GitHub Repository Settings → Secrets:

```bash
# iOS Secrets
APP_STORE_CONNECT_API_KEY
APP_STORE_CONNECT_API_KEY_ID
APP_STORE_CONNECT_ISSUER_ID
MATCH_PASSWORD

# Android Secrets
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON
ANDROID_KEYSTORE_FILE
ANDROID_KEYSTORE_PASSWORD
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD
```

### 2. Workflow iOS Avanzato

```yaml
# .github/workflows/ios-deploy.yml
name: iOS Build and Deploy

on:
  push:
    branches: [main]
    tags: ['v*']
  workflow_dispatch:

jobs:
  build-ios:
    runs-on: macos-13

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Cache Pods
        uses: actions/cache@v3
        with:
          path: ios/Pods
          key: ${{ runner.os }}-pods-${{ hashFiles('ios/Podfile.lock') }}

      - name: Install Pods
        run: |
          cd ios
          pod install

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.1'
          bundler-cache: true
          working-directory: ios

      - name: Create App Store Connect API Key
        run: |
          mkdir -p ~/.appstoreconnect/private_keys
          echo "${{ secrets.APP_STORE_CONNECT_API_KEY }}" | base64 --decode > ~/.appstoreconnect/private_keys/AuthKey_${{ secrets.APP_STORE_CONNECT_API_KEY_ID }}.p8

      - name: Build and Upload to App Store
        run: |
          cd ios
          bundle exec fastlane release
        env:
          APP_STORE_CONNECT_API_KEY_ID: ${{ secrets.APP_STORE_CONNECT_API_KEY_ID }}
          APP_STORE_CONNECT_ISSUER_ID: ${{ secrets.APP_STORE_CONNECT_ISSUER_ID }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: ios-build-logs
          path: |
            ios/build/
            ios/fastlane/report.xml
```

### 3. Workflow Android Avanzato

```yaml
# .github/workflows/android-deploy.yml
name: Android Build and Deploy

on:
  push:
    branches: [main]
    tags: ['v*']
  workflow_dispatch:

jobs:
  build-android:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '11'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Install dependencies
        run: npm ci

      - name: Cache Gradle
        uses: actions/cache@v3
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}

      - name: Decode Keystore
        run: |
          echo "${{ secrets.ANDROID_KEYSTORE_FILE }}" | base64 --decode > android/app/release.keystore

      - name: Create Google Play Service Account JSON
        run: |
          echo "${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}" > android/google-play-service-account.json

      - name: Build and Upload to Play Store
        run: |
          cd android
          bundle exec fastlane release
        env:
          ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: android-aab
          path: android/app/build/outputs/bundle/release/app-release.aab
```

### 4. Script di Setup Automatico

```bash
#!/bin/bash
# setup-github-actions.sh

echo "🚀 Setup GitHub Actions per Rise Against Hunger Italia"

# 1. Genera le cartelle necessarie
mkdir -p .github/workflows
mkdir -p ios/fastlane
mkdir -p android/fastlane

# 2. Genera Fastfile semplificati
cat > ios/fastlane/Fastfile << 'EOF'
default_platform(:ios)

platform :ios do
  lane :release do
    setup_ci

    build_app(
      workspace: "RiseAgainstHungerItalia.xcworkspace",
      scheme: "RiseAgainstHungerItalia",
      export_method: "app-store",
      export_options: {
        provisioningProfiles: {
          "org.riseagainsthunger.italia" => "match AppStore org.riseagainsthunger.italia"
        }
      }
    )

    upload_to_app_store(
      api_key_path: "~/.appstoreconnect/private_keys/AuthKey_#{ENV['APP_STORE_CONNECT_API_KEY_ID']}.p8",
      api_key: {
        key_id: ENV['APP_STORE_CONNECT_API_KEY_ID'],
        issuer_id: ENV['APP_STORE_CONNECT_ISSUER_ID']
      },
      skip_waiting_for_build_processing: true
    )
  end
end
EOF

cat > android/fastlane/Fastfile << 'EOF'
default_platform(:android)

platform :android do
  lane :release do
    gradle(
      task: "bundle",
      build_type: "release",
      project_dir: "android/"
    )

    upload_to_play_store(
      json_key: "google-play-service-account.json",
      aab: "app/build/outputs/bundle/release/app-release.aab",
      track: "production"
    )
  end
end
EOF

echo "✅ Setup completato!"
echo "📝 Prossimi steps:"
echo "1. Configura i secrets in GitHub"
echo "2. Crea certificati iOS"
echo "3. Genera keystore Android"
echo "4. Push su GitHub per attivare i workflow"
```

## 💡 **Confronto Finale delle Opzioni**

| Aspetto              | Expo EAS   | Fastlane   | GitHub Actions |
| -------------------- | ---------- | ---------- | -------------- |
| **Costo annuale**    | $348-1188  | $124       | $124           |
| **Setup complexity** | ⭐⭐       | ⭐⭐⭐⭐   | ⭐⭐⭐         |
| **Controllo**        | ⭐⭐       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐     |
| **Automazione**      | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐     |
| **Dipendenze**       | Expo       | Local/CI   | GitHub         |
| **Build time**       | Medio      | Veloce     | Medio          |

## 🎯 **Raccomandazione per Rise Against Hunger**

### **OPZIONE MIGLIORE: GitHub Actions**

**Perché:**

1. **Budget Zero**: Completamente gratuito
2. **Automazione**: Push → Build → Deploy automatico
3. **Trasparenza**: Tutto il processo visibile
4. **Indipendenza**: Nessun vendor lock-in
5. **Scalabilità**: Cresce con il progetto

**Setup consigliato:**

```bash
# 1. Mantieni Expo per development
npx expo start  # per testing rapido

# 2. Usa GitHub Actions per production
git tag v1.0.0 && git push --tags  # Auto-deploy to stores
```

**Timeline:**

- **Setup iniziale**: 1-2 giorni
- **Deploy automatico**: Ogni push/tag
- **Costo**: **$0** (vs $350+ Expo)

Vuoi che proceda con il setup GitHub Actions o preferisci esplorare un'altra opzione?
