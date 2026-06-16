import {
  validateEmail,
  validatePassword,
  validatePhoneIT,
  validateAdult,
  validateRequired,
  validateSignUpForm,
} from '@/shared/auth/validation';

describe('auth validation', () => {
  it('email', () => {
    expect(validateEmail('a@b.it')).toBeNull();
    expect(validateEmail('nope')).toBe('email_invalid');
  });

  it('password min 8 + lettera + numero', () => {
    expect(validatePassword('abcd1234')).toBeNull();
    expect(validatePassword('short')).toBe('password_weak');
    expect(validatePassword('12345678')).toBe('password_weak');
  });

  it('phone IT E.164', () => {
    expect(validatePhoneIT('+393331234567')).toBeNull();
    expect(validatePhoneIT('3331234567')).toBe('phone_invalid');
  });

  it('adult >= 18', () => {
    expect(validateAdult('2000-01-01')).toBeNull();
    expect(validateAdult('2020-01-01')).toBe('not_adult');
  });

  it('required', () => {
    expect(validateRequired('x')).toBeNull();
    expect(validateRequired('  ')).toBe('required');
  });

  it('form aggrega errori per campo', () => {
    const errors = validateSignUpForm({
      firstName: '',
      lastName: 'Rossi',
      email: 'a@b.it',
      password: 'abcd1234',
      phone: '+393331234567',
      city: 'Roma',
      province: 'RM',
      birthDate: '2000-01-01',
      privacyConsent: true,
    });
    expect(errors.firstName).toBe('required');
    expect(errors.lastName).toBeUndefined();
  });

  it('privacy consent obbligatorio', () => {
    const errors = validateSignUpForm({
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.it',
      password: 'abcd1234',
      phone: '+393331234567',
      city: 'Roma',
      province: 'RM',
      birthDate: '2000-01-01',
      privacyConsent: false,
    });
    expect(errors.privacyConsent).toBe('required');
  });
});
