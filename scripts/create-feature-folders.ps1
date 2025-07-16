# Script per creare la nuova struttura delle cartelle src
Write-Host "Creazione della nuova architettura src..." -ForegroundColor Green

# Features
$features = @("home", "impact", "actions", "about", "social")
$subfolders = @("components", "hooks", "screens", "types")

foreach ($feature in $features) {
    foreach ($subfolder in $subfolders) {
        $path = "src/features/$feature/$subfolder"
        New-Item -ItemType Directory -Force -Path $path | Out-Null
        Write-Host "✓ Creata: $path" -ForegroundColor Cyan
    }
}

# Shared folders
$sharedFolders = @(
    "src/shared/components/ui",
    "src/shared/components/layout",
    "src/shared/components/animations",
    "src/shared/hooks",
    "src/shared/utils",
    "src/shared/constants",
    "src/shared/config"
)

foreach ($folder in $sharedFolders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
    Write-Host "✓ Creata: $folder" -ForegroundColor Yellow
}

Write-Host "`nStruttura delle cartelle creata con successo!" -ForegroundColor Green 