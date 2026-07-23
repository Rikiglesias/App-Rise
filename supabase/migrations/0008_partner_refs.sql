-- Migration 0008 — partner_refs + tombstone cancellazione (goal partner-identita, F1.6+F1.9)
-- Correlazione app→partner (Donorbox, Let's Donation) via ref opaco: il ref viaggia
-- sull'ordine/donazione del partner, mai dati anagrafici. Storica: la revoca non cancella
-- (active=false + revoked_at), così le correlazioni passate restano ricostruibili e il ref
-- è ri-emettibile (rotazione su data breach lato partner).
-- Design: docs/integrazioni/letsdonation-donorbox-identita.md §5-§8 (PR #56).

create table public.partner_refs (
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
create unique index partner_refs_one_active_idx
  on public.partner_refs (user_id, partner)
  where active;

-- Copre la cascade da profiles (delete where user_id=…) anche sui ref revocati,
-- che l'indice parziale sopra non indicizza.
create index partner_refs_user_id_idx
  on public.partner_refs (user_id);

alter table public.partner_refs enable row level security;

-- Il client legge e crea SOLO i propri ref (il valore lo genera il default server-side).
-- Niente update/delete client: la revoca è operazione amministrativa (service_role),
-- la cancellazione passa dalla cascade su profiles.
create policy "ref_own_select" on public.partner_refs
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "ref_own_insert" on public.partner_refs
  for insert to authenticated
  with check ((select auth.uid()) = user_id and active);

-- Tombstone SENZA foreign key: sopravvive alla cancellazione dell'utente e conserva il
-- minimo per propagare la cancellazione al partner (quale ref, presso chi) senza sapere
-- più di chi era. requested_at/confirmed_at tracciano la richiesta al partner e la sua
-- conferma (valorizzati dal processo di propagazione, non dal trigger).
-- Nessun check su partner: riceve solo copie storiche, non deve poter rifiutare un delete.
create table public.partner_ref_tombstones (
  ref uuid primary key,
  partner text not null,
  deleted_at timestamptz not null default now(),
  requested_at timestamptz,
  confirmed_at timestamptz
);

-- RLS senza policy: accesso solo service_role (che la bypassa). Nessuna superficie client.
alter table public.partner_ref_tombstones enable row level security;

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

create trigger on_profile_deleted
  before delete on public.profiles
  for each row execute procedure public.handle_profile_deletion();
