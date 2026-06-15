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
