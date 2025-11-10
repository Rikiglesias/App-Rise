# Script per testare workflow OTA localmente
# Rise Against Hunger Italia

param(
    [Parameter(Mandatory=$false)]
    [string]$Branch = "preview",
    
    [Parameter(Mandatory=$false)]
    [string]$Message = "Test OTA deployment"
)

Write-Host "🚀 Test OTA Workflow - Local Simulation" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verifica EXPO_TOKEN
Write-Host "1️⃣ Checking EXPO_TOKEN..." -ForegroundColor Yellow

if (-not $env:EXPO_TOKEN) {
    Write-Host "❌ EXPO_TOKEN not set in environment" -ForegroundColor Red
    Write-Host "💡 Set it with: `$env:EXPO_TOKEN = 'your-token'" -ForegroundColor Yellow
    Write-Host "💡 Or configure GitHub Secret: gh secret set EXPO_TOKEN" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ EXPO_TOKEN found" -ForegroundColor Green
Write-Host ""

# Step 2: Verifica EAS CLI
Write-Host "2️⃣ Checking EAS CLI..." -ForegroundColor Yellow

if (-not (Get-Command eas -ErrorAction SilentlyContinue)) {
    Write-Host "❌ EAS CLI not installed" -ForegroundColor Red
    Write-Host "💡 Install: npm install -g eas-cli" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ EAS CLI installed: $(eas --version)" -ForegroundColor Green
Write-Host ""

# Step 3: Verifica Autenticazione
Write-Host "3️⃣ Checking Expo authentication..." -ForegroundColor Yellow

$whoami = eas whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not authenticated with Expo" -ForegroundColor Red
    Write-Host "💡 Login: eas login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Authenticated as: $whoami" -ForegroundColor Green
Write-Host ""

# Step 4: Quality Checks
Write-Host "4️⃣ Running Quality Checks..." -ForegroundColor Yellow

Write-Host "   📝 TypeScript Check..." -NoNewline
$tsCheck = npx tsc --noEmit 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host " ❌ FAILED" -ForegroundColor Red
    Write-Host $tsCheck
    Write-Host ""
    Write-Host "⚠️ TypeScript errors found - fix before deploying" -ForegroundColor Red
    exit 1
}
Write-Host " ✅ PASSED" -ForegroundColor Green

Write-Host "   🧹 ESLint Check..." -NoNewline
$lintCheck = npx eslint . --ext .ts,.tsx --max-warnings 0 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host " ⚠️ WARNINGS" -ForegroundColor Yellow
} else {
    Write-Host " ✅ PASSED" -ForegroundColor Green
}

Write-Host "   🧪 Tests..." -NoNewline
$testCheck = npm test -- --passWithNoTests --silent 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host " ⚠️ WARNINGS" -ForegroundColor Yellow
} else {
    Write-Host " ✅ PASSED" -ForegroundColor Green
}

Write-Host ""

# Step 5: Deploy Simulation
Write-Host "5️⃣ Simulating OTA Deploy..." -ForegroundColor Yellow
Write-Host "   Branch: $Branch" -ForegroundColor Cyan
Write-Host "   Message: $Message" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "🤔 Proceed with actual OTA deployment? (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Publishing OTA update..." -ForegroundColor Cyan

try {
    eas update --branch $Branch --message $Message --non-interactive
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ OTA Update Published Successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 View update details:" -ForegroundColor Cyan
        Write-Host "   eas update:list --branch $Branch --limit 1" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🌐 Dashboard:" -ForegroundColor Cyan
        Write-Host "   https://expo.dev/accounts/rikiglesias/projects/rise-against-hunger-italia/updates" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "❌ OTA Update Failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error during deployment: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Workflow test completed successfully!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
