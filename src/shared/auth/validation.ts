/**
 * Validazione pura dei form di autenticazione donatore (Milestone 1).
 * Nessuna dipendenza da framework/IO: testabile in isolamento (importa solo
 * helper puri, es. isApplePrivateRelayEmail).
 * Le stringhe ritornate sono CHIAVI i18n (mappate in auth.errors.*).
 */
import { isApplePrivateRelayEmail } from '@/shared/partner/partnerEmail';

export type FieldError = string | null;

export const validateEmail = (v: string): FieldError =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'email_invalid';

/** Min 8 caratteri, almeno una maiuscola e un carattere speciale. */
export const validatePassword = (v: string): FieldError =>
  v.length >= 8 && /[A-Z]/.test(v) && /[^A-Za-z0-9]/.test(v)
    ? null
    : 'password_weak';

/** E.164: '+' seguito da 8-15 cifre. La UI pre-compila il prefisso (+39). */
export const validatePhoneIT = (v: string): FieldError =>
  /^\+\d{8,15}$/.test(v.trim()) ? null : 'phone_invalid';

/** Età minima 18 anni alla data odierna. */
export const validateAdult = (isoDate: string): FieldError => {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return 'date_invalid';
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  return d <= cutoff ? null : 'not_adult';
};

export const validateRequired = (v: string): FieldError =>
  v.trim().length > 0 ? null : 'required';

/**
 * Nickname per i siti dei partner (claim OIDC `preferred_username`, migration 0017).
 * FACOLTATIVO: vuoto è valido e significa «non ne voglio uno». Se invece c'è, deve
 * rispettare la stessa forma del CHECK `nickname_forma` in colonna (2-30 caratteri) —
 * se le due regole divergono, il trigger scarta in silenzio ciò che il form accetta.
 */
export const validateNickname = (v: string): FieldError => {
  const t = v.trim();
  if (t.length === 0) return null;
  return t.length >= 2 && t.length <= 30 ? null : 'nickname_length';
};

/**
 * Mail di contatto, obbligatoria per TUTTI dal 2026-07-25 (era solo per gli account
 * Apple Private Relay): deve esistere, essere formalmente valida e NON essere un
 * alias relay — che non ci recapiterebbe nulla in modo stabile e non combacia con
 * l'anagrafica importata dal partner. SSOT condivisa fra `validateProfileForm`
 * (completa-profilo) e la rettifica in `ProfileEditScreen` → una sola copia.
 */
export const validateContactEmail = (v: string): FieldError =>
  validateRequired(v) ??
  validateEmail(v) ??
  (isApplePrivateRelayEmail(v) ? 'contact_email_relay' : null);

export interface SignUpInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  /** Conferma password: validata in UI (deve coincidere), NON inviata al backend. */
  confirmPassword: string;
  phone: string;
  city: string;
  province: string;
  /** ISO 3166-1 alpha-2. 'IT' richiede la provincia; gli altri paesi no. */
  country: string;
  birthDate: string;
  privacyConsent: boolean;
  /**
   * Nickname per i siti dei partner (migration 0017). FACOLTATIVO: la stringa vuota
   * è la risposta normale, non un campo non compilato. Sta qui e non fra i campi
   * obbligatori perché non serve a noi — nasce per il modulo del partner.
   */
  nickname: string;
}

export type SignUpErrors = Partial<Record<keyof SignUpInput, string>>;

export const validateSignUpForm = (input: SignUpInput): SignUpErrors => {
  const e: SignUpErrors = {};
  if (validateRequired(input.firstName)) e.firstName = 'required';
  if (validateRequired(input.lastName)) e.lastName = 'required';
  const email = validateEmail(input.email);
  if (email) e.email = email;
  const pwd = validatePassword(input.password);
  if (pwd) e.password = pwd;
  else if (input.password !== input.confirmPassword)
    e.confirmPassword = 'password_mismatch';
  const phone = validatePhoneIT(input.phone);
  if (phone) e.phone = phone;
  if (validateRequired(input.country)) e.country = 'required';
  if (validateRequired(input.city)) e.city = 'required';
  // Provincia obbligatoria solo per l'Italia (concetto amministrativo italiano).
  if (input.country === 'IT' && validateRequired(input.province))
    e.province = 'required';
  const adult = validateAdult(input.birthDate);
  if (adult) e.birthDate = adult;
  if (!input.privacyConsent) e.privacyConsent = 'required';
  // Nickname: facoltativo, ma se c'è deve avere la forma del CHECK `nickname_forma`.
  // Validarlo QUI non è pignoleria: il trigger della 0017 scarta in silenzio ciò che
  // non rispetta la forma, quindi senza questo controllo la persona scriverebbe un
  // nickname, non vedrebbe nessun errore, e lo troverebbe sparito dopo la conferma.
  const nick = validateNickname(input.nickname);
  if (nick) e.nickname = nick;
  return e;
};

/** Anagrafica post-social (no email/password): stessa logica di SignUp sui campi comuni. */
export interface ProfileInput {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  province: string;
  /** ISO 3166-1 alpha-2. 'IT' richiede la provincia; gli altri paesi no. */
  country: string;
  birthDate: string;
  privacyConsent: boolean;
  /**
   * Email di contatto: SEMPRE obbligatoria (non più un flag opzionale). È la mail
   * reale con cui riconosciamo la persona anche nell'anagrafica importata dal
   * partner; per chi ha già una mail vera arriva precompilata, quindi il costo
   * per l'utente è zero e non serve una leva per spegnerla.
   */
  contactEmail: string;
  /**
   * `false` SOLO nel COMPLETAMENTO di un profilo che esiste già: lì il consenso
   * privacy fu raccolto alla nascita e la ri-accettazione di una versione nuova è
   * competenza di `ReConsentScreen`. Pretenderlo qui significa mostrare una casella
   * obbligatoria la cui spunta poi non viene registrata da nessuna parte — un
   * consenso chiesto e buttato. Default `true` (nascita del profilo): in dubbio si
   * chiede, mai il contrario.
   */
  requirePrivacyConsent?: boolean;
}

/**
 * `requirePrivacyConsent` è un flag di controllo, non un campo con errore proprio:
 * l'unica chiave d'errore aggiuntiva è `contactEmail`.
 */
export type ProfileErrors = Partial<
  Record<
    | 'firstName'
    | 'lastName'
    | 'phone'
    | 'city'
    | 'province'
    | 'country'
    | 'birthDate'
    | 'privacyConsent'
    | 'contactEmail',
    string
  >
>;

export const validateProfileForm = (input: ProfileInput): ProfileErrors => {
  const e: ProfileErrors = {};
  if (validateRequired(input.firstName)) e.firstName = 'required';
  if (validateRequired(input.lastName)) e.lastName = 'required';
  const phone = validatePhoneIT(input.phone);
  if (phone) e.phone = phone;
  if (validateRequired(input.country)) e.country = 'required';
  if (validateRequired(input.city)) e.city = 'required';
  // Provincia obbligatoria solo per l'Italia (concetto amministrativo italiano).
  if (input.country === 'IT' && validateRequired(input.province))
    e.province = 'required';
  const adult = validateAdult(input.birthDate);
  if (adult) e.birthDate = adult;
  // Il consenso si pretende alla NASCITA del profilo. Nel completamento di un
  // profilo esistente la casella non viene nemmeno mostrata: chiederla e poi non
  // registrarla è peggio che non chiederla (vedi `requirePrivacyConsent`).
  if (input.requirePrivacyConsent !== false && !input.privacyConsent)
    e.privacyConsent = 'required';
  // Mail di contatto: obbligatoria sempre, senza flag. Il flag di prima aveva un
  // solo chiamante che gli passava la costante `true`, e blindava nei test un
  // contratto (default = facoltativa) che il prodotto aveva già abbandonato.
  const ce = validateContactEmail(input.contactEmail);
  if (ce) e.contactEmail = ce;
  return e;
};
