-- Migration 0012 — legacy_contacts: dove atterrano le anagrafiche storiche (F-EMAIL.24)
--
-- IL PROBLEMA. Prima del primo rilascio va importato l'archivio delle anagrafiche
-- già raccolte. In `profiles` non c'è posto: `id` è FK su `auth.users`, e
-- `first_name/last_name/birth_date/privacy_consent_at/country` sono NOT NULL
-- (0001 + 0007, riverificati alla fonte). Un record storico non ha un account —
-- e F-EMAIL.6② vieta di creargliene uno (mandare «reimposta la password» a chi non
-- si è mai registrato è una email non richiesta, e gli farebbe scoprire da lì di
-- avere un account nostro). Serve quindi una tabella di appoggio separata, più il
-- meccanismo che aggancia il record alla persona QUANDO si registra da sé.
--
-- COSA FA, in due pezzi:
--   1. `public.legacy_contacts` — l'archivio importato, con tutti i campi nullable
--      tranne la chiave di aggancio e la provenienza.
--   2. l'aggancio dentro `handle_new_user`: alla nascita di un profilo si cerca la
--      riga storica con la stessa email, si riempiono SOLO le colonne che il nuovo
--      profilo ha lasciato vuote, e la riga si marca come rivendicata.
--
-- I CONSENSI NON SI EREDITANO (Art. 7). La riga storica precompila dei dati; non
-- porta con sé un consenso. `privacy_consent_at` e `consent_events` restano quelli
-- raccolti alla registrazione, e questa migration non li tocca in nessun ramo.
--
-- DIPENDENZA LEGALE DICHIARATA (F-EMAIL.25, domanda aperta a Riccardo): se le
-- anagrafiche vengono dal NOSTRO archivio è un riordino interno; se venissero da un
-- export del partner sarebbe un trasferimento fra titolari, con Art. 14 e consensi
-- non trasferibili. Questo codice è indifferente alla risposta *per costruzione*:
-- finché nessuno importa righe, la tabella è vuota e il trigger si comporta
-- esattamente come prima. La decisione blocca l'IMPORT, non questa migration.
--
-- BASE DI PARTENZA DEL TRIGGER = la versione della 0011, non la 0007 e non la 0004.
-- È la stessa trappola già costata un giro: `contact_email` e la guardia relay sono
-- arrivate con la 0011, `country`/`nullif(province,'')` con la 0007. Ripartire da un
-- corpo vecchio le cancellerebbe in silenzio.
--
-- L'OBLIO ARRIVA ANCHE QUI. `claimed_by` è `on delete cascade`, non `set null` come
-- ipotizzato in fase di design: quando la persona cancella l'account, la sua riga
-- storica sparisce con lui. Il motivo del cambio è che con `set null` la
-- cancellazione andrebbe fatta dal trigger `on_profile_deleted`, che però legge
-- `claimed_by` mentre PostgreSQL sta già eseguendo le azioni FK sulle altre tabelle
-- che puntano allo stesso `auth.users` — l'ordine fra quelle azioni non è garantito,
-- quindi il trigger potrebbe trovare la colonna già azzerata e non cancellare nulla,
-- in silenzio. La cascata non ha ordini da rispettare. Nota: `legacy_contacts` è la
-- tavola di STAGING dell'import, non l'archivio contabile (che resta su Access con
-- la sua retention fiscale) → cancellarla non intacca obblighi di conservazione.
--
-- RESIDUO DICHIARATO (non risolto qui): le righe MAI rivendicate non hanno una
-- scadenza. Sono dati personali di persone che non si registreranno mai, e prima o
-- poi vogliono una retention. Query per contarle:
--   select count(*) from public.legacy_contacts where claimed_by is null;
--
-- RIESEGUIBILE: `create table if not exists` + `create or replace function` +
-- `drop trigger if exists` + `revoke` sono tutti no-op alla seconda esecuzione.
-- Rollback: `drop table public.legacy_contacts cascade;` e riapplicare la 0011.
--
-- ORDINE DI RILASCIO: nessun vincolo. È additiva e retro-compatibile — a tabella
-- vuota il comportamento del signup è identico a quello di oggi.

-- ---------------------------------------------------------------------------
-- 1. La tabella
-- ---------------------------------------------------------------------------
create table if not exists public.legacy_contacts (
  id            uuid primary key default gen_random_uuid(),

  -- Chiave di aggancio: l'unico dato che la persona riuserà al momento di
  -- registrarsi. Normalizzata perché 'Mario@x.it' e 'mario@x.it' sono la stessa
  -- persona, e due righe che non si riconoscono sono esattamente il difetto che
  -- tutto questo lavoro esiste per evitare.
  email_norm    text not null unique,

  -- Tutti nullable DI PROPOSITO: un archivio storico è incompleto per definizione,
  -- e pretendere qui i vincoli di `profiles` significherebbe scartare proprio le
  -- righe che si vogliono recuperare.
  first_name    text,
  last_name     text,
  phone         text,
  city          text,
  province      text,
  country       text,
  birth_date    date,

  source        text not null,   -- da dove viene ('access', …): serve a sapere cosa cancellare
  raw           jsonb,           -- il record originale, per non perdere nulla nell'import
  imported_at   timestamptz not null default now(),

  -- Aggancio: chi ha rivendicato questa riga registrandosi con quella email.
  claimed_by    uuid references auth.users(id) on delete cascade,
  claimed_at    timestamptz,

  -- La normalizzazione va IMPOSTA, non sperata: una riga importata con maiuscole o
  -- spazi non verrebbe mai agganciata, e il fallimento sarebbe invisibile (nessun
  -- errore, semplicemente lo storico non si collega). Meglio che l'import muoia
  -- rumorosamente sulla riga sbagliata.
  constraint legacy_contacts_email_norm_normalizzata
    check (email_norm = lower(btrim(email_norm)) and email_norm <> ''),

  -- `claimed_by` e `claimed_at` si muovono insieme: una riga rivendicata senza data
  -- (o viceversa) è uno stato che nessun percorso deve poter produrre.
  constraint legacy_contacts_claim_coerente
    check ((claimed_by is null) = (claimed_at is null))
);

-- Senza indice sulla colonna che porta la FK, ogni cancellazione di account fa una
-- scansione completa di questa tabella per eseguire la cascata (PostgreSQL non
-- indicizza automaticamente il lato referenziante).
create index if not exists legacy_contacts_claimed_by_idx
  on public.legacy_contacts (claimed_by);

-- ---------------------------------------------------------------------------
-- 2. Accesso: nessuno, tranne il service_role
-- ---------------------------------------------------------------------------
-- Sono dati di persone che NON hanno un account e non hanno acconsentito a nulla
-- presso di noi. Una policy di lettura «per email» trasformerebbe la tabella in un
-- servizio di interrogazione su chiunque: chi conosce un indirizzo scoprirebbe se
-- quella persona è nel nostro archivio, e con quali dati. Quindi RLS attiva e
-- NESSUNA policy: ci arrivano solo il trigger (security definer) e il service_role.
-- Il revoke non è ridondante rispetto a RLS: se il progetto ha default privileges
-- permissivi sulle tabelle nuove, i ruoli client li erediterebbero in silenzio.
alter table public.legacy_contacts enable row level security;
revoke all on public.legacy_contacts from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. L'aggancio alla nascita del profilo
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb := new.raw_user_meta_data;
  v_version text;
  v_marketing boolean := coalesce((v_meta->>'marketing_consent')::boolean, false);
  -- La mail dell'account vale come recapito solo se è un indirizzo vero: un alias
  -- Apple Private Relay non è la mail della persona e non deve finire in colonna.
  v_account_email text := case
    when new.email like '%@privaterelay.appleid.com' then null
    else new.email
  end;
  v_contact_email text := coalesce(
    nullif(v_meta->>'contact_email', ''),
    v_account_email
  );
  v_legacy public.legacy_contacts;
begin
  -- Marker del form email: birth_date è sempre presente nel signup email, mai nel social.
  if v_meta ? 'birth_date' then
    insert into public.profiles (
      id, first_name, last_name, phone, city, province, country,
      birth_date, privacy_consent_at, marketing_consent, contact_email
    )
    values (
      new.id,
      v_meta->>'first_name',
      v_meta->>'last_name',
      v_meta->>'phone',
      v_meta->>'city',
      nullif(v_meta->>'province', ''),
      coalesce(nullif(v_meta->>'country', ''), 'IT'),
      (v_meta->>'birth_date')::date,
      now(),
      v_marketing,
      v_contact_email
    );

    -- Versione informativa = ultima pubblicata (server-trusted, non client-supplied).
    select version into v_version
    from public.policy_versions
    order by published_at desc
    limit 1;

    insert into public.consent_events
      (user_id, purpose, action, policy_version, legal_basis, channel)
    values
      (new.id, 'privacy_notice', 'granted', v_version, 'consent', 'signup');

    if v_marketing then
      insert into public.consent_events
        (user_id, purpose, action, policy_version, legal_basis, channel)
      values
        (new.id, 'marketing', 'granted', v_version, 'consent', 'signup');
    end if;

    -- Aggancio all'anagrafica storica (F-EMAIL.24).
    -- `and claimed_by is null` è la guardia che rende l'operazione ripetibile e che
    -- impedisce di strappare una riga già rivendicata da qualcun altro.
    if v_contact_email is not null then
      update public.legacy_contacts
         set claimed_by = new.id,
             claimed_at = now()
       where email_norm = lower(btrim(v_contact_email))
         and claimed_by is null
      returning * into v_legacy;

      -- Si riempiono SOLO le colonne rimaste vuote: ciò che la persona ha appena
      -- scritto nel form vince sempre sull'archivio. Dopo la 0010 le uniche
      -- nullable che l'archivio può colmare sono queste tre — `birth_date`,
      -- `first_name`, `last_name` e `country` arrivano obbligatorie dal form, e
      -- sovrascriverle con un dato vecchio sarebbe una regressione, non un recupero.
      if v_legacy.id is not null then
        update public.profiles
           set phone    = coalesce(phone,    v_legacy.phone),
               city     = coalesce(city,     v_legacy.city),
               province = coalesce(province, v_legacy.province)
         where id = new.id;
      end if;
    end if;
  end if;

  return new;
end;
$$;

-- Come 0006/0011: niente superficie RPC (il trigger fira comunque senza il grant).
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
