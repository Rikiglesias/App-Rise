import {
  validateEmail,
  validatePassword,
  validatePhoneIT,
  validateMinAge,
  MIN_AGE_YEARS,
  validateRequired,
  validateContactEmail,
  validateSignUpForm,
  validateProfileForm,
} from '@/shared/auth/validation';
import it_ from '@/locales/it';
import en_ from '@/locales/en';

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
  // Vuoto è il caso NORMALE: il nickname è facoltativo e la maggior parte delle
  // registrazioni non ne avrà uno. La base rappresenta la registrazione tipica.
  nickname: '',
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
  // Facoltativo: il vuoto è la risposta normale, quindi è il default del caso base.
  nickname: '',
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

  // Le date sono CALCOLATE dalla soglia, non scritte a mano: un '2000-01-01' fisso
  // continuerebbe a passare anche se qualcuno riportasse la soglia a 18, e il test
  // misurerebbe soltanto che il tempo passa.
  const isoDaAnniFa = (anni: number, giorniDiScarto = 0): string => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - anni);
    d.setDate(d.getDate() + giorniDiScarto);
    return d.toISOString().slice(0, 10);
  };

  it(`età minima: ${MIN_AGE_YEARS} anni compiuti`, () => {
    expect(validateMinAge(isoDaAnniFa(MIN_AGE_YEARS))).toBeNull();
    expect(validateMinAge(isoDaAnniFa(MIN_AGE_YEARS + 20))).toBeNull();
  });

  it('sotto la soglia si resta fuori — anche di un giorno', () => {
    // Il giorno prima di compierli: è il caso che distingue «soglia abbassata» da
    // «vincolo tolto», e l'unico che se ne accorge.
    expect(validateMinAge(isoDaAnniFa(MIN_AGE_YEARS, 1))).toBe('under_min_age');
    expect(validateMinAge(isoDaAnniFa(MIN_AGE_YEARS - 5))).toBe(
      'under_min_age'
    );
  });

  // Il numero della soglia vive in DUE posti — la costante e i due messaggi tradotti,
  // perché l'i18n non interpola. Questo test è ciò che impedisce loro di divergere: senza,
  // cambiare `MIN_AGE_YEARS` lascerebbe l'app a dire un'età che non applica più.
  it('i messaggi tradotti dicono la soglia VERA', () => {
    expect(it_.auth.errors.under_min_age).toContain(String(MIN_AGE_YEARS));
    expect(en_.auth.errors.under_min_age).toContain(String(MIN_AGE_YEARS));
  });

  it('data non valida resta distinguibile da «troppo giovane»', () => {
    expect(validateMinAge('non-una-data')).toBe('date_invalid');
  });

  // Il 29 febbraio `setFullYear` trabocca al 1° marzo, mentre Postgres riporta al 28:
  // un giorno in cui il modulo accetterebbe una data che il CHECK `eta_minima` respinge,
  // e la registrazione fallirebbe DOPO, con un errore generico. Qui la data di sistema è
  // fissata a un 29 febbraio per esercitare proprio quel giorno.
  it('29 febbraio: il taglio coincide con quello del database', () => {
    jest.useFakeTimers().setSystemTime(new Date('2028-02-29T12:00:00Z'));
    try {
      // Postgres: 2028-02-29 - 14 anni = 2014-02-28. Chi è nato il 1° marzo 2014 NON ha
      // ancora compiuto 14 anni per il database, e non deve averli nemmeno per il modulo.
      expect(validateMinAge('2014-03-01')).toBe('under_min_age');
      expect(validateMinAge('2014-02-28')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
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

  // Il nickname è l'unico campo facoltativo del modulo, e la sua forma deve combaciare
  // col CHECK `nickname_forma` della migration 0017: se il form accetta ciò che il DB
  // rifiuta, il trigger lo scarta in silenzio e la persona lo trova sparito senza aver
  // visto nessun errore.
  it('nickname facoltativo: vuoto non è un errore', () => {
    expect(
      validateSignUpForm({ ...baseSignUp, nickname: '' }).nickname
    ).toBeUndefined();
    expect(
      validateSignUpForm({ ...baseSignUp, nickname: '   ' }).nickname
    ).toBeUndefined();
  });

  it('nickname: la forma è quella del CHECK in colonna (2-30, trimmato)', () => {
    expect(validateSignUpForm({ ...baseSignUp, nickname: 'x' }).nickname).toBe(
      'nickname_length'
    );
    expect(
      validateSignUpForm({ ...baseSignUp, nickname: 'a'.repeat(31) }).nickname
    ).toBe('nickname_length');
    // I due bordi ammessi: se una delle due copie della regola si stringe, un valore
    // legittimo verrebbe respinto dal DB dopo essere passato di qui.
    expect(
      validateSignUpForm({ ...baseSignUp, nickname: 'ab' }).nickname
    ).toBeUndefined();
    expect(
      validateSignUpForm({ ...baseSignUp, nickname: 'b'.repeat(30) }).nickname
    ).toBeUndefined();
    // Gli spazi ai bordi si contano DOPO il trim, come fa il trigger: ' ab ' è un
    // nickname di 2 caratteri valido, non uno di 4.
    expect(
      validateSignUpForm({ ...baseSignUp, nickname: '  ab  ' }).nickname
    ).toBeUndefined();
  });

  it('nickname storto non blocca gli altri campi né viceversa', () => {
    const errors = validateSignUpForm({
      ...baseSignUp,
      nickname: 'x',
      firstName: '',
    });
    expect(errors.nickname).toBe('nickname_length');
    expect(errors.firstName).toBe('required');
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
