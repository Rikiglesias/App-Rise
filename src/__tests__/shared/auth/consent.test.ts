import {
  buildConsentInsert,
  deriveMarketingState,
  isReConsentRequired,
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

  it('isReConsentRequired: nessuna versione materiale (null) → mai re-consenso', () => {
    // materialAt null = nessuna materiale O errore fetch → non forza (fail-safe transient)
    expect(isReConsentRequired([], null)).toBe(false);
    expect(
      isReConsentRequired([ev('privacy_notice', 'granted', '2026-01-01')], null)
    ).toBe(false);
  });

  it('isReConsentRequired: materiale esistente, nessun consenso → true', () => {
    expect(isReConsentRequired([], '2026-06-15')).toBe(true);
  });

  it('isReConsentRequired: consenso DOPO la materiale → false; PRIMA → true', () => {
    const material = '2026-06-15';
    // consenso successivo alla versione materiale → coperto
    expect(
      isReConsentRequired(
        [ev('privacy_notice', 'granted', '2026-07-01')],
        material
      )
    ).toBe(false);
    // consenso precedente → re-consenso richiesto
    expect(
      isReConsentRequired(
        [ev('privacy_notice', 'granted', '2026-05-01')],
        material
      )
    ).toBe(true);
  });

  it('isReConsentRequired (fix multi-version-skip): materiale scavalcata da non-materiale → chi non l’ha accettata è ancora richiesto', () => {
    // Utente accettò solo v1 (2026-01-01); poi pubblicata v2 MATERIALE (published 2026-06-15),
    // poi v3 non-materiale. La materiale più recente resta v2: consenso v1 < v2 → re-consenso.
    expect(
      isReConsentRequired(
        [ev('privacy_notice', 'granted', '2026-01-01')],
        '2026-06-15'
      )
    ).toBe(true);
  });

  it('isReConsentRequired: usa l’ULTIMO privacy_notice granted per data', () => {
    // due consensi: il più recente (2026-07-01) è dopo la materiale → false
    expect(
      isReConsentRequired(
        [
          ev('privacy_notice', 'granted', '2026-05-01'),
          ev('privacy_notice', 'granted', '2026-07-01'),
        ],
        '2026-06-15'
      )
    ).toBe(false);
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
