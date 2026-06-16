-- Migration 0006 — hardening sicurezza/perf da Supabase advisors (post deploy live 2026-06-16)
-- Chiude i WARN emersi all'applicazione di 0001-0005 sul progetto runtime. Tutto idempotente.

-- [SEC 0028/0029] handle_new_user è SECURITY DEFINER: di default Postgres concede EXECUTE a
-- PUBLIC → risulta callable via /rest/v1/rpc da anon/authenticated. È SOLO una trigger function:
-- revocando EXECUTE il trigger continua a firare (l'esecuzione via trigger non richiede il grant),
-- ma sparisce la superficie RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- [SEC 0011] search_path mutable su set_updated_at → pin a vuoto (now() resta in pg_catalog).
alter function public.set_updated_at() set search_path = '';

-- [PERF 0003] auth.uid() in RLS viene ri-valutato per ogni riga: wrap in subselect (init-plan once).
-- [SEC] own_update riceve anche WITH CHECK (senza, un UPDATE può riscrivere id verso un'altra riga).
alter policy "own_select" on public.profiles using ((select auth.uid()) = id);
alter policy "own_insert" on public.profiles with check ((select auth.uid()) = id);
alter policy "own_update" on public.profiles
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
alter policy "own_delete" on public.profiles using ((select auth.uid()) = id);
alter policy "consent_own_select" on public.consent_events using ((select auth.uid()) = user_id);
alter policy "consent_own_insert" on public.consent_events with check ((select auth.uid()) = user_id);

-- [PERF 0001] indice covering sulla FK consent_events.policy_version.
create index if not exists consent_events_policy_version_idx
  on public.consent_events (policy_version);
