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

# Step 2: Install EAS CLI
Write-Step "Installing/updating EAS CLI..."
npm install -g @expo/eas-cli
Write-Success "EAS CLI ready"

# Step 3: Login to Expo
Write-Step "Logging into Expo..."
eas login

# Step 4: Configure EAS Build
Write-Step "Configuring EAS Build..."
if (-not (Test-Path "eas.json")) {
    eas build:configure
    Write-Success "EAS Build configured"
} else {
    Write-Success "EAS Build already configured"
}

# Step 5: Update deploy scripts
Write-Step "Creating EAS deploy scripts..."

# Create iOS deploy script
@"
# Deploy iOS con EAS Build (Expo)
Write-Host "🍎 Building iOS with EAS..." -ForegroundColor Blue

# Check if EAS is installed
if (-not (Get-Command eas -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing EAS CLI..." -ForegroundColor Yellow
    npm install -g @expo/eas-cli
}

# Login and build
eas login
eas build --platform ios --profile production-store
"@ | Out-File -FilePath "deploy-ios.ps1" -Encoding UTF8

# Create Android deploy script  
@"
# Deploy Android con EAS Build (Expo)
Write-Host "🤖 Building Android with EAS..." -ForegroundColor Blue

# Check if EAS is installed
if (-not (Get-Command eas -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing EAS CLI..." -ForegroundColor Yellow
    npm install -g @expo/eas-cli
}

# Login and build
eas login
eas build --platform android --profile production-store
"@ | Out-File -FilePath "deploy-android.ps1" -Encoding UTF8

Write-Success "EAS deploy scripts created"

# Final instructions
Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=================="
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. 🔑 Create Expo account (free)"
Write-Host "2. 🏗️ Create Apple Developer Account (99 USD/year) for iOS"
Write-Host "3. 🤖 Create Google Play Developer Account (25 USD one-time) for Android"
Write-Host "4. 📱 Configure app store listings"
Write-Host ""
Write-Host "🚀 Deploy Commands:" -ForegroundColor Cyan
Write-Host "   .\publish.sh                     # Interactive deploy (recommended)"
Write-Host "   .\deploy-ios.ps1                 # iOS only"
Write-Host "   .\deploy-android.ps1             # Android only"
Write-Host "   eas build --platform all         # Build both platforms"
Write-Host "   eas submit --platform all        # Submit to stores"
Write-Host ""
Write-Host "💡 Development:" -ForegroundColor Green
Write-Host "   npx expo start                   # Start development server"
Write-Host "   npx expo start --tunnel          # External network access"
Write-Host ""
Write-Success "You're ready to deploy with Expo EAS! 🎯" 