/**
 * Validazione pura dei form di autenticazione donatore (Milestone 1).
 * Nessuna dipendenza esterna: testabile in isolamento.
 * Le stringhe ritornate sono CHIAVI i18n (mappate in auth.errors.*).
 */

export type FieldError = string | null;

export const validateEmail = (v: string): FieldError =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'email_invalid';

/** Min 8 caratteri, almeno una lettera e un numero. */
export const validatePassword = (v: string): FieldError =>
  v.length >= 8 && /[a-zA-Z]/.test(v) && /\d/.test(v) ? null : 'password_weak';

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

export interface SignUpInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  province: string;
  birthDate: string;
  privacyConsent: boolean;
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
  const phone = validatePhoneIT(input.phone);
  if (phone) e.phone = phone;
  if (validateRequired(input.city)) e.city = 'required';
  if (validateRequired(input.province)) e.province = 'required';
  const adult = validateAdult(input.birthDate);
  if (adult) e.birthDate = adult;
  if (!input.privacyConsent) e.privacyConsent = 'required';
  return e;
};
