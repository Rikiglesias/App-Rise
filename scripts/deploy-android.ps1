#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Deploy automatico Android per Rise Against Hunger Italia

.DESCRIPTION
    Script per build e deploy Android su Google Play Store usando EAS
    - Build production-store (AAB)
    - Upload Google Play Store
    - Notifica via commit comment se run in CI

.PARAMETER Profile
    Profile EAS da usare (default: production-store)

.PARAMETER SkipSubmit
    Salta il submit a Google Play Store

.PARAMETER SkipBuild
    Salta la build, usa l'ultima disponibile per submit

.EXAMPLE
    ./deploy-android.ps1
    Deploy completo con build e submit

.EXAMPLE
    ./deploy-android.ps1 -Profile android-test
    Deploy con profile di test

.EXAMPLE
    ./deploy-android.ps1 -SkipSubmit
    Solo build, senza submit

.EXAMPLE
    ./deploy-android.ps1 -SkipBuild
    Solo submit dell'ultima build
#>

param(
    [string]$Profile = "production-store",
    [switch]$SkipSubmit,
    [switch]$SkipBuild
)

# Configurazione colori
$Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Test-EASLogin {
    Write-ColorOutput "🔐 Verificando login EAS..." "Info"
    try {
        $loginCheck = eas whoami 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ EAS login attivo: $loginCheck" "Success"
            return $true
        } else {
            Write-ColorOutput "❌ EAS login richiesto" "Error"
            return $false
        }
    }
    catch {
        Write-ColorOutput "❌ EAS CLI non trovato o non configurato" "Error"
        return $false
    }
}

function Start-AndroidBuild {
    param([string]$BuildProfile)
    
    Write-ColorOutput "🤖 ============================================" "Header"
    Write-ColorOutput "🤖 ANDROID BUILD - Rise Against Hunger Italia" "Header"
    Write-ColorOutput "🤖 ============================================" "Header"
    
    Write-ColorOutput "📋 Profile: $BuildProfile" "Info"
    Write-ColorOutput "📅 Data: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Info"
    
    Write-ColorOutput "`n🔨 Avvio build Android..." "Info"
    try {
        eas build --platform android --profile $BuildProfile --non-interactive
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Build Android completata con successo!" "Success"
            return $true
        } else {
            Write-ColorOutput "❌ Build Android fallita" "Error"
            return $false
        }
    }
    catch {
        Write-ColorOutput "❌ Errore durante build Android: $_" "Error"
        return $false
    }
}

function Submit-AndroidApp {
    Write-ColorOutput "`n📤 Avvio submit a Google Play Store..." "Info"
    
    try {
        # Verifica se service account è configurato
        $configCheck = eas submit --platform android --latest --non-interactive --dry-run 2>&1
        
        if ($configCheck -match "serviceAccountKeyPath|service.*account") {
            Write-ColorOutput "📋 Service account configurato, procedendo con submit..." "Info"
            eas submit --platform android --latest --non-interactive
            
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✅ Submit a Google Play Store completato!" "Success"
                Write-ColorOutput "📱 L'app sarà disponibile su Google Play Console entro 1-2 ore" "Info"
                Write-ColorOutput "🔗 Controlla: https://play.google.com/console" "Info"
                return $true
            } else {
                Write-ColorOutput "❌ Submit a Google Play Store fallito" "Error"
                return $false
            }
        } else {
            Write-ColorOutput "⚠️ Google Play service account non configurato" "Warning"
            Write-ColorOutput "📋 Per configurare:" "Info"
            Write-ColorOutput "   1. Crea service account su Google Cloud Console" "Info"
            Write-ColorOutput "   2. Scarica il file JSON" "Info"
            Write-ColorOutput "   3. Salva come './google-service-account.json'" "Info"
            Write-ColorOutput "   4. eas submit --platform android --latest" "Info"
            return $false
        }
    }
    catch {
        Write-ColorOutput "❌ Errore durante submit: $_" "Error"
        return $false
    }
}

function Show-BuildInstructions {
    Write-ColorOutput "`n📋 COMANDI MANUALI DISPONIBILI:" "Header"
    Write-ColorOutput "🔨 Build: eas build --platform android --profile production-store" "Info"
    Write-ColorOutput "📤 Submit: eas submit --platform android --latest" "Info"
    Write-ColorOutput "👀 Status: eas build:list --platform android --limit 5" "Info"
    Write-ColorOutput "🔍 Monitor: https://expo.dev/accounts/rikiglesias/projects/rise-against-hunger-italia" "Info"
}

function Main {
    Write-ColorOutput "🚀 DEPLOY ANDROID - Rise Against Hunger Italia" "Header"
    Write-ColorOutput "=" * 50 "Header"
    
    # Verifica prerequisiti
    if (-not (Test-EASLogin)) {
        Write-ColorOutput "💡 Esegui: eas login" "Warning"
        exit 1
    }
    
    $buildSuccess = $true
    $submitSuccess = $false
    
    # Build Android
    if (-not $SkipBuild) {
        $buildSuccess = Start-AndroidBuild -BuildProfile $Profile
        if (-not $buildSuccess) {
            Write-ColorOutput "`n❌ Build fallita, interrompendo deploy" "Error"
            Show-BuildInstructions
            exit 1
        }
    } else {
        Write-ColorOutput "⏭️ Build saltata (usando ultima build disponibile)" "Warning"
    }
    
    # Submit a Google Play Store
    if (-not $SkipSubmit -and $buildSuccess) {
        $submitSuccess = Submit-AndroidApp
    } elseif ($SkipSubmit) {
        Write-ColorOutput "⏭️ Submit saltato (solo build)" "Warning"
    }
    
    # Riepilogo finale
    Write-ColorOutput "`n🎯 RIEPILOGO DEPLOY ANDROID:" "Header"
    Write-ColorOutput "=" * 40 "Header"
    
    if ($buildSuccess) {
        Write-ColorOutput "🔨 Build: ✅ SUCCESS" "Success"
    } else {
        Write-ColorOutput "🔨 Build: ❌ FAILED" "Error"
    }
    
    if (-not $SkipSubmit) {
        if ($submitSuccess) {
            Write-ColorOutput "📤 Submit: ✅ SUCCESS" "Success"
        } else {
            Write-ColorOutput "📤 Submit: ❌ FAILED/SKIPPED" "Warning"
        }
    } else {
        Write-ColorOutput "📤 Submit: ⏭️ SKIPPED" "Warning"
    }
    
    Write-ColorOutput "`n🔗 Monitor: https://expo.dev/accounts/rikiglesias/projects/rise-against-hunger-italia" "Info"
    
    if ($buildSuccess -and ($submitSuccess -or $SkipSubmit)) {
        Write-ColorOutput "`n🎉 Deploy Android completato con successo!" "Success"
        Show-BuildInstructions
        exit 0
    } else {
        Write-ColorOutput "`n⚠️ Deploy parzialmente completato, verifica errori sopra" "Warning"
        Show-BuildInstructions
        exit 1
    }
}

# Avvia script
try {
    Main
}
catch {
    Write-ColorOutput "💥 Errore critico: $_" "Error"
    Write-ColorOutput $_.ScriptStackTrace "Error"
    exit 1
} 