# Fix import PerfectSpacing da designTokens → constants

Write-Host "🔧 Fixing PerfectSpacing imports..." -ForegroundColor Cyan

$files = Get-ChildItem -Path "src" -Recurse -Include *.ts,*.tsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Pattern 1: import { ..., PerfectSpacing, ... } from 'designTokens'
    # Separa PerfectSpacing dagli altri import di designTokens
    $content = $content -replace "import \{ ([^}]*),\s*PerfectSpacing\s*,\s*([^}]*)\} from '[^']*designTokens';", "import { `$1, `$2 } from '@/shared/constants/designTokens';`nimport { PerfectSpacing } from '@/shared/constants';"
    
    $content = $content -replace "import \{ ([^}]*),\s*PerfectSpacing\s*\} from '[^']*designTokens';", "import { `$1 } from '@/shared/constants/designTokens';`nimport { PerfectSpacing } from '@/shared/constants';"
    
    $content = $content -replace "import \{ PerfectSpacing\s*,\s*([^}]*)\} from '[^']*designTokens';", "import { `$1 } from '@/shared/constants/designTokens';`nimport { PerfectSpacing } from '@/shared/constants';"
    
    $content = $content -replace "import \{ PerfectSpacing \} from '[^']*designTokens';", "import { PerfectSpacing } from '@/shared/constants';"
    
    # Aggiungi import scale() se manca e viene usato
    if ($content -match '\bscale\(' -and $content -notmatch "import.*scale.*from") {
        $content = $content -replace "(import \{ PerfectSpacing \} from '@/shared/constants';)", "`$1`nimport { scale } from '@/shared/constants/perfectScale';"
    }
    
    # Pulisci import vuoti o con solo virgole
    $content = $content -replace "import \{\s*,\s*\} from.*designTokens';", ""
    $content = $content -replace "import \{\s*\} from.*designTokens';", ""
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✅ Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "🎉 Imports fixed!" -ForegroundColor Green
