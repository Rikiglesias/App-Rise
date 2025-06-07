# Rise Against Hunger Italia - Setup Deployment (PowerShell)

Write-Host "🚀 Rise Against Hunger Italia - Setup Deployment" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

function Write-Step {
    param($Message)
    Write-Host "📋 $Message" -ForegroundColor Cyan
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Step 1: Check prerequisites
Write-Step "Checking prerequisites..."

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js not found. Please install Node.js 18+"
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm not found. Please install npm"
    exit 1
}

Write-Success "Node.js and npm are installed"

# Step 2: Install Expo CLI
Write-Step "Installing/updating Expo CLI..."
npm install -g @expo/cli
Write-Success "Expo CLI ready"

# Step 3: Update .gitignore
Write-Step "Updating .gitignore..."

# Create gitignore content separately
$gitignoreLines = @(
    "",
    "# Native projects",
    "/ios/",
    "/android/",
    "",
    "# Fastlane",
    "ios/fastlane/report.xml",
    "ios/fastlane/Preview.html", 
    "ios/fastlane/screenshots",
    "ios/fastlane/test_output",
    "android/fastlane/report.xml",
    "android/fastlane/Preview.html",
    "android/fastlane/screenshots", 
    "android/fastlane/test_output",
    "",
    "# Signing",
    "*.keystore",
    "*.p12",
    "*.mobileprovision",
    "google-play-service-account.json",
    "",
    "# Bundler",
    "vendor/bundle/",
    ".bundle/"
)

foreach ($line in $gitignoreLines) {
    Add-Content -Path ".gitignore" -Value $line
}

Write-Success ".gitignore updated"

# Step 4: Create PowerShell deploy scripts
Write-Step "Creating deploy scripts..."

# Create iOS deploy script
@"
# Deploy iOS to App Store
Write-Host "🍎 Deploying iOS to App Store..." -ForegroundColor Blue
Set-Location ios
bundle exec fastlane release
Set-Location ..
"@ | Out-File -FilePath "deploy-ios.ps1" -Encoding UTF8

# Create Android deploy script  
@"
# Deploy Android to Play Store
Write-Host "🤖 Deploying Android to Play Store..." -ForegroundColor Blue
Set-Location android
bundle exec fastlane release
Set-Location ..
"@ | Out-File -FilePath "deploy-android.ps1" -Encoding UTF8

Write-Success "Deploy scripts created"

# Final instructions
Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=================="
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. 🔑 Setup GitHub Secrets:"
Write-Host "   - APP_STORE_CONNECT_API_KEY"
Write-Host "   - APP_STORE_CONNECT_API_KEY_ID"
Write-Host "   - APP_STORE_CONNECT_ISSUER_ID"
Write-Host "   - GOOGLE_PLAY_SERVICE_ACCOUNT_JSON"
Write-Host "   - ANDROID_KEYSTORE_FILE"
Write-Host "   - ANDROID_KEYSTORE_PASSWORD"
Write-Host "   - ANDROID_KEY_ALIAS"
Write-Host "   - ANDROID_KEY_PASSWORD"
Write-Host ""
Write-Host "2. 🏗️ Create Apple Developer Account (99 USD/year)"
Write-Host "3. 🤖 Create Google Play Developer Account (25 USD one-time)"
Write-Host "4. 📱 Generate signing certificates"
Write-Host ""
Write-Host "🚀 Deploy Commands:" -ForegroundColor Cyan
Write-Host "   git tag v1.0.0; git push --tags  # Auto-deploy via GitHub Actions"
Write-Host "   .\deploy-ios.ps1                 # Local iOS deploy"
Write-Host "   .\deploy-android.ps1             # Local Android deploy"
Write-Host ""
Write-Host "💡 Development (unchanged):" -ForegroundColor Green
Write-Host "   npx expo start                   # Continue using Expo for development"
Write-Host ""
Write-Success "You're ready to deploy! 🎯" 