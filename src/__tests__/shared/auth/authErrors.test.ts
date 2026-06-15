import { mapAuthError } from '@/shared/auth/authErrors';

describe('mapAuthError', () => {
  it('null/undefined/empty → generic', () => {
    expect(mapAuthError(null)).toBe('generic');
    expect(mapAuthError(undefined)).toBe('generic');
    expect(mapAuthError('')).toBe('generic');
  });

  it('credenziali errate → invalid_credentials', () => {
    expect(mapAuthError('Invalid login credentials')).toBe(
      'invalid_credentials'
    );
  });

  it('email non confermata → email_not_confirmed', () => {
    expect(mapAuthError('Email not confirmed')).toBe('email_not_confirmed');
  });

  it('già registrato → already_registered', () => {
    expect(mapAuthError('User already registered')).toBe('already_registered');
  });

  it('rate limit → rate_limited', () => {
    expect(mapAuthError('Email rate limit exceeded')).toBe('rate_limited');
  });

  it('messaggio sconosciuto → generic', () => {
    expect(mapAuthError('Some unexpected network blip')).toBe('generic');
  });
});
