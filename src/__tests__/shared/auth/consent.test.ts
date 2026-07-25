import {
  buildConsentInsert,
  deriveMarketingState,
  isReConsentRequired,
  hasGrantedCurrentPolicy,
  CURRENT_POLICY_VERSION,
} from '@/shared/auth/consent';
import type {
  ConsentEvent,
  ConsentPurpose,
  ConsentAction,
} from '@/shared/auth/types';

const ev = (
  purpose: ConsentPurpose,
  action: ConsentAction,
  created_at: string
): ConsentEvent => ({
  id: created_at,
  user_id: 'u1',
  purpose,
  action,
  policy_version: CURRENT_POLICY_VERSION,
  legal_basis: 'consent',
  channel: 'test',
  created_at,
});

describe('consent helpers', () => {
  it('deriveMarketingState: vince l’ultimo evento marketing per data', () => {
    expect(deriveMarketingState([])).toBe(false);
    expect(
      deriveMarketingState([ev('marketing', 'granted', '2026-01-01')])
    ).toBe(true);
    expect(
      deriveMarketingState([
        ev('marketing', 'granted', '2026-01-01'),
        ev('marketing', 'withdrawn', '2026-02-01'),
      ])
    ).toBe(false);
  });

  it('deriveMarketingState: ignora finalità diverse da marketing', () => {
    expect(
      deriveMarketingState([ev('privacy_notice', 'granted', '2026-03-01')])
    ).toBe(false);
  });

  it('isReConsentRequired: true se manca un privacy_notice granted per la versione corrente', () => {
    expect(isReConsentRequired([])).toBe(true);
    expect(
      isReConsentRequired([ev('privacy_notice', 'granted', '2026-01-01')])
    ).toBe(false);
    expect(
      isReConsentRequired(
        [ev('privacy_notice', 'granted', '2026-01-01')],
        'privacy-2099-01-01'
      )
    ).toBe(true);
  });

  it('isReConsentRequired (S7): isCurrentMaterial=false → mai re-consenso; default true invariato', () => {
    // cambio NON materiale → nessun re-consenso anche senza eventi
    expect(isReConsentRequired([], CURRENT_POLICY_VERSION, false)).toBe(false);
    // materiale + nessun evento → true
    expect(isReConsentRequired([], CURRENT_POLICY_VERSION, true)).toBe(true);
    // default (param omesso) resta true (fail-safe privacy)
    expect(isReConsentRequired([])).toBe(true);
    // materiale + privacy_notice granted versione corrente → false
    expect(
      isReConsentRequired(
        [ev('privacy_notice', 'granted', '2026-01-01')],
        CURRENT_POLICY_VERSION,
        true
      )
    ).toBe(false);
  });

  it('hasGrantedCurrentPolicy: positivo ≠ «non serve riaccettare»', () => {
    // Il caso che distingue le due domande: versione NON materiale e utente che
    // non ha mai accettato. isReConsentRequired dice false (non bloccare la UI),
    // ma il consenso non c'è — e su quello si decide se trasmettere a un terzo.
    expect(isReConsentRequired([], CURRENT_POLICY_VERSION, false)).toBe(false);
    expect(hasGrantedCurrentPolicy([], CURRENT_POLICY_VERSION)).toBe(false);

    const granted = [ev('privacy_notice', 'granted', CURRENT_POLICY_VERSION)];
    expect(hasGrantedCurrentPolicy(granted, CURRENT_POLICY_VERSION)).toBe(true);

    // Consenso a una versione VECCHIA non vale per quella corrente. NB: in `ev`
    // il terzo parametro è la data, non la versione — qui serve un evento con
    // policy_version esplicitamente diverso.
    const oldVersion: ConsentEvent = {
      ...ev('privacy_notice', 'granted', '2026-01-01'),
      policy_version: 'privacy-2020-01-01',
    };
    expect(hasGrantedCurrentPolicy([oldVersion], CURRENT_POLICY_VERSION)).toBe(
      false
    );
  });

  it('buildConsentInsert costruisce la riga con legal_basis e versione corrente', () => {
    expect(
      buildConsentInsert('u1', 'marketing', 'granted', 'ios:profile_toggle')
    ).toEqual({
      user_id: 'u1',
      purpose: 'marketing',
      action: 'granted',
      policy_version: CURRENT_POLICY_VERSION,
      legal_basis: 'consent',
      channel: 'ios:profile_toggle',
    });
  });
});
