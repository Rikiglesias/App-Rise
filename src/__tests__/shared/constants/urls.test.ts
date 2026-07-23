import { RISE_URLS, SOCIAL_URLS } from '../../../shared/constants/urls';

// Sentinella migrazione dominio partner (goal partner-identita, F1.2-F1.3):
// welfare4charity → letsdonation. Se un URL regredisce al dominio vecchio o
// nasce fuori standard, questi test lo bloccano prima della produzione.
describe('RISE_URLS — migrazione Let’s Donation', () => {
  it('nessun URL usa più il dominio welfare4charity', () => {
    for (const url of Object.values(RISE_URLS)) {
      expect(url).not.toContain('welfare4charity');
    }
  });

  it('le voci partner puntano al tenant letsdonation (301 verificato 2026-07-23)', () => {
    const vociPartner = [
      'shop',
      'giftCards',
      'events',
      'projects',
      'communityRegister',
    ] as const;
    for (const voce of vociPartner) {
      expect(new URL(RISE_URLS[voce]).hostname).toBe(
        'riseagainsthunger.org.letsdonation.com'
      );
    }
  });

  it('il redirect di communityRegister resta sul tenant letsdonation', () => {
    const redirect = new URL(RISE_URLS.communityRegister).searchParams.get(
      'redirect'
    );
    expect(redirect).not.toBeNull();
    expect(new URL(redirect as string).hostname).toBe(
      'riseagainsthunger.org.letsdonation.com'
    );
  });

  it('tutti gli URL esterni sono https validi', () => {
    for (const url of [
      ...Object.values(RISE_URLS),
      ...Object.values(SOCIAL_URLS),
    ]) {
      expect(new URL(url).protocol).toBe('https:');
    }
  });
});
