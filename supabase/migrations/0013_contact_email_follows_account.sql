-- Migration 0013 — la mail di contatto segue il cambio della mail dell'account (F-EMAIL.15)
--
-- IL BUCO. `profiles.contact_email` porta oggi DUE significati che il database non
-- distingue:
--   ① un recapito che la persona ha SCELTO, diverso dalla credenziale (lo scrive lei
--      dal profilo, o arriva nei metadati del signup);
--   ② una COPIA della mail dell'account, scritta d'ufficio alla nascita del profilo
--      dalla 0011, perché su quel canale l'indirizzo è reale e verificato.
-- Quando la persona cambia la mail dell'account, il caso ② resta indietro: nessuno
-- lo tocca. Da quel momento la colonna dice un indirizzo che la persona ha appena
-- smesso di usare, e nessun sollecito se ne accorge — perché la colonna è PIENA.
--
-- PERCHÉ NON È UN DETTAGLIO COSMETICO. Quella colonna non serve solo a scriverle:
--   · è la chiave con cui il prefill verso il partner compila il form
--     (`partnerEmail.ts`, regola `contact_email ?? auth.email`) → manderemmo a un
--     terzo l'indirizzo vecchio;
--   · è la chiave con cui la 0012 fa l'OBLIO delle anagrafiche storiche mai
--     rivendicate (`purge_legacy_contact`, su `old.contact_email`) → alla
--     cancellazione dell'account una riga storica registrata sotto l'indirizzo NUOVO
--     sopravvivrebbe, che è esattamente la classe di difetto chiusa in `411e0d4`.
--
-- PERCHÉ IL TRIGGER, E NON UNA RIGA NELL'APP. Sembrerebbe più semplice riallineare
-- lato client subito dopo `updateUser({ email })`. È la trappola: quello è un cambio
-- email SICURO — non ha effetto finché la persona non conferma su ENTRAMBE le caselle
-- (Supabase tiene l'indirizzo in `new_email` nel frattempo). Scrivere subito il nuovo
-- indirizzo in `contact_email` ci metterebbe una casella MAI VERIFICATA, e se la
-- conferma non arriva mai resta lì: il rimedio introdurrebbe il rischio che deve
-- prevenire. Il trigger su `auth.users` scatta invece quando la mail è CAMBIATA
-- DAVVERO, cioè a conferma avvenuta, e non dipende da un client che potrebbe non
-- tornare mai (disinstalla, cambia telefono, conferma dal browser della posta).
--
-- COSA FA — due cose, e la seconda è nata da un critico avversariale che ha visto
-- ciò che io non avevo visto: senza di lei questa migration REGREDIVA la 0012
-- (dettaglio al suo posto, nel corpo della funzione). ① se `contact_email` valeva
-- la mail VECCHIA
-- — cioè era il caso ②, derivato — la porta alla mail nuova. Se la persona aveva
-- scelto un recapito DIVERSO (caso ①) non lo tocca: è una sua scelta, e il cambio
-- della credenziale non la revoca. Il confronto è `lower(btrim(...))` su entrambi i
-- lati, come tutte le altre chiavi email del progetto.
--
-- GUARDIA RELAY, identica alla 0011: se la mail NUOVA fosse un alias Apple Private
-- Relay non la scriviamo — sarebbe peggio del valore vecchio, perché renderebbe il
-- profilo «completo» con un indirizzo che non è quello della persona. Col login
-- Apple rimosso nessun account nuovo può averne uno; resta difesa per i nati prima
-- e per gli usi futuri del trigger.
--
-- SCARTATA l'alternativa più precisa — una colonna `contact_email_is_derived` che
-- registri quale dei due significati vale — perché per le righe GIÀ ESISTENTI il
-- backfill sarebbe un'indovinata: nessuno ha registrato, all'epoca, se quel valore
-- fu scelto o derivato. L'uguaglianza con la mail vecchia è la stessa informazione,
-- ricavata al momento in cui serve. Costo del caso limite: chi aveva deliberatamente
-- scelto come recapito lo STESSO indirizzo dell'account se lo vede seguire il cambio.
-- È il comportamento che si aspetterebbe comunque, ed è rettificabile dal profilo.
--
-- RESIDUO DICHIARATO, non chiuso — e la conseguenza è più grave di come l'avevo
-- scritta la prima volta (correzione dopo il terzo critico). La chiave della
-- rivendicazione è un indirizzo che la persona sta ABBANDONANDO, quindi quella riga
-- storica le resta legata. Caso limite, con una casella riusata o di famiglia:
-- la riga d'archivio di `a@x.it` riguarda B; A si registra con `a@x.it`, poi cambia
-- indirizzo → questa funzione rivendica per A la riga di B; quando A cancella
-- account o profilo, il ramo ① della 0012 **CANCELLA la scheda di B**. Prima di
-- questa migration sarebbe sopravvissuta, perché non rivendicata e con email diversa
-- dal `contact_email` di A. Non è solo «B perde la precompilazione»: B perde la riga.
--
-- Perché non lo chiudo qui: la contro-misura (non rivendicare se quella mail è
-- ancora il recapito di un altro profilo) costa una sotto-query su OGNI cambio di
-- indirizzo, e resta comunque parziale — non copre il caso in cui B non ha ancora un
-- profilo da noi, che è proprio quello tipico di un archivio storico. Si chiude
-- davvero con la passata di riconciliazione già prevista dalla 0012, dove le
-- collisioni di indirizzo si vedono tutte insieme invece che una alla volta.
-- ⚠️ Chi progetta quella passata deve partire da qui.
--
-- PRIVILEGI: come 0006/0008/0011/0012, nessuna superficie RPC — il trigger fira
-- comunque senza grant. `security definer` + `search_path = ''` per scrivere su
-- `public.profiles` scavalcando le regole di riga, che non prevedono un attore di
-- sistema.
--
-- RIESEGUIBILE: `create or replace function` + `drop trigger if exists` sono no-op
-- alla seconda esecuzione.
--
-- ROLLBACK — VERIFICATO, non solo dichiarato (T7 della suite lo esegue davvero):
--   drop trigger if exists on_auth_user_email_changed on auth.users;
--   drop function if exists public.sync_contact_email_on_email_change();
-- È pulito perché questa migration è puramente ADDITIVA: non fa `create or replace`
-- di nessuna funzione condivisa, quindi togliendola non si porta via il corpo di
-- qualcun altro. (La 0012 insegnò il contrario: là il rollback ingenuo rompeva le
-- registrazioni, perché il trigger di aggancio viveva sulla tabella dei profili.)
-- Dopo il rollback il comportamento torna esattamente a quello di oggi: la colonna
-- resta indietro, nessun errore.
--
-- ORDINE DI RILASCIO — **richiede la 0012 già applicata**, e la frase precedente
-- («nessun vincolo») era diventata falsa nel momento in cui questa funzione ha
-- cominciato a scrivere su `legacy_contacts`. Il codice regge comunque a
-- un'applicazione fuori ordine (la guardia `undefined_table` nel corpo), ma
-- l'ordine giusto è 0012 → 0013, e vanno comunque applicate insieme: è la 0013 a
-- tenere onesta la chiave dell'oblio quando la persona cambia indirizzo.
-- Verso l'app resta additiva e retro-compatibile: senza di lei tutto funziona come
-- prima.
--
-- ROLLBACK DELLA 0012 — ordine CONSIGLIATO, non più critico: togliere prima
-- `on_auth_user_email_changed`, poi il resto. Se ci si dimentica non succede nulla
-- di grave, perché la guardia `exception when undefined_table` nel corpo assorbe la
-- tabella mancante (vedi più sotto) — ma restare senza tabella con un trigger che la
-- cerca a ogni cambio email è comunque disordine, non una scelta. La nota è replicata
-- nell'intestazione della 0012.

create or replace function public.sync_contact_email_on_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- `update of email` fira anche quando la colonna è nella lista degli aggiornati
  -- ma il valore non cambia: senza questo confronto lavoreremmo a vuoto a ogni
  -- update che sfiora la colonna.
  v_cambiata boolean := new.email is distinct from old.email;
  -- Un alias di relay non è la mail della persona: non deve entrare in colonna.
  v_nuova_valida boolean := new.email is not null
    and new.email not like '%@privaterelay.appleid.com';
  v_spostata boolean := false;
  -- NB: nessuna variabile di tipo `public.legacy_contacts`. Un tipo composito si
  -- risolve alla COMPILAZIONE della funzione, cioè fuori da qualunque blocco
  -- EXCEPTION: dichiararlo qui avrebbe fatto fallire il trigger prima che la
  -- guardia `undefined_table` potesse intervenire, vanificandola.
begin
  if not v_cambiata or not v_nuova_valida then
    return new;
  end if;

  -- `btrim` NON è cosmetico: `profiles_contact_email_chk` (0009) vieta gli spazi
  -- (`^[^\s@]+@[^\s@]+\.[^\s@]+$`). Scrivere il valore grezzo farebbe fallire il
  -- vincolo, e siccome siamo dentro il trigger dell'UPDATE farebbe fallire il
  -- CAMBIO EMAIL stesso: la persona non riuscirebbe più a cambiare indirizzo, per
  -- colpa di una colonna che con l'accesso non c'entra niente. Le maiuscole invece
  -- il vincolo le ammette e si conservano, come fa la 0011 alla nascita.
  --
  -- `btrim` chiude l'ISTANZA (gli spazi), non la CLASSE: GoTrue potrebbe accettare
  -- un indirizzo che quel regex rifiuta comunque (un dominio senza punto, una
  -- local-part quotata). Se accadesse, il `check_violation` risalirebbe fino
  -- all'UPDATE su `auth.users` e la persona si troverebbe **impossibilitata a
  -- cambiare email**, con un errore che parla di una tabella che non ha toccato.
  -- Fra «la colonna di recapito resta indietro» e «l'accesso non si può più
  -- cambiare», il primo è incomparabilmente meno grave → best-effort esplicito.
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

  -- ---------------------------------------------------------------------------
  -- IL PEZZO CHE MANCAVA, e che senza di lui questa migration REGREDIVA la 0012.
  -- ---------------------------------------------------------------------------
  -- `purge_legacy_contact` (0012 §4) fa l'oblio delle righe MAI rivendicate usando
  -- `old.contact_email` al momento della cancellazione. Spostando quella colonna
  -- sulla mail nuova, la riga storica registrata sotto la mail VECCHIA smetterebbe
  -- di essere raggiunta: chi si è registrato PRIMA dell'import (il caso per cui il
  -- §4 della 0012 esiste) e poi cambia indirizzo si lascerebbe dietro una seconda
  -- copia dei suoi dati che sopravvive alla cancellazione dell'account. Cioè
  -- esattamente la classe chiusa in `411e0d4`, riaperta in silenzio da noi.
  --
  -- Il rimedio NON è cancellare quella riga qui: la persona non ha chiesto niente,
  -- e quei dati le servono ancora per la precompilazione. È **rivendicarla** —
  -- l'indirizzo vecchio era suo, la riga è sua — così se ne occupa la cascata su
  -- `claimed_by` al momento giusto, che è la cancellazione. `claimed_at` si muove
  -- insieme a `claimed_by` (vincolo `legacy_contacts_claim_coerente`), e
  -- `claimed_by is null` è la stessa guardia della 0012: non si strappa una riga
  -- già rivendicata da qualcun altro.
  --
  -- Solo se lo spostamento è avvenuto per davvero (`v_spostata`): se la colonna
  -- portava un recapito SCELTO, l'oblio continua a passare da lì e non c'è niente
  -- da riagganciare.
  -- L'intero blocco è protetto come quello sopra, e per la stessa ragione elevata a
  -- potenza: `public.legacy_contacts` è una tabella di UN'ALTRA migration. Se questa
  -- girasse senza la 0012 applicata, o dopo il suo rollback (che droppa la tabella e
  -- NON droppa questo trigger), ogni conferma di cambio email morirebbe su
  -- «relation does not exist» — di nuovo la persona bloccata fuori dal proprio
  -- indirizzo, per una tabella che con l'accesso non c'entra. `undefined_table` è
  -- l'unica classe inghiottita: tutto il resto deve continuare a fallire rumorosamente.
  if v_spostata then
    begin
      update public.legacy_contacts
         set claimed_by = new.id,
             claimed_at = now()
       where email_norm = lower(btrim(old.email))
         and claimed_by is null;

      -- Stessa cortesia della 0012 (`claim_legacy_contact`): si riempiono SOLO le
      -- colonne rimaste vuote. Senza questa parte la rivendicazione qui sarebbe
      -- PEGGIORE del non farla — toglierebbe la riga dall'insieme non-rivendicato
      -- su cui lavorerà la passata di riconciliazione, e quella persona perderebbe
      -- la precompilazione per sempre, in silenzio.
      if found then
        update public.profiles p
           set phone    = coalesce(p.phone,    l.phone),
               city     = coalesce(p.city,     l.city),
               province = coalesce(p.province, l.province)
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

revoke execute on function public.sync_contact_email_on_email_change()
  from public, anon, authenticated;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute procedure public.sync_contact_email_on_email_change();
