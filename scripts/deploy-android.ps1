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