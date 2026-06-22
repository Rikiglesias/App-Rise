import {
  validateEmail,
  validatePassword,
  validatePhoneIT,
  validateAdult,
  validateRequired,
  validateSignUpForm,
  validateProfileForm,
} from '@/shared/auth/validation';

describe('auth validation', () => {
  it('email', () => {
    expect(validateEmail('a@b.it')).toBeNull();
    expect(validateEmail('nope')).toBe('email_invalid');
  });

  it('password min 8 + maiuscola + carattere speciale', () => {
    expect(validatePassword('Abcd123!')).toBeNull();
    expect(validatePassword('short')).toBe('password_weak');
    expect(validatePassword('abcd1234')).toBe('password_weak'); // no maiuscola/speciale
    expect(validatePassword('Abcd1234')).toBe('password_weak'); // no speciale
    expect(validatePassword('abcd123!')).toBe('password_weak'); // no maiuscola
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
      password: 'Abcd123!',
      confirmPassword: 'Abcd123!',
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
      password: 'Abcd123!',
      confirmPassword: 'Abcd123!',
      phone: '+393331234567',
      city: 'Roma',
      province: 'RM',
      birthDate: '2000-01-01',
      privacyConsent: false,
    });
    expect(errors.privacyConsent).toBe('required');
  });

  it('confirmPassword diversa da password → password_mismatch', () => {
    const errors = validateSignUpForm({
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.it',
      password: 'Abcd123!',
      confirmPassword: 'Abcd123?',
      phone: '+393331234567',
      city: 'Roma',
      province: 'RM',
      birthDate: '2000-01-01',
      privacyConsent: true,
    });
    expect(errors.confirmPassword).toBe('password_mismatch');
  });

  it('profile form: valida i campi comuni (no email/password)', () => {
    const errors = validateProfileForm({
      firstName: 'Mario',
      lastName: 'Rossi',
      phone: '+393331234567',
      city: 'Roma',
      province: 'RM',
      birthDate: '2000-01-01',
      privacyConsent: true,
    });
    expect(errors).toEqual({});
  });

  it('profile form: errori su telefono e privacy', () => {
    const errors = validateProfileForm({
      firstName: 'Mario',
      lastName: 'Rossi',
      phone: '333',
      city: 'Roma',
      province: 'RM',
      birthDate: '2000-01-01',
      privacyConsent: false,
    });
    expect(errors.phone).toBe('phone_invalid');
    expect(errors.privacyConsent).toBe('required');
  });
});
