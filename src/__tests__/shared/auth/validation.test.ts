import {
  validateEmail,
  validatePassword,
  validatePhoneIT,
  validateAdult,
  validateRequired,
  validateSignUpForm,
  validateProfileForm,
} from '@/shared/auth/validation';

const baseSignUp = {
  firstName: 'Mario',
  lastName: 'Rossi',
  email: 'a@b.it',
  password: 'Abcd123!',
  confirmPassword: 'Abcd123!',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  birthDate: '2000-01-01',
  privacyConsent: true,
};

const baseProfile = {
  firstName: 'Mario',
  lastName: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  birthDate: '2000-01-01',
  privacyConsent: true,
  contactEmail: '',
  isRelayEmail: false,
};

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

  it('data malformata → date_invalid (finding 313)', () => {
    expect(validateAdult('not-a-date')).toBe('date_invalid');
    expect(validateAdult('')).toBe('date_invalid');
  });

  it('required', () => {
    expect(validateRequired('x')).toBeNull();
    expect(validateRequired('  ')).toBe('required');
  });

  it('form aggrega errori per campo', () => {
    const errors = validateSignUpForm({ ...baseSignUp, firstName: '' });
    expect(errors.firstName).toBe('required');
    expect(errors.lastName).toBeUndefined();
  });

  it('privacy consent obbligatorio', () => {
    const errors = validateSignUpForm({ ...baseSignUp, privacyConsent: false });
    expect(errors.privacyConsent).toBe('required');
  });

  it('confirmPassword diversa da password → password_mismatch', () => {
    const errors = validateSignUpForm({
      ...baseSignUp,
      confirmPassword: 'Abcd123?',
    });
    expect(errors.confirmPassword).toBe('password_mismatch');
  });

  it('country mancante → errore required', () => {
    const errors = validateSignUpForm({ ...baseSignUp, country: '' });
    expect(errors.country).toBe('required');
  });

  it('IT senza provincia → errore province', () => {
    const errors = validateSignUpForm({ ...baseSignUp, province: '' });
    expect(errors.province).toBe('required');
  });

  it('estero senza provincia → valido (province non richiesta)', () => {
    const errors = validateSignUpForm({
      ...baseSignUp,
      country: 'FR',
      province: '',
    });
    expect(errors.province).toBeUndefined();
    expect(errors.country).toBeUndefined();
  });

  it('profile form: valida i campi comuni (no email/password)', () => {
    const errors = validateProfileForm({ ...baseProfile });
    expect(errors).toEqual({});
  });

  it('profile form: errori su telefono e privacy', () => {
    const errors = validateProfileForm({
      ...baseProfile,
      phone: '333',
      privacyConsent: false,
    });
    expect(errors.phone).toBe('phone_invalid');
    expect(errors.privacyConsent).toBe('required');
  });

  it('profile form: estero senza provincia → valido', () => {
    const errors = validateProfileForm({
      ...baseProfile,
      country: 'ES',
      province: '',
    });
    expect(errors.province).toBeUndefined();
    expect(errors.country).toBeUndefined();
  });

  it('profile form: mail contatto ignorata se non richiesta (mail auth reale)', () => {
    const errors = validateProfileForm({
      ...baseProfile,
      contactEmail: '',
      isRelayEmail: false,
    });
    expect(errors.contactEmail).toBeUndefined();
  });

  it('profile form: mail contatto FACOLTATIVA ma valida se compilata (relay Apple)', () => {
    // Vuota = ok: è facoltativa, resta la relay Apple (che inoltra).
    const empty = validateProfileForm({
      ...baseProfile,
      contactEmail: '',
      isRelayEmail: true,
    });
    expect(empty.contactEmail).toBeUndefined();

    // Compilata ma malformata = errore.
    const bad = validateProfileForm({
      ...baseProfile,
      contactEmail: 'non-una-mail',
      isRelayEmail: true,
    });
    expect(bad.contactEmail).toBe('email_invalid');

    // Compilata e valida = ok.
    const ok = validateProfileForm({
      ...baseProfile,
      contactEmail: 'vera@dominio.it',
      isRelayEmail: true,
    });
    expect(ok.contactEmail).toBeUndefined();
  });
});
