# dump-access-schema.ps1 — estrae SOLO lo schema (struttura) di un DB Microsoft Access .accdb
# per il goal access-sync (mapping Supabase -> Access). GOAL: sbloccare il bloccante "schema reale Access".
#
# PRIVACY (regola non negoziabile, access-db-integrazione.md): questo script legge SOLO
# metadati (nomi tabelle/colonne/tipi) e CONTEGGI aggregati (COUNT(*)). NON esegue MAI un
# SELECT di righe -> NESSUN dato personale dei donatori viene letto o stampato. L'output e'
# sicuro da incollare in chat: e' struttura, non contenuto.
#
# AMBIENTE: gira SUL SERVER Windows dove vive Access (dove serve poi il job di sync).
# Bitness: 64-bit confermato (access-db-integrazione.md) -> usa pwsh/powershell 64-bit +
# driver ACE 64-bit. Se il provider non e' registrato: installa "Microsoft Access Database
# Engine 2016 Redistributable" 64-bit (o apri Access 64-bit una volta).
#
# USO:
#   powershell -NoProfile -ExecutionPolicy Bypass -File dump-access-schema.ps1 -AccdbPath "D:\percorso\donatori.accdb"
#   (opzionale)  -OutFile "schema.md"   -> default: <accdb>-schema.md accanto al file
#   (opzionale)  -NoCounts              -> salta anche i COUNT(*) (solo struttura pura)
#   (opzionale)  -Password "..."        -> se il .accdb ha una database password
#
# Poi: incolla in chat il contenuto del file .md generato (SOLO schema, gia' privacy-safe).

param(
    [Parameter(Mandatory = $true)][string]$AccdbPath,
    [string]$OutFile,
    [switch]$NoCounts,
    [string]$Password
)
$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $AccdbPath)) { Write-Error "File non trovato: $AccdbPath"; exit 1 }
$AccdbPath = (Resolve-Path -LiteralPath $AccdbPath).Path
if (-not $OutFile) { $OutFile = [System.IO.Path]::ChangeExtension($AccdbPath, $null).TrimEnd('.') + '-schema.md' }

# --- Provider ACE OLEDB: prova 16.0 poi 12.0 (64-bit) ---
function New-AceConnection {
    param([string]$path, [string]$pwd)
    $providers = @('Microsoft.ACE.OLEDB.16.0', 'Microsoft.ACE.OLEDB.12.0')
    foreach ($prov in $providers) {
        $cs = "Provider=$prov;Data Source=$path;"
        if ($pwd) { $cs += "Jet OLEDB:Database Password=$pwd;" }
        try {
            $conn = New-Object System.Data.OleDb.OleDbConnection $cs
            $conn.Open()
            return @{ conn = $conn; provider = $prov }
        } catch {
            $script:lastErr = $_.Exception.Message
            continue
        }
    }
    throw "Nessun provider ACE OLEDB 64-bit disponibile (provati: $($providers -join ', ')). " +
          "Installa 'Microsoft Access Database Engine 2016 Redistributable' 64-bit. Ultimo errore: $script:lastErr"
}

# --- Mappa codici OLE DB DATA_TYPE -> nome leggibile (tipi Access comuni) ---
$typeMap = @{
    2 = 'Integer(Short)'; 3 = 'Long/AutoNumber'; 4 = 'Single'; 5 = 'Double'; 6 = 'Currency';
    7 = 'Date/Time'; 11 = 'Yes/No(Boolean)'; 17 = 'Byte'; 72 = 'GUID(ReplicationID)';
    128 = 'Binary'; 130 = 'Text/ShortText'; 131 = 'Decimal'; 133 = 'Date'; 135 = 'DateTime';
    201 = 'LongText(Memo)'; 202 = 'Text'; 203 = 'LongText(Memo)'; 204 = 'VarBinary';
    205 = 'OLE/Attachment(LongBinary)'
}
function Get-TypeName([int]$code) { if ($typeMap.ContainsKey($code)) { $typeMap[$code] } else { "OLEDB_type_$code" } }

$open = New-AceConnection -path $AccdbPath -pwd $Password
$conn = $open.conn
$out = @()
$out += "# Schema Access — $([System.IO.Path]::GetFileName($AccdbPath))"
$out += ""
$out += "> Estratto da ``dump-access-schema.ps1`` (provider $($open.provider)) il $(Get-Date -Format 'yyyy-MM-dd HH:mm')."
$out += "> SOLO struttura + conteggi aggregati. Nessuna riga di dati letta (privacy-safe)."
$out += ""

try {
    # Tabelle utente (esclude sistema MSys* e viste)
    $tablesSchema = $conn.GetOleDbSchemaTable([System.Data.OleDb.OleDbSchemaGuid]::Tables, @($null, $null, $null, 'TABLE'))
    $tableNames = @($tablesSchema | Where-Object { $_.TABLE_NAME -notlike 'MSys*' } | Select-Object -ExpandProperty TABLE_NAME | Sort-Object)
    $out += "**Tabelle utente: $($tableNames.Count)** — $($tableNames -join ', ')"
    $out += ""

    # Colonne (tutte in un colpo, poi raggruppo)
    $colsSchema = $conn.GetOleDbSchemaTable([System.Data.OleDb.OleDbSchemaGuid]::Columns, $null)

    foreach ($t in $tableNames) {
        $out += "## $t"
        # conteggio aggregato (COUNT(*) = nessun dato personale)
        if (-not $NoCounts) {
            try {
                $cmd = $conn.CreateCommand()
                $cmd.CommandText = "SELECT COUNT(*) FROM [$t]"
                $cnt = $cmd.ExecuteScalar()
                $out += "_righe: ${cnt}_"
            } catch { $out += "_righe: (conteggio non riuscito: $($_.Exception.Message))_" }
        }
        $out += ""
        $out += "| colonna | tipo | nullable | lunghezza |"
        $out += "|---|---|---|---|"
        $tcols = $colsSchema | Where-Object { $_.TABLE_NAME -eq $t } | Sort-Object ORDINAL_POSITION
        foreach ($c in $tcols) {
            $tn = Get-TypeName([int]$c.DATA_TYPE)
            $nullable = if ($c.IS_NULLABLE) { 'si' } else { 'no' }
            $len = if ($c.CHARACTER_MAXIMUM_LENGTH -and $c.CHARACTER_MAXIMUM_LENGTH -gt 0) { [string]$c.CHARACTER_MAXIMUM_LENGTH } else { '-' }
            $out += "| $($c.COLUMN_NAME) | $tn | $nullable | $len |"
        }
        $out += ""
    }
} finally {
    $conn.Close()
}

$out -join "`r`n" | Set-Content -LiteralPath $OutFile -Encoding UTF8
Write-Host "OK — schema scritto in: $OutFile"
Write-Host "Tabelle trovate: $($tableNames.Count). Incolla il contenuto del file .md in chat (e' solo schema, privacy-safe)."
