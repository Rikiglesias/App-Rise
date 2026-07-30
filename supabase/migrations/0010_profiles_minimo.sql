-- Migration 0010 — profilo MINIMO alla nascita (goal partner-identita, P2 pezzo (a))
--
-- Decisione D-a di Riccardo: «servono tutti quei dati, prima o poi» → profilo minimo
-- alla nascita + completamento OBBLIGATORIO differito. Questa migration è solo la
-- CONDIZIONE TECNICA di quel disegno, non il provvedimento: *nullable ≠ opzionale per
-- sempre*. Senza il meccanismo applicativo che chiede i campi mancanti alla prima
-- occasione utile, «prima o poi» diventa «mai» — il meccanismo è il pezzo (b) di P2.
--
-- Perché ora: con l'invariante I7 (un solo ingresso sul nostro tenant Let's Donation)
-- il nostro form di registrazione diventa il SOLO cancello, anche per chi voleva solo
-- una gift card. Oggi chiede 11 voci obbligatorie contro le 4 del form nativo di LD:
-- è l'imbuto che ucciderebbe la richiesta stessa che stiamo facendo a loro.
--
-- Cosa NON diventa nullable, e perché:
--   first_name / last_name  → il claim OIDC `name` verso i partner nasce da qui;
--   birth_date              → è la prova del requisito di età (validation.ts), non è
--                             un dato anagrafico rinunciabile. ⚠️ La soglia era 18 quando
--                             questa riga è stata scritta; dalla 0019 è 14, ma il motivo
--                             per cui la colonna resta obbligatoria non cambia — ed è
--                             anche il marcatore che fa nascere il profilo;
--   country                 → il trigger handle_new_user lo valorizza sempre
--                             (coalesce → 'IT', migration 0007), quindi il NOT NULL
--                             non è mai un ostacolo alla nascita del profilo;
--   privacy_consent_at      → senza consenso il profilo non deve nascere affatto.
--
-- ATTENZIONE ALL'ORDINE DI RILASCIO: il codice dell'app che smette di inviare
-- phone/city NON può andare in produzione prima che questa migration sia applicata,
-- altrimenti l'insert del trigger viola il NOT NULL e la registrazione FALLISCE.
-- Prima la migration, poi il form leggero.
--
-- RIESEGUIBILE (come 0003/0005/0008/0009): `drop not null` su una colonna già
-- nullable è un no-op, non un errore. Rollback (solo su dati senza null, altrimenti
-- Postgres rifiuta — ed è giusto così):
--   alter table public.profiles alter column phone set not null;
--   alter table public.profiles alter column city  set not null;
--
-- NB: non tocca RLS né grant (la own_update di 0001 copre già queste colonne) e non
-- tocca consent_events. `province` era già nullable dalla 0007 (paesi esteri).

alter table public.profiles
  alter column phone drop not null;

alter table public.profiles
  alter column city drop not null;
