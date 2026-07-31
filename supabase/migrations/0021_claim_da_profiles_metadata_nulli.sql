-- Migration 0021 — la derivazione del claim regge anche a metadata NULL
-- (goal partner-identita, seguito della 0020 — trovato da un critico avversariale il 2026-07-31)
--
-- IL CASO, ed è piccolo da scrivere e brutto da subire. In `allinea_claim_da_profiles_di`
-- (0020 §2a) lo stato nuovo si calcola così:
--
--     (u.raw_user_meta_data - 'preferred_username' - 'country') || jsonb_strip_nulls(...)
--
-- `auth.users.raw_user_meta_data` è **nullable e senza default** — verificato su
-- `pg_attribute` del database vivo il 2026-07-31, non dedotto dallo schema di GoTrue. Se per
-- una riga vale NULL, l'intera espressione è NULL (qualunque operando NULL propaga), quindi
-- `v_nuovo` è NULL, la guardia `raw_user_meta_data is distinct from v_nuovo` è FALSA
-- (NULL non è distinto da NULL) e l'update **non tocca nessuna riga**.
--
-- Perché è grave e non solo inelegante: non fallisce, non alza un warning, non lascia
-- traccia. Per quell'utente i claim non vengono mai derivati — e `name`, a differenza degli
-- altri due, se manca **non viene omesso**: il server auth ci mette l'EMAIL dell'account.
-- Per un utente con «Accedi con Apple» che nasconde la mail, al partner arriverebbe l'alias
-- `@privaterelay.appleid.com`. È esattamente la fuga che la 0020 esiste per chiudere,
-- riaperta da un caso di bordo.
--
-- QUANTO È VICINO OGGI: **zero utenti** hanno `raw_user_meta_data` NULL (contato sul
-- database vivo il 2026-07-31). È un rischio latente, non un guasto in atto — e si chiude
-- con una parola.
--
-- PERCHÉ UNA MIGRATION NUOVA E NON UNA CORREZIONE DELLA 0020: la 0020 è **applicata in
-- produzione** dal 2026-07-31 (`20260731152655`), e le migration applicate non si
-- riscrivono — regola di questo progetto, scritta dopo l'errore del 2026-07-29. Chi legge la
-- 0020 fra sei mesi deve trovarla com'è stata eseguita, e questo file accanto.
--
-- COSA NON CAMBIA: tutto il resto del corpo è identico alla 0020 §2a, riga per riga —
-- comprese la guardia sullo stato calcolato (la forma che rende la terminazione vera per
-- costruzione) e l'exception best-effort. L'unica differenza è il `coalesce`.
--
-- RIESEGUIBILE: `create or replace` puro, nessun trigger toccato (restano quelli della
-- 0020, che puntano a questa stessa funzione per nome).
--
-- ROLLBACK: riapplicare il §2a della 0020 così com'è.

create or replace function public.allinea_claim_da_profiles_di(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- Identico alla 0020: `preferred_username` perché il brief promette al partner che è unico
  -- e conforme (garanzie che vivono su `profiles`), `country` perché viaggia verso di loro e
  -- la persona lo può cambiare da «modifica profilo» senza che nessuno risincronizzi.
  v_nickname text;
  v_country  text;
  -- `name` non si comporta come gli altri due: se la chiave manca il server auth NON omette
  -- il claim, ci mette l'EMAIL dell'account. ⇒ si SOVRASCRIVE quando c'è un nome vero, non
  -- si CANCELLA mai. Composizione identica a `buildDisplayName` (`displayName.ts:37`):
  -- cambiarle INSIEME (il rimando all'indietro è ora scritto anche là).
  v_nome     text;
  v_nuovo    jsonb;
begin
  select p.nickname,
         nullif(btrim(p.country), ''),
         nullif(btrim(concat_ws(' ', nullif(btrim(p.first_name), ''),
                                     nullif(btrim(p.last_name),  ''))), '')
    into v_nickname, v_country, v_nome
    from public.profiles p
   where p.id = p_user_id;

  -- 🔴 L'UNICA DIFFERENZA DALLA 0020, ed è il `coalesce`. Senza, una riga con
  -- `raw_user_meta_data` NULL rende NULL l'intero calcolo: la guardia qui sotto diventa
  -- falsa (NULL non è distinto da NULL), l'update non tocca niente e la derivazione tace
  -- **senza errore**. Trattare l'assenza di metadata come un oggetto vuoto è anche la
  -- lettura giusta del dominio: «questo utente non ha ancora metadata» e «questo utente ha
  -- metadata vuoti» sono la stessa cosa per chi deve derivarne i claim.
  select (coalesce(u.raw_user_meta_data, '{}'::jsonb)
            - 'preferred_username' - 'country')
         || jsonb_strip_nulls(jsonb_build_object(
              'preferred_username', v_nickname,
              'country',            v_country))
         || case when v_nome is null then '{}'::jsonb
                 else jsonb_build_object('name', v_nome) end
    into v_nuovo
    from auth.users u
   where u.id = p_user_id;

  update auth.users u
     set raw_user_meta_data = v_nuovo
   where u.id = p_user_id
     -- La guardia confronta lo stato ATTUALE col risultato GIÀ CALCOLATO, non con i singoli
     -- valori attesi: dopo un update la condizione è falsa per costruzione, e la catena di
     -- trigger si spegne sempre al giro dopo. Forma invariata dalla 0020 di proposito — è
     -- ciò che rende impossibile, non improbabile, la ricorsione fra i due presidi.
     -- NB: ora è anche l'unica riga che può ancora vedere un NULL a sinistra, ed è corretto
     -- così — se i metadata sono NULL e `v_nuovo` no, i due sono distinti e l'update parte.
     and u.raw_user_meta_data is distinct from v_nuovo;
exception
  when insufficient_privilege then
    raise warning 'allinea_claim_da_profiles_di: nessun privilegio di UPDATE su auth.users, claim non allineati per %', p_user_id;
end;
$$;

revoke execute on function public.allinea_claim_da_profiles_di(uuid)
  from public, anon, authenticated;

-- Backfill: idempotente e a costo zero sulle righe già allineate (la guardia è dentro).
-- Serve per l'utente che avesse i metadata NULL oggi — oggi nessuno, ma il giorno in cui
-- questa migration viene applicata la risposta potrebbe essere diversa, e ripetere il giro
-- costa una riga.
select public.allinea_claim_da_profiles_di(id) from auth.users;
