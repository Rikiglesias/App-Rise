# Spec — Auth donatori (Milestone 4: Gestione e audit dei consensi, GDPR Art.7)

> Data: 2026-06-15 · Progetto: App Rise (Rise Against Hunger Italia) · Branch: `feat/donor-auth`
> Continua M1/M2/M3. Colma il gap dichiarato fuori-scope in `2026-06-15-donor-auth-gdpr-M3.md` ("audit-log/revoca granulare consensi").
> Fondata su ricerca triangolata: **EDPB Guidelines 05/2020 §105-118** (primaria), ICO record-keeping, GDPR Art.7/16/17.

## Context
Oggi `public.profiles` ha `marketing_consent boolean` e `privacy_consent_at timestamptz` (migration 0001). Registrano solo lo **stato corrente**, non l'**evento probatorio**: un boolean sovrascritto perde la prova storica e `privacy_consent_at` non lega il consenso alla **versione del testo** mostrato. EDPB §107: «It is up to the controller to prove that valid consent was obtained». EDPB §108: conservare «the session in which consent was expressed... and a copy of the information that was presented to the data subject at that time». → Due booleani **non bastano**.

Inoltre la revoca del consenso marketing oggi **non è possibile in-app** (il toggle è solo a signup, sempre `false` post-social) — viola Art.7(3)/EDPB §114 («withdraw as easy as giving, via the same electronic interface»).

## Requisiti
- **Consent ledger append-only**: ogni grant/withdraw è un evento immutabile con chi/quando/finalità/azione/versione-testo/base-giuridica/canale.
- **Revoca marketing in-app**, toggle simmetrico al rilascio, senza pregiudizio (gratis, nessuna degradazione del servizio).
- **Granularità per finalità**: privacy_notice ≠ marketing ≠ profiling (mai bundling).
- **Re-consenso** al cambio **materiale** della policy (EDPB §110): schermata al login successivo → nuovo evento.
- **Consent history nell'export** (Art.20/M3): l'utente vede la propria cronologia.
- **Non regressione**: M1/M2/M3 intatti; `marketing_consent` resta come cache stato corrente.

## Architettura

### Modello dati (migration `0003_consent_log.sql`)
```sql
create table public.consent_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null check (purpose in ('privacy_notice','marketing','profiling')),
  action text not null check (action in ('granted','withdrawn')),
  policy_version text not null references public.policy_versions(version),
  legal_basis text not null,          -- 'consent' | 'contract'
  channel text not null,              -- es. 'ios:signup', 'android:profile_toggle'
  created_at timestamptz not null default now()
);
create table public.policy_versions (
  version text primary key,           -- es. 'privacy-2026-06-15'
  body text,                          -- testo archiviato (o url)
  is_material boolean not null default true,  -- se il cambio richiede re-consenso
  published_at timestamptz not null default now()
);
```
- **RLS** `consent_events`: `own_select` (trasparenza/export), `own_insert` (`with check user_id = auth.uid()`). **NESSUNA** policy update/delete utente → immutabilità probatoria (cancellazione solo via cascade alla chiusura account o job retention service_role).
- **RLS** `policy_versions`: select pubblica (authenticated), nessun write utente (gestita lato admin/migration).
- Indice `(user_id, purpose, created_at desc)` per derivare lo stato corrente.
- `profiles.marketing_consent` resta come **cache** dello stato corrente (= ultimo evento marketing), per query veloci. Verità probatoria = `consent_events`.

### Flussi
1. **Signup** (retrofit): l'insert profilo registra anche `consent_events(privacy_notice, granted)` e, se marketing spuntato, `consent_events(marketing, granted)`.
2. **Toggle marketing** (ProfileScreen, nuova sezione "Consensi"): ON → evento `granted` + cache true; OFF → evento `withdrawn` + cache false + stop trattamento (EDPB §117). Simmetrico, stesso schermo.
3. **Re-consenso**: al boot, se l'ultima `policy_version` accettata dall'utente è < versione corrente con `is_material = true` → `ReConsentScreen` (mostra il nuovo testo, CTA accetta) → evento `granted` con la nuova version.
4. **Export** (M3): `buildExportPayload` estende il JSON con `consent_history` (lista eventi dell'utente).

### Client
`AuthContext`: `recordConsent(purpose, action)` (insert evento), `setMarketingConsent(bool)` (evento + update cache + refresh), `getConsentHistory()` (select ordinato). UI: sezione "Consensi" in ProfileScreen + `ReConsentScreen` (route nello stack auth).

## Sicurezza & GDPR
- Ledger immutabile (no update/delete utente) = integrità probatoria (accountability Art.5(2)).
- Base giuridica esplicita nel campo `legal_basis`: dati profilo account = **contratto** Art.6(1)(b) (NON consenso revocabile); marketing/profiling = **consenso** opt-in revocabile.
- Revoca = stop trattamento per quella finalità; se non c'è altra base, cancellare i dati trattati solo per essa.
- Retention del log: policy SCRITTA e coerente (vedi Decisioni) + eventuale job di purge (riuso pattern Edge Function + Cron di M3).

## Testing
- Unit: `recordConsent`/`setMarketingConsent` inseriscono l'evento giusto + aggiornano la cache (Supabase mockato); `getConsentHistory` ordina; `buildExportPayload` include `consent_history`. Rendering sezione "Consensi" (toggle) e `ReConsentScreen`. Suite attuale (402) non regredisce.

## Dipendenze nuove
Nessuna lato app. DB: 2 tabelle. (Eventuale Edge Function retention = riuso pattern M3.)

## Decisioni (tecniche, decise 2026-06-15)
1. **Ledger append-only** separato dalla cache boolean (non sostituisce `marketing_consent`, lo affianca).
2. **Granularità**: un evento per ogni **cambio di stato** (granted/withdrawn), non per ogni render.
3. **Toggle marketing** vive in M4 (consensi, Art.7); la modifica dei dati profilo è M5 (Art.16) — separati per articolo.
4. **policy_versions** con flag `is_material` per pilotare il re-consenso solo ai cambi sostanziali.

## Decisioni DA CONFERMARE (DPO/legale RAHI — leva utente, NON tecniche)
- **Retention esatta** del `consent_events`: default prudente proposto = fino a revoca/chiusura account **+ 10 anni** (prescrizione ordinaria IT, difesa da claim). L'obbligo oggettivo è avere una policy scritta e coerente (EDPB §107/Art.5(2)), non un numero preciso.
- **Soglia "cambiamento materiale"** (EDPB §110, non quantificato): checklist proposta = nuove finalità / nuovi tipi di dato / nuovi destinatari = materiale; refusi/riformulazioni = non materiale.
- **Base giuridica** dati profilo account: confermare contratto Art.6(1)(b) vs consenso.
- **Intervallo refresh proattivo** (EDPB §111, best practice non obbligo): default = nessun refresh periodico, solo ai cambi materiali.
- **Profilazione** (personalizzazione richieste donazione): se introdotta → terzo consenso separato + DPIA (Art.22). Oggi assente.

## Verifica end-to-end (a implementazione completata — leva utente)
1. Toggle marketing OFF→ON→OFF in ProfileScreen → 3 righe in `consent_events` + cache coerente.
2. Pubblicazione nuova `policy_versions` materiale → al login appare `ReConsentScreen` → accetta → evento granted.
3. Export → JSON contiene `consent_history` completa.
4. RLS: utente A non legge i `consent_events` di B; nessun update/delete possibile sul ledger.
5. jest ≥402+nuovi; tsc/eslint/madge/conta-problemi = 0.
