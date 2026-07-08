/**
 * Helper consensi (M4, GDPR Art.7) — logica pura, testabile in isolamento.
 * Il registro `consent_events` è la verità probatoria; `profiles.marketing_consent`
 * è solo una cache derivata dall'ultimo evento marketing.
 */
import type { ConsentAction, ConsentEvent, ConsentPurpose } from './types';

/**
 * Versione dell'informativa usata come FALLBACK client-side (seed di migration 0003).
 * NON è più la fonte di verità: il gate di re-consenso legge la versione latest a runtime
 * da policy_versions (useAuthActions.getCurrentPolicy, finding 211) e il trigger server
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
 * Serve re-consenso SOLO quando la versione corrente dell'informativa è un cambio
 * MATERIALE (policy_versions.is_material=true, EDPB §110) e l'utente NON ha un evento
 * 'privacy_notice' granted per quella versione.
 *
 * `isCurrentMaterial` (default `true` = fail-safe privacy): il chiamante lo deriva da
 * policy_versions.is_material; se la versione NON è materiale (refuso/chiarimento) non
 * si forza mai il re-consenso. Col default `true` il comportamento legacy è invariato.
 */
export const isReConsentRequired = (
  events: ConsentEvent[],
  currentVersion: string = CURRENT_POLICY_VERSION,
  isCurrentMaterial: boolean = true
): boolean => {
  if (!isCurrentMaterial) return false;
  return !events.some(
    e =>
      e.purpose === 'privacy_notice' &&
      e.action === 'granted' &&
      e.policy_version === currentVersion
  );
};
