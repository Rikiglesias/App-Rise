param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

Write-Host "🔍 Controllo errori e warning per: $FilePath" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Gray

# Controllo TypeScript
Write-Host "📝 TypeScript Check..." -ForegroundColor Yellow
$tsResult = npx tsc --noEmit --skipLibCheck $FilePath
$tsExitCode = $LASTEXITCODE

Write-Host ""

# Controllo ESLint  
Write-Host "🔧 ESLint Check..." -ForegroundColor Yellow
$eslintResult = npx eslint $FilePath --format=stylish
$eslintExitCode = $LASTEXITCODE

Write-Host ""
Write-Host "================================================" -ForegroundColor Gray

if ($tsExitCode -eq 0 -and $eslintExitCode -eq 0) {
    Write-Host "✅ Nessun errore trovato in $FilePath" -ForegroundColor Green
} else {
    Write-Host "❌ Errori trovati in $FilePath" -ForegroundColor Red
    if ($tsExitCode -eq 0) {
        Write-Host "   - TypeScript: ✅ OK" -ForegroundColor Green
    } else {
        Write-Host "   - TypeScript: ❌ ERRORI" -ForegroundColor Red
    }
    if ($eslintExitCode -eq 0) {
        Write-Host "   - ESLint: ✅ OK" -ForegroundColor Green  
    } else {
        Write-Host "   - ESLint: ❌ ERRORI" -ForegroundColor Red
    }
}

exit ($tsExitCode + $eslintExitCode) 