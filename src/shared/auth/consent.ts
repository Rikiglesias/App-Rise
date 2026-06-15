/**
 * Helper consensi (M4, GDPR Art.7) — logica pura, testabile in isolamento.
 * Il registro `consent_events` è la verità probatoria; `profiles.marketing_consent`
 * è solo una cache derivata dall'ultimo evento marketing.
 */
import type { ConsentAction, ConsentEvent, ConsentPurpose } from './types';

/** Versione corrente dell'informativa (allineata al seed di migration 0003). */
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
    .filter((e) => e.purpose === 'marketing')
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  return latest?.action === 'granted';
};
