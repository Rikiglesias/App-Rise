#!/usr/bin/env pwsh

# Bump versione app e build numbers (iOS/Android)
# Uso:
#   npm run version:set -- 1.2.6
#   npm run version:set -- -Version 1.2.6 -IosBuildNumber 21 -AndroidVersionCode 5

[CmdletBinding()]
param(
  [Parameter(Position=0, Mandatory=$true)]
  [string]$Version,

  [int]$IosBuildNumber,
  [int]$AndroidVersionCode
)

Write-Host "Aggiornamento versione app -> $Version" -ForegroundColor Cyan

$configPath = Join-Path $PSScriptRoot "..\app.config.js"
if (!(Test-Path $configPath)) {
  Write-Error "File app.config.js non trovato: $configPath"
  exit 1
}

$content = Get-Content $configPath -Raw

# Aggiorna version: 'x.y.z'
$content = [Regex]::Replace($content, "version:\s*'[^']+'", "version: '$Version'", [Text.RegularExpressions.RegexOptions]::IgnoreCase)

# Estrai iOS buildNumber corrente (fallback numerico)
$iosMatch = [Regex]::Match($content, "buildNumber:\s*process\.env\.IOS_BUILD_NUMBER\s*\|\|\s*'(?<num>\d+)'", [Text.RegularExpressions.RegexOptions]::IgnoreCase)
if ($iosMatch.Success) {
  $currentIos = [int]$iosMatch.Groups['num'].Value
  $newIos = if ($PSBoundParameters.ContainsKey('IosBuildNumber')) { $IosBuildNumber } else { $currentIos + 1 }
  $content = [Regex]::Replace(
    $content,
    "(buildNumber:\s*process\.env\.IOS_BUILD_NUMBER\s*\|\|\s*')\d+(')",
    "`${1}$newIos`${2}",
    [Text.RegularExpressions.RegexOptions]::IgnoreCase
  )
  Write-Host "iOS buildNumber: $currentIos -> $newIos" -ForegroundColor Green
} else {
  Write-Warning "buildNumber iOS non trovato; nessuna modifica eseguita"
}

# Estrai Android versionCode corrente (fallback numerico)
$androidMatch = [Regex]::Match($content, "versionCode:\s*parseInt\(\s*process\.env\.ANDROID_VERSION_CODE\s*\|\|\s*'(?<num>\d+)'\s*,\s*10\s*\)", [Text.RegularExpressions.RegexOptions]::IgnoreCase)
if ($androidMatch.Success) {
  $currentAndroid = [int]$androidMatch.Groups['num'].Value
  $newAndroid = if ($PSBoundParameters.ContainsKey('AndroidVersionCode')) { $AndroidVersionCode } else { $currentAndroid + 1 }
  $content = [Regex]::Replace(
    $content,
    "(versionCode:\s*parseInt\(\s*process\.env\.ANDROID_VERSION_CODE\s*\|\|\s*')\d+('\s*,\s*10\s*\))",
    "`${1}$newAndroid`${2}",
    [Text.RegularExpressions.RegexOptions]::IgnoreCase
  )
  Write-Host "Android versionCode: $currentAndroid -> $newAndroid" -ForegroundColor Green
} else {
  Write-Warning "versionCode Android non trovato; nessuna modifica eseguita"
}

# Backup e scrittura
$backupPath = "$configPath.bak"
Copy-Item $configPath $backupPath -Force
Set-Content -Path $configPath -Value $content -NoNewline

Write-Host "Aggiornamento completato. Backup: $backupPath" -ForegroundColor Cyan
