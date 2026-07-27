-- Migration 0014 — l'aggancio allo storico non deve né saltare né scrivere il dato sbagliato
--
-- Nasce da un critico avversariale sulla 0012/0013 (F-GUARD, 2026-07-27). Dei quattro
-- rilievi sulle migration, DUE erano veri e sono chiusi qui; il terzo era un test
-- scritto male (sta nella suite); il quarto era una lettura sbagliata, e la nota in
-- fondo spiega perché — serve a non «ri-correggere» in futuro una cosa che va bene.
--
-- ---------------------------------------------------------------------------
-- ① IL CAMPO VUOTO NON È UN CAMPO PIENO  (era: «il coalesce non scatta mai»)
-- ---------------------------------------------------------------------------
-- `claim_legacy_contact` (0012) colma le colonne rimaste vuote con il dato storico
-- usando `coalesce(new.phone, v_legacy.phone)`. `coalesce` guarda il NULL, e nient'altro.
-- Ma una stringa VUOTA non è NULL: `coalesce('', 'x')` vale `''`.
--
-- Chi manda `''`: qualunque form che invii il campo sempre, anche quando la persona non
-- l'ha compilato. Dall'app oggi non capita — `phone` e `city` sono obbligatori in
-- ENTRAMBI i suoi percorsi (`validation.ts:76-79` per il signup, `:141-144` per il
-- profilo), quindi arrivano pieni e non c'è niente da colmare.
-- ⚠️ Il vuoto arriva da DUE parti, e la prima è già qui:
--   ① **dall'archivio** — l'export del partner non scrive NULL nelle celle vuote, scrive
--      stringhe VUOTE. Nel file del 2026-07-27 (1352 persone) mancano il paese su 162
--      righe, la provincia su 1330, il telefono su 456. Questo è REALE OGGI, ed è il
--      motivo per cui il §1 tratta il vuoto su entrambi i lati e non solo sul profilo.
--   ② **dal profilo**, quando esisterà la registrazione LEGGERA (il metadato non
--      conterrà affatto la chiave → `->>` darà NULL). È il percorso per cui la 0010 ha
--      reso quelle colonne nullable, e per cui la 0012 esiste — ma il pezzo applicativo
--      **non è ancora stato scritto** (`0010:5-7`). Finché non c'è, dall'app l'unico ramo
--      davvero esercitato è quello della `province` (`useProfileForm.ts:294` la mette a
--      NULL per l'estero).
--
-- Quindi perché toccarlo. Perché la difesa è asimmetrica e la prossima persona che scrive
-- un form non lo sa: già dentro la 0011 `province` e `country` passano da `nullif(…, '')`
-- e `phone`/`city` no (`0011:81-84`). Il giorno in cui il form web mandasse `phone: ''`
-- invece di omettere la chiave, la precompilazione dallo storico smetterebbe di
-- funzionare **in silenzio**: nessun errore, nessun log, solo una persona che non vede i
-- propri dati. Un difetto che non fa rumore non viene trovato: si previene o si paga.
--
-- ---------------------------------------------------------------------------
-- ② LA PROVINCIA È UN DATO ITALIANO, E VENIVA SCRITTA ANCHE AGLI ALTRI  (bug vero)
-- ---------------------------------------------------------------------------
-- `new.province := coalesce(new.province, v_legacy.province)` non guarda il paese.
-- L'app mette `province` a NULL **apposta** per chi risiede all'estero
-- (`useProfileForm.ts:294`: `country === 'IT' ? province.trim() : null`), e la
-- completezza del profilo la pretende solo per l'Italia (`profileCompletion.ts:59-61`).
-- Il trigger invece leggeva quel NULL come «campo da colmare» e ci scriveva la provincia
-- della riga storica: a un residente in Francia finiva in colonna `VR`.
-- Il rimedio guarda ENTRAMBI i lati — il profilo che nasce e la riga storica — perché
-- chiudere solo il primo lascerebbe aperta la variante speculare (riga storica estera
-- con una provincia sua, agganciata a un profilo italiano). Sulle righe storiche prive
-- di `country` si assume l'Italia: l'import viene dall'archivio dell'associazione, dove
-- l'assenza del campo significa «italiano», non «sconosciuto». È un'assunzione, ed è
-- scritta qui per poterla smentire quando si vedrà il tracciato vero.
--
-- ---------------------------------------------------------------------------
-- PERCHÉ UNA MIGRATION NUOVA E NON UNA CORREZIONE ALLA 0012
-- ---------------------------------------------------------------------------
-- 0012 e 0013 sono già applicate al database vivo (verificato alla fonte il 2026-07-27:
-- `on_profile_claim_legacy` e `on_auth_user_email_changed` presenti, funzioni installate).
-- Una migration applicata non si riscrive: chi l'ha già eseguita non la rieseguirebbe, e
-- i due ambienti divergerebbero in silenzio. Si sostituisce il corpo con un
-- `create or replace` in un file nuovo — che è anche l'unico modo in cui la storia resta
-- leggibile.
--
-- COSA NON CAMBIA. Il valore centrale della 0012 non è la precompilazione, è
-- l'AGGANCIO (`claimed_by`): quello scatta a prescindere dai campi, e da lui dipendono
-- l'oblio e la cascata. Nessuna delle due modifiche lo tocca.
--
-- ORDINE DI RILASCIO: dopo la 0012 e la 0013 (sostituisce il corpo di funzioni loro).
-- Se girasse prima, `create or replace` creerebbe le funzioni e i `create trigger` delle
-- due migration successive le sovrascriverebbero con la versione vecchia — cioè il fix
-- sparirebbe senza errori. L'ordine numerico lo garantisce; è detto perché il rollback
-- della 0012 e un riapply fuori ordine lo violerebbero.
--
-- RIESEGUIBILE: solo `create or replace function` + `revoke`, entrambi no-op alla seconda
-- esecuzione. Nessun trigger ricreato: quelli della 0012/0013 puntano alla funzione per
-- nome e prendono il corpo nuovo senza essere toccati.
--
-- ROLLBACK: riapplicare i corpi della 0012 (§3) e della 0013 (§2). Non c'è nulla da
-- droppare — questa migration non crea oggetti, ne sostituisce due.

-- ---------------------------------------------------------------------------
-- 1. `claim_legacy_contact` — corpo della 0012 con le due correzioni
-- ---------------------------------------------------------------------------
create or replace function public.claim_legacy_contact()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text := lower(btrim(new.contact_email));
  v_legacy public.legacy_contacts;
begin
  if v_key is null
     or v_key = ''
     or v_key like '%@privaterelay.appleid.com' then
    return new;
  end if;

  -- `and claimed_by is null` è la guardia che rende l'operazione ripetibile e che
  -- impedisce di strappare una riga già rivendicata da qualcun altro.
  update public.legacy_contacts
     set claimed_by = new.id,
         claimed_at = now()
   where email_norm = v_key
     and claimed_by is null
  returning * into v_legacy;

  -- Si riempiono SOLO le colonne rimaste vuote: ciò che la persona ha appena scritto
  -- nel form vince sempre sull'archivio. Dopo la 0010 le uniche nullable che
  -- l'archivio può colmare sono queste tre — `first_name`, `last_name`, `birth_date`
  -- e `country` arrivano obbligatori, e sovrascriverli con un dato vecchio sarebbe
  -- una regressione, non un recupero.
  --
  -- «Vuota» = NULL **o** stringa vuota (differenza dalla 0012: là era solo NULL).
  -- L'assegnazione avviene solo se l'archivio ha davvero qualcosa da mettere: senza
  -- quella condizione un `''` in ingresso diventerebbe NULL anche quando non c'è
  -- niente da colmare, cioè cambieremmo un valore per il gusto di normalizzarlo.
  -- ⚠️ La stessa cecità va tolta da ENTRAMBI i lati, non solo dal profilo. Sul lato
  -- archivio `is not null` lascerebbe passare una stringa vuota, e allora il rimedio
  -- scriverebbe `''` sopra un campo del profilo che era NULL: un peggioramento.
  -- NON è un caso teorico — è la forma REALE del file: nell'export del 2026-07-27
  -- (1352 persone) il paese è vuoto su 162 righe, la provincia su 1330, il telefono
  -- su 456. Con `coalesce(v_legacy.country,'IT')` un paese `''` non varrebbe mai
  -- `'IT'` e la provincia non si colmerebbe MAI per nessuno.
  if v_legacy.id is not null then
    if nullif(btrim(new.phone), '') is null
       and nullif(btrim(v_legacy.phone), '') is not null then
      new.phone := v_legacy.phone;
    end if;

    if nullif(btrim(new.city), '') is null
       and nullif(btrim(v_legacy.city), '') is not null then
      new.city := v_legacy.city;
    end if;

    -- La provincia solo fra italiani, da entrambi i lati (vedi ② in testa al file).
    -- `coalesce(new.country, 'IT')` e non `new.country = 'IT'`: la colonna è NOT NULL
    -- con default `'IT'`, e i default RISULTANO applicati prima dei trigger BEFORE —
    -- ma la documentazione ufficiale non lo afferma da nessuna parte (esiste una
    -- richiesta aperta di documentarlo, message-id 160469022212 sulle liste PostgreSQL;
    -- lo dicono fonti secondarie convergenti). Invece di poggiare il ramo su una
    -- premessa che la fonte primaria non conferma, si scrive nel modo che è corretto in
    -- entrambi i casi: se un giorno `new.country` arrivasse NULL, «paese non detto»
    -- vale «Italia», esattamente come il default della colonna.
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

-- Come 0006/0008/0011/0012: niente superficie RPC (il trigger fira comunque senza grant).
revoke execute on function public.claim_legacy_contact() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. `sync_contact_email_on_email_change` — stesso trattamento al gemello
-- ---------------------------------------------------------------------------
-- La 0013 replica la precompilazione della 0012 nel ramo «l'indirizzo si è spostato»,
-- e ne aveva ereditato entrambi i difetti. Qui il profilo esiste già, quindi si guarda
-- `p.*` invece di `new.*`; la logica è la stessa, riga per riga.
-- Il resto del corpo è quello della 0013, verbatim: le due guardie (`check_violation`
-- sul vincolo di formato, `undefined_table` sulla tabella di un'altra migration) e il
-- perché di ciascuna vivono là, e ricopiarne le motivazioni qui le farebbe divergere.
create or replace function public.sync_contact_email_on_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cambiata boolean := new.email is distinct from old.email;
  v_nuova_valida boolean := new.email is not null
    and new.email not like '%@privaterelay.appleid.com';
  v_spostata boolean := false;
begin
  if not v_cambiata or not v_nuova_valida then
    return new;
  end if;

  begin
    update public.profiles
       set contact_email = btrim(new.email)
     where id = new.id
       and contact_email is not null
       and lower(btrim(contact_email)) = lower(btrim(old.email));
    v_spostata := found;
  exception when check_violation then
    return new;
  end;

  if v_spostata then
    begin
      update public.legacy_contacts
         set claimed_by = new.id,
             claimed_at = now()
       where email_norm = lower(btrim(old.email))
         and claimed_by is null;

      if found then
        update public.profiles p
           set phone = case
                 when nullif(btrim(p.phone), '') is null
                  and nullif(btrim(l.phone), '') is not null
                 then l.phone else p.phone end,
               city = case
                 when nullif(btrim(p.city), '') is null
                  and nullif(btrim(l.city), '') is not null
                 then l.city else p.city end,
               province = case
                 when coalesce(nullif(btrim(p.country), ''), 'IT') = 'IT'
                  and coalesce(nullif(btrim(l.country), ''), 'IT') = 'IT'
                  and nullif(btrim(p.province), '') is null
                  and nullif(btrim(l.province), '') is not null
                 then l.province else p.province end
          from public.legacy_contacts l
         where p.id = new.id
           and l.email_norm = lower(btrim(old.email));
      end if;
    exception when undefined_table then
      return new;
    end;
  end if;

  return new;
end;
$$;

revoke execute on function public.sync_contact_email_on_email_change() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- NOTA — il rilievo che NON è stato accolto, e perché
-- ---------------------------------------------------------------------------
-- Il critico sosteneva che la precompilazione fosse «codice morto perché l'app manda
-- stringhe vuote». Il meccanismo è quello descritto in ①, ma la conclusione è sbagliata:
-- l'app manda quei campi PIENI (sono obbligatori nei suoi form), quindi non c'è niente
-- da colmare, non un buco. Il codice non è morto: è in ATTESA della registrazione
-- leggera, e nel frattempo il vuoto che deve saper reggere arriva dall'ARCHIVIO, che è
-- già qui e ne è pieno.
-- La distinzione conta perché la conclusione del critico («cade il valore della 0012»)
-- avrebbe portato a rimettere in discussione la tabella, che invece è a posto: il valore
-- della 0012 è l'AGGANCIO (`claimed_by`), che scatta a prescindere dai campi.
