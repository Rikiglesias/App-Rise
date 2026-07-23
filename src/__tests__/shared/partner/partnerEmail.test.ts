import {
  isApplePrivateRelayEmail,
  resolvePrefillEmail,
} from '@/shared/partner/partnerEmail';

describe('isApplePrivateRelayEmail', () => {
  it('riconosce un indirizzo Apple Private Relay', () => {
    expect(isApplePrivateRelayEmail('abc123@privaterelay.appleid.com')).toBe(
      true
    );
  });

  it('è case-insensitive e tollera lo whitespace', () => {
    expect(isApplePrivateRelayEmail('  ABC@PrivateRelay.AppleID.com  ')).toBe(
      true
    );
  });

  it('è falso per email normali', () => {
    expect(isApplePrivateRelayEmail('mario@gmail.com')).toBe(false);
    expect(isApplePrivateRelayEmail('mario@icloud.com')).toBe(false);
  });

  it('è falso per null/undefined/vuoto', () => {
    expect(isApplePrivateRelayEmail(null)).toBe(false);
    expect(isApplePrivateRelayEmail(undefined)).toBe(false);
    expect(isApplePrivateRelayEmail('')).toBe(false);
    expect(isApplePrivateRelayEmail('   ')).toBe(false);
  });

  it('non si fa ingannare da un dominio-sosia (ancora @ obbligatoria)', () => {
    expect(isApplePrivateRelayEmail('x@evil-privaterelay.appleid.com')).toBe(
      false
    );
    expect(
      isApplePrivateRelayEmail('x@privaterelay.appleid.com.evil.com')
    ).toBe(false);
  });
});

describe('resolvePrefillEmail', () => {
  it('preferisce contact_email quando presente', () => {
    expect(
      resolvePrefillEmail({
        contactEmail: 'contatto@rise.it',
        authEmail: 'auth@gmail.com',
      })
    ).toBe('contatto@rise.it');
  });

  it('ripiega su auth.email quando contact_email manca', () => {
    expect(
      resolvePrefillEmail({ contactEmail: null, authEmail: 'auth@gmail.com' })
    ).toBe('auth@gmail.com');
  });

  it('ritorna null se entrambe mancano o sono vuote', () => {
    expect(resolvePrefillEmail({})).toBeNull();
    expect(
      resolvePrefillEmail({ contactEmail: '  ', authEmail: '' })
    ).toBeNull();
  });

  it('non precompila un Apple Private Relay (ritorna null)', () => {
    expect(
      resolvePrefillEmail({
        contactEmail: null,
        authEmail: 'abc@privaterelay.appleid.com',
      })
    ).toBeNull();
  });

  it('taglia lo whitespace del valore risolto', () => {
    expect(resolvePrefillEmail({ contactEmail: '  mario@rise.it  ' })).toBe(
      'mario@rise.it'
    );
  });
});
