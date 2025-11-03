# Script automatico migrazione Spacing → PerfectSpacing

Write-Host "🚀 Inizio migrazione automatica Spacing → PerfectSpacing" -ForegroundColor Green

# File da escludere (già migrati)
$excludeFiles = @(
    "**/HomeHeaderStyles.ts",
    "**/ModernSmartTitle.tsx",
    "**/ImpactScreenStyles.ts",
    "**/BottomTabNavigator.tsx",
    "**/designTokens.ts",
    "**/perfectSpacing.ts"
)

# Trova tutti i file TypeScript/TSX
$files = Get-ChildItem -Path "src" -Recurse -Include *.ts,*.tsx | 
    Where-Object { 
        $file = $_
        $exclude = $false
        foreach ($pattern in $excludeFiles) {
            if ($file.FullName -like $pattern) {
                $exclude = $true
                break
            }
        }
        -not $exclude
    }

$totalFiles = $files.Count
$processedFiles = 0

Write-Host "Trovati $totalFiles file da processare" -ForegroundColor Cyan

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Converti valori Spacing[...] → PerfectSpacing
    $content = $content -replace 'Spacing\[20\]', "PerfectSpacing['5xl']"
    $content = $content -replace 'Spacing\[16\]', "PerfectSpacing['4xl']"
    $content = $content -replace 'Spacing\[12\]', "PerfectSpacing['3xl']"
    $content = $content -replace 'Spacing\[10\]', "PerfectSpacing['2xl']"
    $content = $content -replace 'Spacing\[8\]', 'PerfectSpacing.xl'
    $content = $content -replace 'Spacing\[6\]', 'PerfectSpacing.lg'
    $content = $content -replace 'Spacing\[5\]', 'scale(20)'
    $content = $content -replace 'Spacing\[4\]', 'PerfectSpacing.base'
    $content = $content -replace 'Spacing\[3\]', 'PerfectSpacing.md'
    $content = $content -replace 'Spacing\[2\]', 'PerfectSpacing.sm'
    $content = $content -replace 'Spacing\[1\]', 'PerfectSpacing.xs'
    $content = $content -replace 'Spacing\[0\]', 'PerfectSpacing.none'
    
    # Converti import Spacing → PerfectSpacing
    $content = $content -replace '(\bimport\s*\{[^}]*)\bSpacing\b([^}]*\}\s*from)', '$1PerfectSpacing$2'
    
    # Salva solo se cambiato
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $processedFiles++
        Write-Host "✅ Migrato: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n🎉 Migrazione completata!" -ForegroundColor Green
Write-Host "File processati: $processedFiles/$totalFiles" -ForegroundColor Cyan
Write-Host "`nEsegui 'npx tsc --noEmit' per verificare" -ForegroundColor Yellow
