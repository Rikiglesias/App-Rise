-- Migration 0009 — profiles.contact_email (goal partner-identita, F1.7b)
-- Email di contatto SCELTA dall'utente, distinta da auth.users.email — che con
-- "Accedi con Apple" + "Nascondi la mia email" è un indirizzo Apple Private Relay
-- (<random>@privaterelay.appleid.com). Serve al prefill dei form partner (Donorbox):
-- l'app applica la regola `contact_email ?? auth.email` e non precompila un relay
-- (src/shared/partner/partnerEmail.ts). Nullable: la maggior parte degli utenti non
-- la valorizza e ripiega su auth.email.
--
-- Additiva e a basso rischio: aggiunge UNA colonna nullable + un check. NON tocca
-- grant né RLS (la own_update di 0001 copre già la nuova colonna) e NON tocca
-- consent_events (la "schermata onesta" è trasparenza Art.13/14, non un consenso
-- Art.7 → nessun evento nel ledger probatorio).
--
-- RIESEGUIBILE (come 0003/0005/0008): applicata a mano dal SQL Editor, un secondo
-- tentativo è uno scenario reale. Rollback:
--   alter table public.profiles drop constraint if exists profiles_contact_email_chk;
--   alter table public.profiles drop column if exists contact_email;

alter table public.profiles
  add column if not exists contact_email text;

-- Guardrail leggero contro valori palesemente non-email nel DB (la validazione RFC
-- completa vive nell'app, src/shared/auth/validation.ts — stessa forma di regex,
-- coerenza cross-layer). null ammesso. drop+add invece di "add if not exists"
-- (Postgres non ha ADD CONSTRAINT IF NOT EXISTS) → rieseguibile.
alter table public.profiles
  drop constraint if exists profiles_contact_email_chk;
alter table public.profiles
  add constraint profiles_contact_email_chk
  check (
    contact_email is null
    or contact_email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  );
