-- Privilegi minimi sulle tabelle nate prima della 0008 (passata pre-lancio, 02/11).
-- SOLO nel repo: applicazione remota separata, dopo la 0022 e col sì di Riccardo.
--
-- Letto su produzione il 02/11: anon e authenticated hanno TUTTI i privilegi su
-- profiles, consent_events e policy_versions, per i default del progetto. La RLS copre
-- SELECT, INSERT, UPDATE e DELETE, non TRUNCATE. Oggi non è raggiungibile (PostgREST non
-- lo espone, pg_graphql non è installato), ma basterebbe una funzione sbagliata. La 0008
-- ha già chiuso partner_refs così: qui si fa lo stesso per le tre tabelle rimaste.
--
-- anon non legge né scrive queste tabelle: prima dell'accesso l'app usa solo la RPC
-- nickname_disponibile, che è SECURITY DEFINER. Il profilo e il consenso della
-- registrazione li crea handle_new_user, anch'essa SECURITY DEFINER.
--
-- Niente elenco di colonne su profiles: useProfileForm fa upsert dell'intero profilo e
-- AuthContext aggiorna deletion_requested_at. Il rischio di rompere il salvataggio a
-- tutti vale più del vantaggio: chi aggira il client scrive solo sulla propria riga e la
-- prova del consenso resta consent_events.
--
-- Nessuna riga in UPDATE massivo. Il 02/11 profiles è vuota e consent_events ha 4 righe,
-- tutte dentro i limiti.
begin;

revoke all on public.profiles, public.consent_events, public.policy_versions
  from anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert on public.consent_events to authenticated;
grant select on public.policy_versions to authenticated;

-- Il commento della 0008 dice che il valore del ref lo genera il server, ma il grant
-- copriva tutta la riga: il client poteva scegliere il proprio ref e provare valori
-- altrui (la chiave primaria risponde 23505). L'app manda solo user_id e partner.
revoke insert on public.partner_refs from authenticated;
grant insert (user_id, partner) on public.partner_refs to authenticated;

-- Limiti larghi, solo contro gli abusi: nome e paese finiscono anche nei metadata, cioè
-- nel JWT, e consent_events è in sola aggiunta. Non sostituiscono i controlli del modulo.
alter table public.profiles drop constraint if exists profiles_lunghezza_campi;
alter table public.profiles add constraint profiles_lunghezza_campi check (
  char_length(first_name) <= 200
  and char_length(last_name) <= 200
  and char_length(phone) <= 200
  and char_length(city) <= 200
  and char_length(province) <= 200
  and char_length(country) <= 200
);

alter table public.consent_events drop constraint if exists consent_events_lunghezza_campi;
alter table public.consent_events add constraint consent_events_lunghezza_campi check (
  char_length(legal_basis) <= 64
  and char_length(channel) <= 64
);

commit;
