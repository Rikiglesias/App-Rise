import {
  isApplePrivateRelayEmail,
  APPLE_RELAY_SUFFIX,
} from '@/shared/auth/appleRelay';

describe('isApplePrivateRelayEmail', () => {
  it('riconosce una relay Apple Hide-My-Email', () => {
    expect(isApplePrivateRelayEmail(`abc123${APPLE_RELAY_SUFFIX}`)).toBe(true);
  });

  it('case-insensitive e trim-safe', () => {
    expect(isApplePrivateRelayEmail('  ABC@PRIVATERELAY.APPLEID.COM  ')).toBe(
      true
    );
  });

  it('una mail reale NON è una relay', () => {
    expect(isApplePrivateRelayEmail('mario@gmail.com')).toBe(false);
    expect(isApplePrivateRelayEmail('mario@appleid.com')).toBe(false);
  });

  it('null/undefined/vuoto → false (no crash)', () => {
    expect(isApplePrivateRelayEmail(null)).toBe(false);
    expect(isApplePrivateRelayEmail(undefined)).toBe(false);
    expect(isApplePrivateRelayEmail('')).toBe(false);
  });
});
