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
-- COSA FA, ESATTAMENTE UNA COSA SOLA: se `contact_email` valeva la mail VECCHIA
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
-- ORDINE DI RILASCIO: nessun vincolo. Additiva e retro-compatibile; senza di lei il
-- codice attuale continua a funzionare identico. Va però applicata PRIMA o INSIEME
-- al caricamento delle anagrafiche storiche (0012), perché è quella che tiene onesta
-- la chiave dell'oblio.

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
  update public.profiles
     set contact_email = btrim(new.email)
   where id = new.id
     and contact_email is not null
     and lower(btrim(contact_email)) = lower(btrim(old.email));

  return new;
end;
$$;

revoke execute on function public.sync_contact_email_on_email_change()
  from public, anon, authenticated;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute procedure public.sync_contact_email_on_email_change();
