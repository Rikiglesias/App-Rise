#!/usr/bin/env pwsh

# Script per controllare stato aggiornamenti OTA
# Rise Against Hunger Italia

function Show-Header {
    Write-Host "📊 STATO AGGIORNAMENTI OTA - Rise Against Hunger Italia" -ForegroundColor Cyan
    Write-Host "=======================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Show-UpdateChannels {
    Write-Host "🔍 Controllando tutti i canali di aggiornamento..." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "📱 CANALE DEVELOPMENT:" -ForegroundColor Green
    & npx eas update:list --branch development --limit 5 2>$null || Write-Host "   Nessun aggiornamento pubblicato" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "👁️  CANALE PREVIEW:" -ForegroundColor Blue
    & npx eas update:list --branch preview --limit 5 2>$null || Write-Host "   Nessun aggiornamento pubblicato" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "🌟 CANALE PRODUCTION:" -ForegroundColor Red
    & npx eas update:list --branch production --limit 5 2>$null || Write-Host "   Nessun aggiornamento pubblicato" -ForegroundColor Gray
}

function Show-ProjectInfo {
    Write-Host ""
    Write-Host "📋 INFORMAZIONI PROGETTO:" -ForegroundColor Cyan
    Write-Host "Project ID: 52a33b0f-dec1-4674-812b-de5b888c911a" -ForegroundColor Gray
    Write-Host "Updates URL: https://u.expo.dev/52a33b0f-dec1-4674-812b-de5b888c911a" -ForegroundColor Gray
    Write-Host ""
}

function Show-QuickCommands {
    Write-Host "⚡ COMANDI RAPIDI:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🚀 Pubblicare aggiornamento:" -ForegroundColor Green
    Write-Host "   ./scripts/update-ota.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔧 Aggiornamento sviluppo:" -ForegroundColor Green  
    Write-Host "   npm run update:dev 'messaggio'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🌟 Aggiornamento produzione:" -ForegroundColor Red
    Write-Host "   npm run update:production 'messaggio'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🚨 Hotfix urgente:" -ForegroundColor Magenta
    Write-Host "   npm run update:hotfix 'fix critico'" -ForegroundColor Gray
    Write-Host ""
}

# Main script
Show-Header
Show-ProjectInfo
Show-UpdateChannels
Show-QuickCommands 