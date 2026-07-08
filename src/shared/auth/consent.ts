/**
 * Helper consensi (M4, GDPR Art.7) — logica pura, testabile in isolamento.
 * Il registro `consent_events` è la verità probatoria; `profiles.marketing_consent`
 * è solo una cache derivata dall'ultimo evento marketing.
 */
import type { ConsentAction, ConsentEvent, ConsentPurpose } from './types';

/**
 * Versione dell'informativa usata come FALLBACK client-side (seed di migration 0003).
 * NON è più la fonte di verità: il gate di re-consenso legge la versione latest a runtime
 * da policy_versions (useAuthActions.getLastMaterialPublishedAt, finding 211) e il trigger server
 * 0011 timbra policy_version = latest su ogni consent_events INSERT, ignorando questo valore.
 * Resta solo come default di buildConsentInsert (garantisce una FK valida se il trigger no-op).
 */
export const CURRENT_POLICY_VERSION = 'privacy-2026-06-15';

/** Base giuridica registrata per ogni evento del ledger. */
const LEGAL_BASIS: Record<ConsentPurpose, string> = {
  privacy_notice: 'consent',
  marketing: 'consent',
  profiling: 'consent',
};

export interface ConsentInsert {
  user_id: string;
  purpose: ConsentPurpose;
  action: ConsentAction;
  policy_version: string;
  legal_basis: string;
  channel: string;
}

/** Costruisce la riga da inserire in `consent_events` (created_at lo mette il DB). */
export const buildConsentInsert = (
  userId: string,
  purpose: ConsentPurpose,
  action: ConsentAction,
  channel: string,
  policyVersion: string = CURRENT_POLICY_VERSION
): ConsentInsert => ({
  user_id: userId,
  purpose,
  action,
  policy_version: policyVersion,
  legal_basis: LEGAL_BASIS[purpose],
  channel,
});

/** Stato marketing corrente = azione dell'ultimo evento 'marketing' per data (default false). */
export const deriveMarketingState = (events: ConsentEvent[]): boolean => {
  const latest = events
    .filter(e => e.purpose === 'marketing')
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  return latest?.action === 'granted';
};

/**
 * Serve re-consenso quando esiste una versione MATERIALE dell'informativa
 * (policy_versions.is_material=true, EDPB §110) pubblicata DOPO l'ultimo evento
 * 'privacy_notice' granted dell'utente.
 *
 * NON basta guardare la versione latest: una versione materiale (es. v2) può essere
 * scavalcata da una NON-materiale (es. v3, correzione di un refuso). Un utente che non
 * ha mai accettato v2 va comunque ri-invitato, anche se la latest (v3) è non-materiale.
 * Per questo il confronto è temporale, non sul flag della sola latest (fix review 211).
 *
 * @param events storia consensi dell'utente
 * @param lastMaterialPublishedAt `published_at` (ISO) della versione materiale più recente,
 *   o `null` se non esiste alcuna versione materiale → nessun re-consenso (fail-safe verso
 *   NON forzare: un errore di fetch collassa qui, coerente col non gattare su errore transient).
 */
export const isReConsentRequired = (
  events: ConsentEvent[],
  lastMaterialPublishedAt: string | null
): boolean => {
  if (!lastMaterialPublishedAt) return false;
  const lastGranted = events
    .filter(e => e.purpose === 'privacy_notice' && e.action === 'granted')
    .map(e => e.created_at)
    .sort((a, b) => b.localeCompare(a))[0];
  // Mai consenso → re-consenso; oppure ultimo consenso PRIMA dell'ultima versione materiale.
  return !lastGranted || lastGranted < lastMaterialPublishedAt;
};
