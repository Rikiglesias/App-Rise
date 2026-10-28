import { useCallback, useRef, useState } from 'react';

import { useAuthError } from './useAuthError';
import type { NicknameCheck } from './useNicknameAvailability';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import {
  validateEmail,
  validatePhoneIT,
  validateMinAge,
  validateRequired,
  validateContactEmail,
  validateNickname,
} from '@/shared/auth/validation';
import { isNicknameConflict } from '@/shared/auth/nickname';
import type { ProfileEditable } from '@/shared/auth/types';

type Errors = Partial<
  Record<
    | 'firstName'
    | 'lastName'
    | 'phone'
    | 'city'
    | 'province'
    | 'country'
    | 'birthDate'
    | 'email'
    | 'contactEmail'
    | 'nickname',
    string
  >
>;

/** I campi di Modifica profilo come la persona li vede, prima di trim e confronto. */
export interface ProfileEditValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  country: string;
  birthDate: string;
  contactEmail: string;
  nickname: string;
}

interface Options {
  values: ProfileEditValues;
  nicknameCheck: NicknameCheck;
  emailDaCambiare: () => string | null;
  segnaSalvato: () => void;
  avviaAttesa: () => void;
  legata: () => boolean;
}

/**
 * Invio di Modifica profilo: validazione, patch dei soli campi cambiati, cambio email ed
 * esito (salvato, salvato a metà, errore). Lo stato dei campi resta nella schermata.
 */
export const useProfileEditSubmit = ({
  values,
  nicknameCheck,
  emailDaCambiare,
  segnaSalvato,
  avviaAttesa,
  legata,
}: Options) => {
  const { t } = useTranslation();
  const { profile, profileError, refreshProfile, updateProfile, updateEmail } =
    useAuth();
  const {
    firstName,
    lastName,
    email,
    phone,
    city,
    province,
    country,
    birthDate,
    contactEmail,
    nickname,
  } = values;
  const [errors, setErrors] = useState<Errors>({});
  const {
    error: submitError,
    errorKey: submitErrorKey,
    setError: setSubmitError,
    reportError,
    showError,
    offline,
  } = useAuthError('auth.edit.error');
  const [success, setSuccess] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const [profileSaved, setProfileSaved] = useState(false);

  const onSubmit = useCallback(async (): Promise<void> => {
    // Il modulo ha i dati dell'account con cui la schermata si è aperta: con la
    // sessione di un altro account non si scrive niente (C97).
    if (!legata()) return;
    setSubmitAttempt(attempt => attempt + 1);
    setProfileSaved(false);
    setSubmitError(null);
    setSuccess(false);
    // Dopo un write riuscito la rilettura può fallire: recupera prima la fonte,
    // così nickname già proprio e cambio email pendente restano distinguibili.
    let currentProfile = profile;
    if (profileError) {
      setLoading(true);
      try {
        currentProfile = await refreshProfile({ throwOnError: true });
      } catch (error) {
        showError(error);
        return;
      } finally {
        setLoading(false);
      }
    }
    const e: Errors = {};
    if (validateRequired(firstName)) e.firstName = 'required';
    if (validateRequired(lastName)) e.lastName = 'required';
    const em = validateEmail(email);
    if (em) e.email = em;
    const p = validatePhoneIT(phone);
    if (p) e.phone = p;
    if (validateRequired(country)) e.country = 'required';
    if (validateRequired(city)) e.city = 'required';
    if (country === 'IT' && validateRequired(province)) e.province = 'required';
    const a = validateMinAge(birthDate);
    if (a) e.birthDate = a;
    // Mail di contatto: obbligatoria e reale per chi ce l'ha già, e per chi la sta
    // scrivendo ora. NON per chi non l'ha mai avuta.
    // Il motivo è un diritto, non una preferenza: un profilo nato prima che la
    // regola esistesse ha la colonna vuota, e pretenderla qui bloccherebbe la
    // rettifica di QUALSIASI dato — anche solo il telefono — finché la persona non
    // fornisce un'informazione che nessuno le aveva mai chiesto. L'Art.16 non si
    // subordina a un requisito nato dopo: il campo resta visibile e lo chiede il
    // sollecito del profilo (`missingProfileFields`), che non blocca nulla.
    // Chi invece la colonna ce l'ha non può SVUOTARLA: sarebbe perdere la chiave con
    // cui riconosciamo la persona nell'anagrafica importata dal partner.
    const hadContactEmail = Boolean(currentProfile?.contact_email?.trim());
    const ce =
      hadContactEmail || contactEmail.trim()
        ? validateContactEmail(contactEmail)
        : null;
    if (ce) e.contactEmail = ce;
    // Nickname: vuoto è una risposta valida («non ne voglio uno»); se invece c'è deve
    // avere la forma del CHECK. Senza questo controllo la rettifica fallirebbe INTERA
    // per un campo facoltativo, con l'errore generico e nessuna indicazione di quale
    // campo l'ha causata.
    const nick = validateNickname(nickname);
    if (nick) e.nickname = nick;
    // E se sappiamo GIÀ che è di qualcun altro, ci si ferma qui — come fa la
    // registrazione (`useSignUpForm`). Senza, il salvataggio partirebbe, l'indice lo
    // respingerebbe e la persona leggerebbe il messaggio della corsa persa («un attimo
    // prima di te»): falso, perché lo sapevamo da secondi. `unknown` non ferma nessuno.
    else if (
      nicknameCheck === 'taken' &&
      nickname.trim() !== (currentProfile?.nickname ?? '')
    )
      e.nickname = 'nickname_taken';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    // Solo i campi effettivamente cambiati (whitelist a valle in updateProfile).
    const changed: Partial<ProfileEditable> = {};
    if (firstName.trim() !== currentProfile?.first_name)
      changed.first_name = firstName.trim();
    if (lastName.trim() !== currentProfile?.last_name)
      changed.last_name = lastName.trim();
    if (phone.trim() !== currentProfile?.phone) changed.phone = phone.trim();
    if (country.trim() !== (currentProfile?.country ?? 'IT'))
      changed.country = country.trim();
    if (city.trim() !== currentProfile?.city) changed.city = city.trim();
    // Provincia solo italiana: per i paesi esteri si azzera.
    const nextProvince = country === 'IT' ? province.trim() : '';
    if (nextProvince !== (currentProfile?.province ?? ''))
      changed.province = nextProvince;
    if (birthDate.trim() !== currentProfile?.birth_date)
      changed.birth_date = birthDate.trim();
    // La mail di contatto entra nel patch se è cambiata, per QUALSIASI account:
    // condizionarla al relay (com'era) significherebbe validarla a tutti e salvarla
    // solo a qualcuno — la modifica passerebbe il controllo e non verrebbe scritta,
    // in silenzio.
    if (contactEmail.trim() !== (currentProfile?.contact_email ?? ''))
      changed.contact_email = contactEmail.trim();
    // Il confronto è fra valori TRIMMATI da entrambi i lati: `updateProfile` scrive
    // `trim() || null`, quindi senza il trim qui un nickname a cui la persona ha solo
    // aggiunto uno spazio entrerebbe nel patch e produrrebbe una scrittura identica a
    // quella già in colonna.
    if (nickname.trim() !== (currentProfile?.nickname ?? ''))
      changed.nickname = nickname.trim();

    try {
      if (Object.keys(changed).length > 0) {
        const { error } = await updateProfile(changed);
        if (error) {
          // LA CORSA PERSA: fra il controllo di disponibilità e questo salvataggio,
          // qualcun altro ha preso lo stesso nickname. È raro, ma il modo peggiore di
          // gestirlo è l'errore generico «impossibile salvare»: manderebbe la persona a
          // ricontrollare nome, telefono e città, mentre il campo da cambiare è uno solo
          // e glielo possiamo dire. Il messaggio va SUL CAMPO, non in fondo alla pagina.
          if (isNicknameConflict(error)) {
            setErrors(prev => ({ ...prev, nickname: 'nickname_taken_race' }));
            // E si dice anche che NON È STATO SALVATO NIENTE: `updateProfile` fa un solo
            // `update` con tutti i campi cambiati, quindi il rifiuto dell'indice porta giù
            // anche il cognome corretto e il telefono nuovo. Col solo errore sotto il
            // campo nickname, la persona uscirebbe da qui convinta che il resto sia stato
            // scritto — e se ne accorgerebbe settimane dopo, o mai.
            setSubmitError(t('auth.edit.nothingSaved'));
            return;
          }
          reportError(error);
          return;
        }
        setProfileSaved(true);
      }

      // Né l'indirizzo attuale né quello già in attesa (C87): rimandarlo cambierebbe i link.
      const nextEmail = emailDaCambiare();
      let didChangeEmail = false;
      if (nextEmail !== null) {
        const { error } = await updateEmail(nextEmail);
        if (error) {
          showError(error);
          return;
        }
        didChangeEmail = true;
        avviaAttesa();
      }

      segnaSalvato();
      setEmailChanged(didChangeEmail);
      setSuccess(true);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [
    firstName,
    lastName,
    nickname,
    // Senza questa dipendenza il salvataggio leggerebbe lo stato di disponibilità
    // CONGELATO alla creazione del callback: il blocco su «già preso» guarderebbe un
    // verdetto vecchio, cioè quasi sempre `idle`. Il linter l'ha preso, ed è il tipo di
    // difetto che nessun test coglie finché non capita la sequenza giusta.
    nicknameCheck,
    email,
    emailDaCambiare,
    segnaSalvato,
    avviaAttesa,
    phone,
    city,
    province,
    country,
    birthDate,
    contactEmail,
    // `isRelay` (nella schermata) fuori: la validazione e il patch della mail non lo
    // consultano più (resta solo per scegliere il placeholder).
    profile,
    profileError,
    refreshProfile,
    updateProfile,
    updateEmail,
    reportError,
    showError,
    setSubmitError,
    legata,
    t,
  ]);

  const handleSubmit = useCallback((): void => {
    if (submitting.current) return;
    submitting.current = true;
    void onSubmit().finally(() => {
      submitting.current = false;
    });
  }, [onSubmit]);

  return {
    handleSubmit,
    errors,
    submitError,
    submitErrorKey,
    offline,
    success,
    emailChanged,
    loading,
    submitAttempt,
    profileSaved,
  };
};
