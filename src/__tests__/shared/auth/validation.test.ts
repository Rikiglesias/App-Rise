import {
  validateEmail,
  validatePassword,
  validatePhoneIT,
  validateAdult,
  validateRequired,
  validateContactEmail,
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
  // Obbligatoria per tutti dal 2026-07-25: un profilo valido la contiene sempre.
  contactEmail: 'vera@mail.it',
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

  // F1.10 — helper condiviso per la mail di contatto (account Apple relay).
  it('validateContactEmail: required → email_invalid → relay → ok', () => {
    expect(validateContactEmail('')).toBe('required');
    expect(validateContactEmail('   ')).toBe('required');
    expect(validateContactEmail('abc')).toBe('email_invalid');
    expect(validateContactEmail('x@privaterelay.appleid.com')).toBe(
      'contact_email_relay'
    );
    expect(validateContactEmail('vera@mail.it')).toBeNull();
  });

  it('profile form: contact_email obbligatoria SEMPRE, senza flag', () => {
    // Contratto nuovo: non esiste più un modo di renderla facoltativa. Il test di
    // prima blindava il default «non richiesta», cioè un contratto già abbandonato
    // dal prodotto: sarebbe rimasto verde anche cancellando la regola.
    expect(
      validateProfileForm({ ...baseProfile, contactEmail: '' }).contactEmail
    ).toBe('required');
    expect(
      validateProfileForm({
        ...baseProfile,
        contactEmail: 'y@privaterelay.appleid.com',
      }).contactEmail
    ).toBe('contact_email_relay');
    expect(
      validateProfileForm({ ...baseProfile, contactEmail: 'abc' }).contactEmail
    ).toBe('email_invalid');
    expect(
      validateProfileForm({ ...baseProfile }).contactEmail
    ).toBeUndefined();
  });

  it('profile form: il consenso privacy si pretende alla NASCITA, non al completamento', () => {
    // Nascita (default): senza spunta il form è bloccato — è il momento in cui il
    // consenso viene davvero registrato (privacy_consent_at + evento Art.7).
    expect(
      validateProfileForm({ ...baseProfile, privacyConsent: false })
        .privacyConsent
    ).toBe('required');
    // Completamento di un profilo esistente: la casella non viene nemmeno mostrata,
    // quindi pretenderla bloccherebbe il salvataggio su un campo invisibile —
    // e la spunta, se data, verrebbe scartata dal submit (consenso chiesto e buttato).
    expect(
      validateProfileForm({
        ...baseProfile,
        privacyConsent: false,
        requirePrivacyConsent: false,
      }).privacyConsent
    ).toBeUndefined();
  });
});
