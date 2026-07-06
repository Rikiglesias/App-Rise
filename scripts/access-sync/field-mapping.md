# access-sync — mapping campi Supabase → Access (T1)

> Lato SORGENTE (Supabase) verificato dalle migrations `supabase/migrations/0001..0007` (SSOT, 2026-07-07).
> Lato DESTINAZIONE (Access) = **TBD**: si compila coi nomi/tipi reali dallo schema estratto con
> `dump-access-schema.ps1`. Finché il target è vuoto, T1 non è chiuso (bloccante user-only).

## Semantica sync per tabella
| Tabella | Chiave upsert | Watermark (delta) | Cancellazioni | Modo |
|---|---|---|---|---|
| `profiles` | `id` (uuid→testo) | `updated_at` (auto via trigger `set_updated_at`) | `deletion_requested_at` non-null → anonimizza/cancella nel master | UPSERT (Access: UPDATE→INSERT-if-absent, niente MERGE) |
| `consent_events` | `id` (uuid→testo) | `created_at` (ledger append-only, mai UPDATE) | solo cascade a chiusura account | INSERT-only dei nuovi eventi |
| `policy_versions` | `version` (testo) | `published_at` | — | UPSERT (tabella piccola) |

## profiles — sorgente (13 colonne)
| Supabase col | Tipo PG | Note | → Access col (TBD) |
|---|---|---|---|
| id | uuid PK | chiave upsert (come testo in Access) | |
| first_name | text NOT NULL | | |
| last_name | text NOT NULL | | |
| phone | text NOT NULL | | |
| city | text NOT NULL | | |
| province | text NULL | nullable da 0007 (estero) | |
| country | text NOT NULL def 'IT' | ISO 3166-1 alpha-2 (da 0007) | |
| birth_date | date NOT NULL | | |
| privacy_consent_at | timestamptz NOT NULL | | |
| marketing_consent | boolean NOT NULL def false | CACHE stato corrente (verità = consent_events) | |
| created_at | timestamptz NOT NULL | | |
| updated_at | timestamptz NOT NULL | **watermark delta** | |
| deletion_requested_at | timestamptz NULL | **segnale erasure** (non-null → programma cancellazione +30gg) | |

## consent_events — sorgente (8 colonne, append-only)
| Supabase col | Tipo PG | Note | → Access col (TBD) |
|---|---|---|---|
| id | uuid PK | | |
| user_id | uuid NOT NULL | FK profiles/auth.users | |
| purpose | text NOT NULL | check: privacy_notice\|marketing\|profiling | |
| action | text NOT NULL | check: granted\|withdrawn | |
| policy_version | text NOT NULL | FK policy_versions.version | |
| legal_basis | text NOT NULL | 'consent'\|'contract' | |
| channel | text NOT NULL | es. 'ios:signup' | |
| created_at | timestamptz NOT NULL | **watermark** | |

## policy_versions — sorgente (4 colonne)
| Supabase col | Tipo PG | Note | → Access col (TBD) |
|---|---|---|---|
| version | text PK | chiave upsert | |
| body | text NULL | testo/url archiviato | |
| is_material | boolean NOT NULL def true | | |
| published_at | timestamptz NOT NULL | | |

## Cosa manca per chiudere T1 (da `dump-access-schema.ps1` sul server)
1. Nomi/tipi reali delle tabelle Access destinazione → riempire la colonna "→ Access col".
2. Conferma quali tabelle Access ricevono cosa (una tab per tabella Supabase? tab unica denormalizzata?).
3. Tipo Access per la chiave `id` (uuid → Short Text 38, o GUID/ReplicationID?): decide il confronto upsert.

## Note ETL (grounded, per T2 a sblocco)
- Access NON ha `MERGE`/UPSERT nativo → upsert = `UPDATE ... WHERE id=?; if @@ROWCOUNT=0 INSERT`. Parametrizzare (pyodbc `?`), MAI concatenare stringhe (donatori = dati personali + iniezione).
- Watermark persistito in un file/tabellina di stato sul server (es. `last_sync.json`: max updated_at per tabella) → 2ª run solo delta.
- Boolean PG → Access Yes/No; timestamptz → Date/Time (UTC→ora locale? decidere e fissare, GDPR log preferisce UTC).
- Erasure: `deletion_requested_at` non-null → nel master anonimizza (o marca) invece di lasciare il dato; definire con l'org se hard-delete o tombstone.
