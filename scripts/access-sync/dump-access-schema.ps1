# dump-access-schema.ps1 -- estrae SOLO lo schema (struttura) di un DB Microsoft Access .accdb
# per il goal access-sync (mapping Supabase -> Access). GOAL: sbloccare il bloccante "schema reale Access".
#
# PRIVACY (regola non negoziabile, access-db-integrazione.md): questo script legge SOLO
# metadati (tabelle/colonne/tipi/PK/indici/relazioni) e CONTEGGI aggregati (COUNT(*)).
# NON esegue MAI un SELECT di righe -> NESSUN dato personale dei donatori viene letto o
# stampato. Anche i messaggi di errore del provider NON finiscono nel file di output
# (solo sulla console locale del server). L'output e' sicuro da incollare in chat.
#
# AMBIENTE: gira SUL SERVER Windows dove vive Access (dove serve poi il job di sync).
# Compatibile Windows PowerShell 5.1 (preinstallato) e PowerShell 7. Bitness: 64-bit
# confermato -> usa powershell/pwsh 64-bit + driver ACE 64-bit. Se il provider non e'
# registrato: installa "Microsoft Access Database Engine 2016 Redistributable" 64-bit.
#
# USO (dalla cartella dove sta lo script):
#   powershell -NoProfile -ExecutionPolicy Bypass -File dump-access-schema.ps1 -AccdbPath "D:\percorso\donatori.accdb"
#   (opzionale)  -OutFile "schema.md"   -> default: <accdb>-schema.md accanto al file
#   (opzionale)  -NoCounts              -> salta anche i COUNT(*) (solo struttura pura)
#   Se il .accdb ha una database password NON passarla come testo (finirebbe nella
#   command-line/history del server): lo script la chiede in modo sicuro con:
#   (opzionale)  -AskPassword           -> prompt nascosto Read-Host -AsSecureString
#
# Poi: incolla in chat il contenuto del file .md generato (SOLO schema, gia' privacy-safe).

param(
    [Parameter(Mandatory = $true)][string]$AccdbPath,
    [string]$OutFile,
    [switch]$NoCounts,
    [switch]$AskPassword
)

# Check argomenti PRIMA di ErrorActionPreference=Stop: messaggio pulito, niente blob eccezione.
if (-not (Test-Path -LiteralPath $AccdbPath)) { Write-Error "File non trovato: $AccdbPath"; exit 1 }

$ErrorActionPreference = 'Stop'
$AccdbPath = (Resolve-Path -LiteralPath $AccdbPath).Path
if (-not $OutFile) { $OutFile = [System.IO.Path]::ChangeExtension($AccdbPath, $null).TrimEnd('.') + '-schema.md' }
# Path relativo (-OutFile "schema.md") risolto contro $PWD in modo esplicito (WriteAllText userebbe CurrentDirectory del processo)
$OutFile = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutFile)

$plainPwd = $null
if ($AskPassword) {
    $sec = Read-Host -Prompt 'Database password (input nascosto)' -AsSecureString
    if ($sec -and $sec.Length -gt 0) { $plainPwd = (New-Object System.Net.NetworkCredential('', $sec)).Password }
}

# DBNull-safe: i rowset di schema usano System.DBNull (truthy in PS!) -> mai confrontarlo direttamente
function ConvertFrom-DbValue($v) { if ($null -eq $v -or $v -is [System.DBNull]) { $null } else { $v } }

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
    2 = 'Integer(Short)'; 3 = 'Long'; 4 = 'Single'; 5 = 'Double'; 6 = 'Currency';
    7 = 'Date/Time'; 11 = 'Yes/No(Boolean)'; 17 = 'Byte'; 72 = 'GUID(ReplicationID)';
    128 = 'Binary'; 130 = 'Text/ShortText'; 131 = 'Decimal'; 133 = 'Date'; 135 = 'DateTime';
    201 = 'LongText(Memo)'; 202 = 'Text'; 203 = 'LongText(Memo)'; 204 = 'VarBinary';
    205 = 'OLE/Attachment(LongBinary)'
}
function Get-TypeName([int]$code) { if ($typeMap.ContainsKey($code)) { $typeMap[$code] } else { "OLEDB_type_$code" } }

$open = New-AceConnection -path $AccdbPath -pwd $plainPwd
$conn = $open.conn
$out = @()
$out += "# Schema Access -- $([System.IO.Path]::GetFileName($AccdbPath))"
$out += ""
$out += "> Estratto da dump-access-schema.ps1 v2 (provider $($open.provider)) il $(Get-Date -Format 'yyyy-MM-dd HH:mm')."
$out += "> SOLO struttura + conteggi aggregati. Nessuna riga di dati letta (privacy-safe)."
$out += ""

try {
    # Tabelle: TUTTI i tipi rilevanti per l'ETL. Un master org e' spesso SPLIT front-end/back-end:
    # le tabelle donatori possono essere LINK (collegate) -> filtrarle fuori nasconderebbe il target vero.
    $tablesSchema = $conn.GetOleDbSchemaTable([System.Data.OleDb.OleDbSchemaGuid]::Tables, $null)
    $etlTypes = @('TABLE', 'LINK', 'PASS-THROUGH')
    $userRows = @($tablesSchema | Where-Object { $_.TABLE_NAME -notlike 'MSys*' -and $etlTypes -contains $_.TABLE_TYPE } | Sort-Object TABLE_NAME)
    $viewNames = @($tablesSchema | Where-Object { $_.TABLE_NAME -notlike 'MSys*' -and $_.TABLE_TYPE -eq 'VIEW' } | Select-Object -ExpandProperty TABLE_NAME | Sort-Object)
    $tableNames = @($userRows | Select-Object -ExpandProperty TABLE_NAME)
    $tableType = @{}
    foreach ($r in $userRows) { $tableType[$r.TABLE_NAME] = [string]$r.TABLE_TYPE }

    $out += "**Tabelle utente: $($tableNames.Count)**"
    foreach ($t in $tableNames) {
        $suffix = if ($tableType[$t] -ne 'TABLE') { " *(tipo: $($tableType[$t]) - tabella collegata, il dato vive in un backend esterno)*" } else { '' }
        $out += "- $t$suffix"
    }
    $out += ""
    if (@($userRows | Where-Object { $_.TABLE_TYPE -ne 'TABLE' }).Count -gt 0) {
        $out += "> ATTENZIONE: presenti tabelle COLLEGATE (LINK/PASS-THROUGH). Questo file e' probabilmente un"
        $out += "> front-end: il backend con i dati reali e' un altro file/.accdb o un server ODBC. Per l'ETL"
        $out += "> serve individuare il backend (vedi sezione 'Sorgenti collegate' se presente)."
        $out += ""
    }

    # Sorgenti delle tabelle collegate (best-effort: MSysObjects spesso non e' leggibile - normale).
    # Solo metadati di sistema; eventuali credenziali nella connect-string vengono OSCURATE.
    if (@($userRows | Where-Object { $_.TABLE_TYPE -ne 'TABLE' }).Count -gt 0) {
        try {
            $cmdL = $conn.CreateCommand()
            $cmdL.CommandText = 'SELECT Name, Database, ForeignName, Connect FROM MSysObjects WHERE Type IN (4,6,8)'
            $rdr = $cmdL.ExecuteReader()
            $linkRows = @()
            while ($rdr.Read()) {
                $nm = ConvertFrom-DbValue $rdr['Name']; $db = ConvertFrom-DbValue $rdr['Database']
                $fn = ConvertFrom-DbValue $rdr['ForeignName']; $cn = ConvertFrom-DbValue $rdr['Connect']
                if ($cn) { $cn = $cn -replace '(?i)(PWD|Password)\s*=\s*[^;]*', '$1=***' }
                $linkRows += "| $nm | $db | $fn | $cn |"
            }
            $rdr.Close()
            if ($linkRows.Count -gt 0) {
                $out += "## Sorgenti collegate (da MSysObjects, credenziali oscurate)"
                $out += "| tabella | database backend | nome remoto | connect |"
                $out += "|---|---|---|---|"
                $out += $linkRows
                $out += ""
            }
        } catch {
            $out += "_Sorgenti collegate non leggibili (permessi su MSysObjects: normale). Individuare il backend manualmente._"
            $out += ""
            Write-Warning "MSysObjects non leggibile: $($_.Exception.Message)"
        }
    }

    if ($viewNames.Count -gt 0) {
        $out += "**Query salvate (non target ETL): $($viewNames.Count)** -- $($viewNames -join ', ')"
        $out += ""
    }

    # Colonne (tutte in un colpo, poi raggruppo)
    $colsSchema = $conn.GetOleDbSchemaTable([System.Data.OleDb.OleDbSchemaGuid]::Columns, $null)

    foreach ($t in $tableNames) {
        $out += "## $t"
        if ($tableType[$t] -ne 'TABLE') { $out += "_(tabella collegata: tipo $($tableType[$t]))_" }

        # conteggio aggregato (COUNT(*) = nessun dato personale)
        if (-not $NoCounts) {
            try {
                $cmd = $conn.CreateCommand()
                $cmd.CommandText = "SELECT COUNT(*) FROM [$t]"
                $cnt = $cmd.ExecuteScalar()
                $out += "_righe: ${cnt}_"
            } catch {
                # messaggio provider NON nel file (puo' contenere path/dettagli ambiente): solo console
                $out += "_righe: (conteggio non riuscito - dettaglio sulla console del server)_"
                Write-Warning "COUNT(*) fallito su [$t]: $($_.Exception.Message)"
            }
        }

        # PRIMARY KEY (rowset Primary_Keys; gestisce PK composite via ORDINAL)
        $pkCols = @()
        try {
            $pkSchema = $conn.GetOleDbSchemaTable([System.Data.OleDb.OleDbSchemaGuid]::Primary_Keys, @($null, $null, $t))
            $pkCols = @($pkSchema | Sort-Object ORDINAL | Select-Object -ExpandProperty COLUMN_NAME)
        } catch { Write-Warning "Primary_Keys non leggibile su [$t]: $($_.Exception.Message)" }
        if ($pkCols.Count -gt 0) { $out += "_PK: $($pkCols -join ' + ')_" } else { $out += "_PK: (nessuna PK dichiarata)_" }

        # AutoNumber (SchemaOnly = zero righe lette; su tabelle LINK puo' fallire -> best-effort)
        $autoCols = @{}
        try {
            $cmdA = $conn.CreateCommand()
            $cmdA.CommandText = "SELECT * FROM [$t]"
            $rdrA = $cmdA.ExecuteReader([System.Data.CommandBehavior]::SchemaOnly)
            $st = $rdrA.GetSchemaTable()
            foreach ($r in $st.Rows) {
                $isAuto = ConvertFrom-DbValue $r['IsAutoIncrement']
                if ($isAuto -eq $true) { $autoCols[[string]$r['ColumnName']] = $true }
            }
            $rdrA.Close()
        } catch { Write-Warning "SchemaOnly non riuscito su [$t] (AutoNumber non determinabile): $($_.Exception.Message)" }

        $out += ""
        $out += "| colonna | tipo | PK | AutoNumber | nullable | lunghezza | default |"
        $out += "|---|---|---|---|---|---|---|"
        $tcols = $colsSchema | Where-Object { $_.TABLE_NAME -eq $t } | Sort-Object ORDINAL_POSITION
        foreach ($c in $tcols) {
            $colName = [string]$c.COLUMN_NAME
            $tn = Get-TypeName([int]$c.DATA_TYPE)
            $isPk = if ($pkCols -contains $colName) { 'PK' } else { '' }
            $isAuto = if ($autoCols.ContainsKey($colName)) { 'si' } else { '' }
            if ($isAuto -eq 'si' -and $tn -eq 'Long') { $tn = 'Long(AutoNumber)' }
            $nullable = if ($c.IS_NULLABLE) { 'si' } else { 'no' }
            $maxLen = ConvertFrom-DbValue $c.CHARACTER_MAXIMUM_LENGTH
            $len = if ($null -ne $maxLen -and [long]$maxLen -gt 0) { [string]$maxLen } else { '-' }
            $hasDef = ConvertFrom-DbValue $c.COLUMN_HASDEFAULT
            $defVal = ConvertFrom-DbValue $c.COLUMN_DEFAULT
            $def = if ($hasDef -eq $true -and $null -ne $defVal -and "$defVal" -ne '') { "$defVal" } else { '-' }
            $out += "| $colName | $tn | $isPk | $isAuto | $nullable | $len | $def |"
        }

        # Indici / chiavi candidate (UNIQUE): decidono la chiave di match upsert se la PK e' surrogata
        try {
            $idxSchema = $conn.GetOleDbSchemaTable([System.Data.OleDb.OleDbSchemaGuid]::Indexes, @($null, $null, $null, $null, $t))
            $idxGroups = $idxSchema | Group-Object INDEX_NAME
            if ($idxGroups.Count -gt 0) {
                $out += ""
                $out += "_Indici:_"
                foreach ($g in ($idxGroups | Sort-Object Name)) {
                    $rows = $g.Group | Sort-Object ORDINAL_POSITION
                    $cols = ($rows | Select-Object -ExpandProperty COLUMN_NAME) -join ' + '
                    $flags = @()
                    if ((ConvertFrom-DbValue $rows[0].PRIMARY_KEY) -eq $true) { $flags += 'PRIMARY' }
                    if ((ConvertFrom-DbValue $rows[0].UNIQUE) -eq $true) { $flags += 'UNIQUE' }
                    $flagStr = if ($flags.Count -gt 0) { " [$($flags -join ', ')]" } else { '' }
                    $out += "- $($g.Name)$flagStr : $cols"
                }
            }
        } catch { Write-Warning "Indexes non leggibile su [$t]: $($_.Exception.Message)" }
        $out += ""
    }

    # Relazioni / FOREIGN KEYS (solo quelle con integrita' referenziale IMPOSTA in Access:
    # le relazioni "disegnate" senza enforce NON compaiono qui - annotato per il mapping)
    try {
        $fkSchema = $conn.GetOleDbSchemaTable([System.Data.OleDb.OleDbSchemaGuid]::Foreign_Keys, $null)
        $fkRows = @($fkSchema | Where-Object { $_.FK_TABLE_NAME -notlike 'MSys*' })
        if ($fkRows.Count -gt 0) {
            $out += "## Relazioni (solo con integrita' referenziale imposta)"
            $out += "| da (FK) | a (PK) | update rule | delete rule |"
            $out += "|---|---|---|---|"
            foreach ($fk in ($fkRows | Sort-Object FK_TABLE_NAME, ORDINAL)) {
                $out += "| $($fk.FK_TABLE_NAME).$($fk.FK_COLUMN_NAME) | $($fk.PK_TABLE_NAME).$($fk.PK_COLUMN_NAME) | $(ConvertFrom-DbValue $fk.UPDATE_RULE) | $(ConvertFrom-DbValue $fk.DELETE_RULE) |"
            }
            $out += ""
            $out += "> NB: relazioni senza 'Applica integrita' referenziale' non compaiono in questo elenco."
            $out += ""
        }
    } catch { Write-Warning "Foreign_Keys non leggibile: $($_.Exception.Message)" }
} finally {
    $conn.Close()
}

# Validation rules (best-effort via DAO: stesse regole che possono RIFIUTARE gli INSERT dell'ETL).
# DAO arriva con lo stesso redistributable ACE. Solo metadati. Se DAO manca: si salta, dump gia' completo.
try {
    $dao = New-Object -ComObject DAO.DBEngine.120
    $pwdPart = if ($plainPwd) { ";PWD=$plainPwd" } else { '' }
    $db = $dao.OpenDatabase($AccdbPath, $false, $true, $pwdPart)  # read-only
    $vrLines = @()
    foreach ($td in $db.TableDefs) {
        if ($td.Name -like 'MSys*') { continue }
        if ($td.ValidationRule) { $vrLines += "- **$($td.Name)** (tabella): ``$($td.ValidationRule)``" }
        foreach ($f in $td.Fields) {
            if ($f.ValidationRule) { $vrLines += "- $($td.Name).$($f.Name): ``$($f.ValidationRule)``" }
        }
    }
    $db.Close()
    if ($vrLines.Count -gt 0) {
        $out += "## Validation rules (possono rifiutare INSERT/UPDATE dell'ETL)"
        $out += $vrLines
        $out += ""
    }
} catch {
    Write-Warning "Validation rules non estratte (DAO non disponibile o DB protetto): $($_.Exception.Message)"
}

# UTF-8 SENZA BOM su entrambe le shell (Set-Content -Encoding UTF8 su PS 5.1 mette il BOM)
[System.IO.File]::WriteAllText($OutFile, (($out -join "`r`n") + "`r`n"), (New-Object System.Text.UTF8Encoding($false)))
Write-Host "OK - schema scritto in: $OutFile"
Write-Host "Tabelle trovate: $($tableNames.Count). Incolla il contenuto del file .md in chat (e' solo schema, privacy-safe)."
