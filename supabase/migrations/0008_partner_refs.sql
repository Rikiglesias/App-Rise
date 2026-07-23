-- Migration 0008 — partner_refs + tombstone cancellazione (goal partner-identita, F1.6+F1.9)
-- Correlazione app→partner (Donorbox, Let's Donation) via ref opaco: il ref viaggia
-- sull'ordine/donazione del partner, mai dati anagrafici. Storica: la revoca non cancella
-- (active=false + revoked_at), così le correlazioni passate restano ricostruibili e il ref
-- è ri-emettibile (rotazione su data breach lato partner).
-- Design: docs/integrazioni/letsdonation-donorbox-identita.md §5-§8 (PR #56).
--
-- RIESEGUIBILE per intero (come 0003/0005): questa migration viene applicata a mano dal
-- SQL Editor, dove un secondo tentativo — dopo un errore parziale o semplicemente nel
-- dubbio «l'ho gia' applicata?» — e' uno scenario reale, non teorico. Ogni oggetto usa
-- `if not exists` o `drop ... if exists` prima del create.
-- Rollback completo:
--   drop trigger if exists on_profile_deleted on public.profiles;
--   drop function if exists public.handle_profile_deletion();
--   drop table if exists public.partner_ref_tombstones;
--   drop table if exists public.partner_refs;

create table if not exists public.partner_refs (
  ref uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  partner text not null check (partner in ('donorbox', 'letsdonation')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  -- active e revoked_at si muovono insieme: attivo ⇔ mai revocato
  constraint partner_refs_active_revoked_chk check (active = (revoked_at is null))
);

-- Un solo ref attivo per (utente, partner); lo storico revocato non è vincolato.
create unique index if not exists partner_refs_one_active_idx
  on public.partner_refs (user_id, partner)
  where active;

-- Copre la cascade da profiles (delete where user_id=…) anche sui ref revocati,
-- che l'indice parziale sopra non indicizza.
create index if not exists partner_refs_user_id_idx
  on public.partner_refs (user_id);

alter table public.partner_refs enable row level security;

-- Grant ESPLICITI: una tabella nuova è raggiungibile dal client solo se il ruolo ha il
-- privilegio SQL, che la RLS poi restringe riga per riga (sono due controlli distinti).
-- Le tabelle 0001/0003 se lo sono visti concedere dai default privileges del progetto;
-- scriverlo qui rende la migration indipendente da quella configurazione invece che
-- ereditarla in silenzio. Idempotente: se il grant c'è già, non cambia nulla.
-- Il revoke PRIMA del grant non è ridondante: se il progetto ha default privileges
-- permissivi sulle tabelle nuove (è il caso qui — 0001/0003 non hanno grant espliciti e
-- funzionano), il client si ritroverebbe UPDATE e DELETE su questa tabella. La RLS li
-- filtrerebbe comunque a zero righe non avendo policy per essi, ma sarebbe una difesa a
-- strato singolo che dipende dalla configurazione del progetto invece che dalla migration.
-- Revocando prima, il privilegio non esiste in NESSUNA configurazione: la revoca di un ref
-- resta amministrativa (service_role) per costruzione, non per policy mancante.
revoke all on public.partner_refs from anon, authenticated;
grant select, insert on public.partner_refs to authenticated;

-- Il client legge e crea SOLO i propri ref (il valore lo genera il default server-side).
-- Niente update/delete client: la revoca è operazione amministrativa (service_role),
-- la cancellazione passa dalla cascade su profiles.
drop policy if exists "ref_own_select" on public.partner_refs;
create policy "ref_own_select" on public.partner_refs
  for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "ref_own_insert" on public.partner_refs;
create policy "ref_own_insert" on public.partner_refs
  for insert to authenticated
  with check ((select auth.uid()) = user_id and active);

-- Tombstone SENZA foreign key: sopravvive alla cancellazione dell'utente e conserva il
-- minimo per propagare la cancellazione al partner (quale ref, presso chi) senza sapere
-- più di chi era. requested_at/confirmed_at tracciano la richiesta al partner e la sua
-- conferma (valorizzati dal processo di propagazione, non dal trigger).
-- Nessun check su partner: riceve solo copie storiche, non deve poter rifiutare un delete.
create table if not exists public.partner_ref_tombstones (
  ref uuid primary key,
  partner text not null,
  deleted_at timestamptz not null default now(),
  requested_at timestamptz,
  confirmed_at timestamptz
);

-- RLS senza policy: accesso solo service_role (che la bypassa). Nessuna superficie client.
alter table public.partner_ref_tombstones enable row level security;

-- Difesa in profondità: se i default privileges del progetto concedessero automaticamente
-- sulle tabelle nuove, `authenticated` otterrebbe il privilegio SQL su questa tabella —
-- la RLS senza policy filtrerebbe comunque ogni riga, ma il privilegio non deve esistere
-- proprio. Qui non serve MAI a nessun client: è materiale per la propagazione al partner.
revoke all on public.partner_ref_tombstones from anon, authenticated;

-- Trigger UNICO su profiles: copre ENTRAMBI i percorsi di cancellazione (delete-account
-- immediata e purge-deletions a 30 giorni — entrambi finiscono in auth.admin.deleteUser
-- → cascade su profiles) e anche l'eventuale delete diretto via own_delete.
-- BEFORE delete: i ref esistono ancora (la cascade su partner_refs parte dopo).
-- SECURITY DEFINER (pattern 0004/0006): scrive il tombstone anche quando a cancellare è
-- l'utente stesso, che sul tombstone non ha alcuna policy. Strict per scelta: se l'insert
-- fallisce, la cancellazione fallisce RUMOROSAMENTE — meglio di una propagazione persa in silenzio.
create or replace function public.handle_profile_deletion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.partner_ref_tombstones (ref, partner)
  select ref, partner
  from public.partner_refs
  where user_id = old.id
  on conflict (ref) do nothing;
  return old;
end;
$$;

-- Come 0006: niente superficie RPC (il trigger fira comunque senza il grant).
revoke execute on function public.handle_profile_deletion() from public, anon, authenticated;

drop trigger if exists on_profile_deleted on public.profiles;
create trigger on_profile_deleted
  before delete on public.profiles
  for each row execute procedure public.handle_profile_deletion();
