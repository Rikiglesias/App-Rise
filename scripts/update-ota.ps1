#!/usr/bin/env pwsh

# Script per aggiornamenti Over-the-Air (OTA)
# Rise Against Hunger Italia

param(
    [string]$Type = "",
    [string]$Message = ""
)

function Show-Header {
    Write-Host "🚀 AGGIORNAMENTI OTA - Rise Against Hunger Italia" -ForegroundColor Cyan
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Show-UpdateTypes {
    Write-Host "Tipi di aggiornamento disponibili:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. 🔧 development  - Per test interni del team" -ForegroundColor Green
    Write-Host "2. 👁️  preview      - Per beta tester e review" -ForegroundColor Blue  
    Write-Host "3. 🌟 production   - Per utenti finali (LIVE)" -ForegroundColor Red
    Write-Host "4. 🚨 hotfix       - Correzioni urgenti produzione" -ForegroundColor Magenta
    Write-Host "5. 🤖 auto        - Update automatico (branch corrente)" -ForegroundColor DarkGray
    Write-Host ""
}

function Get-UpdateType {
    if ($Type -eq "") {
        Show-UpdateTypes
        $choice = Read-Host "Seleziona il tipo di aggiornamento (1-5)"
        
        switch ($choice) {
            "1" { return "development" }
            "2" { return "preview" }
            "3" { return "production" }
            "4" { return "hotfix" }
            "5" { return "auto" }
            default { 
                Write-Host "❌ Scelta non valida!" -ForegroundColor Red
                exit 1
            }
        }
    }
    return $Type
}

function Get-UpdateMessage {
    if ($Message -eq "") {
        Write-Host ""
        Write-Host "📝 Inserisci una descrizione per questo aggiornamento:" -ForegroundColor Yellow
        $userMessage = Read-Host "Messaggio"
        
        if ($userMessage -eq "") {
            Write-Host "❌ Il messaggio è obbligatorio!" -ForegroundColor Red
            exit 1
        }
        return $userMessage
    }
    return $Message
}

function Confirm-Update {
    param($updateType, $updateMessage)
    
    Write-Host ""
    Write-Host "📋 RIEPILOGO AGGIORNAMENTO:" -ForegroundColor Yellow
    Write-Host "Tipo: $updateType" -ForegroundColor Cyan
    Write-Host "Messaggio: $updateMessage" -ForegroundColor Cyan
    Write-Host ""
    
    $confirm = Read-Host "Confermi l'invio dell'aggiornamento? (s/N)"
    return ($confirm -eq "s" -or $confirm -eq "S" -or $confirm -eq "si" -or $confirm -eq "Si")
}

# Main script
Show-Header

# Controllo qualità PRE-aggiornamento
Write-Host "🔍 Eseguendo controlli qualità..." -ForegroundColor Yellow
& npm run pre-modifiche

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ BLOCCATO: Errori di qualità rilevati!" -ForegroundColor Red
    Write-Host "   Esegui 'npm run helper-manuali' per correzioni" -ForegroundColor Yellow
    exit 1
}

$updateType = Get-UpdateType
$updateMessage = Get-UpdateMessage

if (Confirm-Update $updateType $updateMessage) {
    Write-Host ""
    Write-Host "🚀 Pubblicando aggiornamento OTA..." -ForegroundColor Green
    
    switch ($updateType) {
        "development" { 
            & npx eas update --branch development --message $updateMessage
        }
        "preview" { 
            & npx eas update --branch preview --message $updateMessage
        }
        "production" { 
            & npx eas update --branch production --message $updateMessage
        }
        "hotfix" { 
            & npx eas update --branch production --message $updateMessage
        }
        "auto" { 
            & npx eas update --auto --message $updateMessage
        }
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Aggiornamento OTA pubblicato con successo!" -ForegroundColor Green
        Write-Host "📱 Gli utenti riceveranno l'aggiornamento al prossimo avvio dell'app" -ForegroundColor Cyan
        
        if ($updateType -eq "production") {
            Write-Host ""
            Write-Host "⚠️  PRODUZIONE: Monitora eventuali segnalazioni utenti" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Errore durante la pubblicazione dell'aggiornamento!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Aggiornamento annullato dall'utente" -ForegroundColor Yellow
} 