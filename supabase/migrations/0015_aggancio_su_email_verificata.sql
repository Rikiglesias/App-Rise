-- Migration 0015 — l'archivio si aggancia a un indirizzo VERIFICATO, non a uno dichiarato
--
-- LA FALLA (trovata da un audit avversariale il 2026-07-27 e riprodotta dal vivo su una
-- copia usa-e-getta del database, tutti e tre gli esiti confermati).
--
-- La 0012 collega una persona alla sua scheda d'archivio confrontando
-- `profiles.contact_email`. Ma quel campo **lo scrive la persona stessa** dal proprio
-- profilo, e nessuno verifica che le appartenga: `profiles_contact_email_chk` (0009)
-- controlla la FORMA dell'indirizzo, non la PROPRIETÀ. Quindi bastava scrivere
-- l'indirizzo di qualcun altro per:
--   ① **leggersi i suoi dati** — il trigger precompila telefono, città e provincia
--      dell'altra persona dentro il proprio profilo;
--   ② **rubargli la scheda** — `claimed_by` passa a chi ha scritto l'indirizzo, e la
--      vera interessata, quando si registrerà, non troverà più niente. In silenzio:
--      nessun errore, nessun avviso, e lei non ha un account con cui accorgersene;
--   ③ **cancellargliela** — `purge_legacy_contact` cancella per `old.contact_email`, e
--      un profilo si può cancellare da sé (policy `own_delete`).
-- Ripetibile all'infinito con un solo account, cambiando indirizzo ogni volta.
--
-- PERCHÉ NON ERA VISIBILE. Tutte e tre le strade passano da codice corretto rispetto a
-- ciò che era scritto: il difetto non è in una riga sbagliata, è nell'aver scelto come
-- CHIAVE un campo che è un RECAPITO. Un recapito lo si dichiara; una chiave dev'essere
-- provata. La 0011 rende la cosa non ovvia, perché per chi si registra con email e
-- password scrive lei `contact_email` = mail dell'account: lì i due valori coincidono, e
-- guardando quel percorso sembra tutto a posto. Si separano appena la persona modifica il
-- campo dal profilo — che è esattamente ciò che il campo serve a fare.
--
-- QUANDO SI ARMA. Oggi mai: `legacy_contacts` è vuota (0 righe, verificato) e i profili
-- sono 0. Si arma **nell'istante in cui carichiamo le 1352 anagrafiche**, e il
-- caricamento per il nostro stesso piano precede il primo rilascio. Le persone esposte
-- sarebbero quelle che da noi non hanno ancora un account: le meno in grado di accorgersi.
--
-- IL RIMEDIO. La chiave diventa `auth.users.email`, cioè l'indirizzo con cui la persona
-- ha fatto l'accesso — verificato per costruzione, perché da noi si entra solo dopo aver
-- confermato la mail. Nessuno può dichiararlo: o lo possiede o non entra.
--
-- COSA SI PERDE, dichiarato. Chi ha nell'archivio un indirizzo DIVERSO da quello con cui
-- si registra non si aggancia più nemmeno scrivendolo a mano nel profilo. Non è una
-- perdita reale: quella strada non era un modo legittimo di ricongiungersi, era il buco.
-- Il caso resta il residuo già dichiarato nella 0012 (§4) e si chiude con la passata di
-- riconciliazione, che è il posto giusto — lì le collisioni di indirizzo si vedono tutte
-- insieme e si decidono, invece di essere concesse a chiunque una alla volta.
--
-- SCARTATO: tenere `contact_email` come chiave aggiungendo un controllo «questo indirizzo
-- non è di nessun altro». Non chiude nulla — l'archivio contiene persone che da noi un
-- account non ce l'hanno, quindi il loro indirizzo non risulterebbe «di qualcun altro» e
-- resterebbe rubabile. Peggio: darebbe l'impressione di aver chiuso il buco.
--
-- ORDINE DI RILASCIO: dopo la 0014 (sostituisce di nuovo il corpo delle stesse funzioni).
-- 🔴 **VA APPLICATA PRIMA DEL CARICAMENTO DELLE ANAGRAFICHE**, non prima del rilascio
-- dell'app: è il caricamento che arma la falla.
-- RIESEGUIBILE: solo `create or replace function` + `revoke`.
-- ROLLBACK: riapplicare i corpi della 0014. Sconsigliato — riapre le tre strade.

-- ---------------------------------------------------------------------------
-- 1. L'aggancio: chiave = indirizzo dell'account
-- ---------------------------------------------------------------------------
create or replace function public.claim_legacy_contact()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- La chiave NON è più `new.contact_email` (dichiarato) ma l'indirizzo dell'account
  -- (verificato). `new.id` è l'utente che sta creando il profilo: RLS non c'entra,
  -- perché la funzione è security definer e legge una riga sola, la sua.
  v_key text;
  v_legacy public.legacy_contacts;
begin
  select lower(btrim(u.email)) into v_key
    from auth.users u
   where u.id = new.id;

  if v_key is null
     or v_key = ''
     or v_key like '%@privaterelay.appleid.com' then
    return new;
  end if;

  update public.legacy_contacts
     set claimed_by = new.id,
         claimed_at = now()
   where email_norm = v_key
     and claimed_by is null
  returning * into v_legacy;

  -- Da qui in giù è identico alla 0014: si riempiono solo le colonne rimaste vuote,
  -- «vuota» vale NULL o stringa vuota da entrambi i lati, e la provincia si colma solo
  -- fra italiani. Le ragioni stanno là e non si ricopiano, per non farle divergere.
  if v_legacy.id is not null then
    if nullif(btrim(new.phone), '') is null
       and nullif(btrim(v_legacy.phone), '') is not null then
      new.phone := v_legacy.phone;
    end if;

    if nullif(btrim(new.city), '') is null
       and nullif(btrim(v_legacy.city), '') is not null then
      new.city := v_legacy.city;
    end if;

    if coalesce(nullif(btrim(new.country), ''), 'IT') = 'IT'
       and coalesce(nullif(btrim(v_legacy.country), ''), 'IT') = 'IT'
       and nullif(btrim(new.province), '') is null
       and nullif(btrim(v_legacy.province), '') is not null then
      new.province := v_legacy.province;
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function public.claim_legacy_contact() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. L'oblio: stessa chiave, stessa ragione
-- ---------------------------------------------------------------------------
-- Il ramo ② cancellava per `old.contact_email`, quindi con un indirizzo dichiarato si
-- cancellava la riga di chiunque. Ora usa l'indirizzo dell'account.
-- Il ramo ① (righe rivendicate) non cambia: `claimed_by` è già una chiave interna, e
-- dopo il §1 non può più essere stata ottenuta dichiarando l'indirizzo di un altro.
create or replace function public.purge_legacy_contact()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text;
begin
  delete from public.legacy_contacts where claimed_by = old.id;

  -- ⚠️ QUI L'EMAIL NON SEMPRE C'È, e la prima stesura di questa migration ci è cascata:
  -- assumevo che «sulla cascata i figli si cancellano mentre il padre c'è». **Falso**, e
  -- l'ha preso T19 della suite 0012 (rosso al primo giro). Quando si cancella l'account,
  -- la riga di `auth.users` non è più leggibile da qui, quindi la chiave resta NULL.
  -- La scelta prudente — non ripiegare su `old.contact_email`, che rimetterebbe la falla
  -- proprio nel ramo che CANCELLA — è giusta ma da sola lascia sopravvivere la riga
  -- storica di chi ha chiesto la cancellazione: un obbligo mancato.
  -- → Il percorso «cancella account» è coperto dal trigger del §3, che l'email ce l'ha.
  --   Qui resta coperto «cancella solo il profilo» (`own_delete`), dove l'utente c'è.
  select lower(btrim(u.email)) into v_key
    from auth.users u
   where u.id = old.id;

  if v_key is not null and v_key <> '' then
    delete from public.legacy_contacts
     where email_norm = v_key
       and claimed_by is null;
  end if;
  return old;
end;
$$;

revoke execute on function public.purge_legacy_contact() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. L'oblio sul percorso «cancella account», dove l'indirizzo è ancora in mano
-- ---------------------------------------------------------------------------
-- Serve perché il trigger del §2 vive su `profiles` e, quando la cancellazione parte da
-- `auth.users`, la riga dell'utente non è più leggibile da lì: la chiave resta NULL e la
-- scheda storica di chi ha chiesto di sparire sopravviverebbe. Prima della 0015 non si
-- notava, perché la chiave era `old.contact_email` — un campo di `profiles`, sempre
-- presente. Spostare la chiave su un indirizzo verificato ha reso visibile che i due
-- percorsi di cancellazione hanno bisogno di due punti di aggancio diversi.
--
-- Qui l'email è `old.email` della riga che si sta cancellando: verificata per
-- costruzione e disponibile, senza doverla andare a cercare.
--
-- BEFORE DELETE e non AFTER: dopo, la cascata su `claimed_by` avrebbe già portato via le
-- righe rivendicate, ma quelle MAI rivendicate non hanno cascata — e sono esattamente
-- quelle di cui si occupa questo trigger. Farlo prima le raggiunge entrambe senza
-- dipendere dall'ordine.
--
-- `claimed_by is null` è la stessa guardia del §2: la riga che un'altra persona ha
-- legittimamente rivendicato non sparisce perché costei si cancella — quella la porta via
-- la cascata, al momento suo.
create or replace function public.purge_legacy_on_user_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text := lower(btrim(old.email));
begin
  if v_key is not null and v_key <> '' then
    -- Protetto come i gemelli della 0013: `legacy_contacts` è di un'altra migration, e
    -- se questa girasse senza la 0012 (o dopo un suo rollback) ogni cancellazione di
    -- account morirebbe su «relation does not exist» — cioè non si potrebbe più
    -- cancellare un account, che è peggio del problema che stiamo risolvendo.
    begin
      delete from public.legacy_contacts
       where email_norm = v_key
         and claimed_by is null;
    exception when undefined_table then
      return old;
    end;
  end if;
  return old;
end;
$$;

revoke execute on function public.purge_legacy_on_user_delete() from public, anon, authenticated;

drop trigger if exists on_auth_user_purge_legacy on auth.users;
create trigger on_auth_user_purge_legacy
  before delete on auth.users
  for each row execute procedure public.purge_legacy_on_user_delete();
