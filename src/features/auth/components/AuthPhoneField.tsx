import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, StyleSheet } from 'react-native';
import PhoneInput, {
  type ICountry,
  getCountryByCca2,
  getCountryByPhoneNumber,
  getNationalPhoneNumber,
} from 'rn-international-phone-number';
import type { ICountryCca2, ICountrySelectStyle } from 'rn-country-select';

import { PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

interface AuthPhoneFieldProps {
  label: string;
  /**
   * Numero già noto, in E.164 ("+393331234567"): serve a MOSTRARE un valore che il
   * form ha già (profilo esistente, rettifica) invece di farlo ridigitare.
   *
   * Passarlo rende il campo CONTROLLATO. Ometterlo lo lascia non-controllato, ed è
   * un caso vivo, non un residuo: `SignUpScreen` registra una persona nuova, non ha
   * nessun numero da proporre. La distinzione è fra `undefined` (nessun valore
   * esterno) e `''` (valore esterno vuoto): trattarli allo stesso modo farebbe
   * ri-azzerare il campo appena digitato in tutte le schermate che non passano
   * `value` — il difetto opposto a quello che questa prop chiude.
   */
  value?: string;
  /**
   * Riceve il numero in E.164 SENZA spazi (es. "+393331234567"), che è il formato
   * richiesto da `validatePhoneIT`; stringa vuota se il campo è vuoto. Se `value`
   * arriva in un formato diverso (spazi, prefisso assente) viene normalizzato e
   * notificato una volta, così il form non tiene mai una stringa che la validazione
   * rifiuterebbe mentre il campo ne mostra una corretta.
   */
  onChangeText: (fullPhone: string) => void;
  /**
   * Paese di residenza (cca2): quando cambia, il prefisso si allinea a quel paese.
   * Resta comunque modificabile dall'utente nel selettore del campo (override).
   */
  country?: string;
  /**
   * Notifica il cambio di paese fatto dall'utente nel selettore prefisso (cca2):
   * permette al campo Paese di sincronizzarsi (sync bidirezionale prefisso↔paese).
   */
  onCountryChange?: (cca2: string) => void;
  error?: string | undefined;
}

// Italia in cima al selettore (caso comune: donatori italiani); il resto della
// lista resta in ordine alfabetico.
const POPULAR_COUNTRIES: ICountryCca2[] = ['IT'];

// Backdrop trasparente ma CLICCABILE: nessun velo grigio a tutta pagina, ma un
// tap in qualunque punto fuori dal pop-up lo chiude (oltre alla X). Si ottiene
// non rimuovendo il backdrop (altrimenti la lib lo disabilita) e sovrascrivendo
// solo il suo colore di sfondo a 'transparent'.
const MODAL_STYLES: ICountrySelectStyle = {
  backdrop: { backgroundColor: 'transparent' },
};

/**
 * Prefisso internazionale da ICountry: `idd.root` + suffisso quando è unico
 * (Italia: "+3"+"9" = "+39"); per i paesi con più suffissi (es. USA "+1") si usa
 * solo la root, che è il vero calling code.
 */
const buildCallingCode = (c: ICountry | null): string => {
  const root = c?.idd?.root;
  if (!root) return '';
  const suffixes = c?.idd?.suffixes ?? [];
  return suffixes.length === 1 ? `${root}${suffixes[0]}` : root;
};

/**
 * Campo telefono con selettore prefisso/paese (default Italia). Lo stato di
 * numero e paese è interno; al form arriva solo la stringa completa col prefisso,
 * coerente col contratto string del campo (come AuthInput).
 */
export const AuthPhoneField: React.FC<AuthPhoneFieldProps> = ({
  label,
  value,
  onChangeText,
  country: countryCca2,
  onCountryChange,
  error,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [number, setNumber] = useState('');
  const [country, setCountry] = useState<ICountry | null>(
    () => getCountryByCca2(countryCca2 ?? 'IT') ?? null
  );
  // Copia in ref del paese corrente. La libreria può notificare paese e numero nello
  // STESSO giro (succede incollando un numero internazionale: prima il paese, poi le
  // cifre): il secondo callback legge `country` dalla closure di quel render, che è
  // ancora il paese VECCHIO, e comporrebbe cifre francesi con prefisso italiano — 11
  // cifre, quindi supera anche la validazione e si salverebbe il numero di un'altra
  // persona. Il ref è l'unico valore che entrambi i callback vedono aggiornato.
  const countryRef = useRef<ICountry | null>(country);
  countryRef.current = country;

  // Ultimo valore USCITO da qui. Serve a riconoscere l'eco: il form ci rimanda
  // indietro come `value` ciò che gli abbiamo appena emesso, e quel giro non è
  // un'idratazione — ritrattarlo come tale rifarebbe il lavoro a ogni tasto.
  const lastEmitted = useRef('');
  // Il numero attuale arriva da fuori (profilo) o l'ha digitato la persona qui? Da
  // questo dipende se il prefisso può essere riscritto: su un numero salvato no.
  const numberIsFromOutside = useRef(false);

  const emit = useCallback(
    (num: string, c: ICountry | null): void => {
      const code = buildCallingCode(c);
      // E.164 senza spazi ("+<cifre>"): è il formato richiesto da validatePhoneIT.
      // `num` è il numero nazionale formattato dalla libreria → ne prendo le cifre.
      const digits = num.replace(/\D/g, '');
      const full = digits ? `${code}${digits}` : '';
      // Non si notifica un valore che non è cambiato. Serve a un caso reale, non
      // all'eleganza: al montaggio la libreria emette una volta a vuoto, e quella
      // stringa vuota sposterebbe il form via dal suo valore iniziale ('+39'). Chi
      // idrata dal profilo scrive solo se il campo è ancora al valore iniziale →
      // senza questa guardia l'idratazione non scatterebbe più, e chi ha già il
      // numero tornerebbe a ridigitarlo. Cancellare davvero il campo passa: lì il
      // valore CAMBIA (da '+39…' a ''), quindi la notifica parte.
      if (full === lastEmitted.current) return;
      lastEmitted.current = full;
      onChangeText(full);
    },
    [onChangeText]
  );

  // UN SOLO effetto per le due sincronizzazioni (valore che arriva da fuori, paese di
  // residenza che cambia). Separarli li metterebbe in corsa fra loro nel caso che conta
  // — il profilo che arriva dalla rete porta ENTRAMBI insieme (`country: 'FR'` e
  // `phone: '+33…'`) — e l'allineamento del prefisso, che riemette, cancellerebbe il
  // numero appena idratato. È la stessa trappola già pagata in `useProfileForm`.
  const appliedResidence = useRef(countryCca2);
  useEffect(() => {
    // `undefined` = questa schermata non passa un valore (campo non controllato):
    // qui non si idrata mai, altrimenti si azzererebbe ciò che la persona digita.
    const hasExternalValue = value !== undefined;
    const isNewValue = hasExternalValue && value !== lastEmitted.current;
    const isNewResidence =
      !!countryCca2 && countryCca2 !== appliedResidence.current;
    if (!isNewValue && !isNewResidence) return;

    if (isNewValue) {
      // Il paese si deduce dal numero stesso, non dalla residenza: un numero salvato
      // porta con sé il proprio prefisso, ed è più vero della residenza dichiarata.
      // Un valore che è SOLO il prefisso ('+39') è un campo vuoto, non un numero: è
      // il valore iniziale con cui il form parte, quindi è il caso più comune di
      // tutti. Senza questa guardia la libreria non lo riconosce (servono almeno 3
      // cifre), lo restituisce verbatim, e da '+39' uscirebbe '+3939' — che il form
      // registrerebbe come "numero digitato", impedendo per sempre l'idratazione di
      // quello vero e facendo fallire la validazione su un campo mai toccato.
      const isOnlyCallingCode = /^\+\d{1,3}$/.test(value);
      const hasNumber = Boolean(value) && !isOnlyCallingCode;
      const fromNumber = hasNumber ? getCountryByPhoneNumber(value) : undefined;
      const nextCountry = fromNumber ?? country;
      const national = hasNumber ? getNationalPhoneNumber(value) : '';

      // Il valore in arrivo NON è per forza in E.164: in colonna può esserci
      // '+39 333 1234567' o '3331234567' senza prefisso — caso certo dopo l'import
      // delle anagrafiche. La libreria, quando non riconosce il numero, restituisce
      // l'input verbatim (getNationalPhoneNumber.js:26-29): senza normalizzare, il
      // campo mostrerebbe un numero giusto mentre il form tiene una stringa che
      // `validatePhoneIT` rifiuta — errore su un campo che sembra a posto.
      // Il prefisso internazionale può già essere DENTRO le cifre, scritto alla
      // vecchia maniera ('0039 333 1234567' — formato comunissimo negli archivi da
      // importare). Va tolto sia lo '00' sia il prefisso stesso, altrimenti
      // rimetterglielo davanti produce '+3900393331234567' (16 cifre) o
      // '+39393331234567' (14): in entrambi i casi la persona vede un errore su un
      // numero che non ha mai scritto.
      const callingCode = buildCallingCode(nextCountry);
      const bare = callingCode.replace('+', '');
      let digits = national.replace(/\D/g, '').replace(/^00/, '');
      if (bare && digits.startsWith(bare)) digits = digits.slice(bare.length);
      const normalized = digits ? `${callingCode}${digits}` : '';

      setCountry(nextCountry);
      setNumber(national);
      lastEmitted.current = normalized;
      // Il numero mostrato viene da fuori, non è stato digitato qui: serve al ramo
      // sotto, che non deve riscriverne il prefisso.
      numberIsFromOutside.current = true;
      // La residenza in arrivo si segna come già applicata: senza questa riga, al giro
      // successivo l'allineamento del prefisso scatterebbe e riemetterebbe, cambiando
      // il numero che abbiamo appena mostrato.
      if (countryCca2) appliedResidence.current = countryCca2;
      // Si notifica SOLO se abbiamo dovuto correggere il formato: rimandare indietro
      // un valore identico a quello ricevuto sarebbe riscrivere il form con ciò che
      // il form ci ha appena dato.
      if (normalized !== value) onChangeText(normalized);
      return;
    }

    // Solo la residenza è cambiata (la persona ha scelto un altro paese).
    appliedResidence.current = countryCca2;
    if (numberIsFromOutside.current) {
      // Numero che arriva dal profilo: NON si tocca. Riallinearne il prefisso alla
      // residenza cambierebbe il numero di una persona reale — '+393331234567' con
      // residenza corretta in FR diventerebbe '+333331234567', che ha 12 cifre e
      // supera pure `validatePhoneIT`, quindi finirebbe in tabella senza un errore.
      // Chi vuole cambiare davvero il numero lo modifica, e da lì torna "digitato".
      return;
    }
    const c = countryCca2 ? getCountryByCca2(countryCca2) : undefined;
    if (c) {
      setCountry(c);
      emit(number, c);
    }
  }, [value, countryCca2, country, number, emit, onChangeText]);

  // Stili theme-aware per allineare il campo agli altri input (sfondo/bordo/radius
  // del tema): la libreria di default usa un campo bianco fisso, che in dark mode
  // stonerebbe con gli altri campi scuri.
  const phoneStyles = useMemo(
    () => ({
      container: {
        backgroundColor: colors.neutral[0],
        borderWidth: scale(1),
        borderColor: colors.neutral[200],
        borderRadius: scale(12),
        // Altezza uniforme a tutti gli altri campi della pagina.
        minHeight: scale(48),
        justifyContent: 'center' as const,
      },
      flagContainer: { backgroundColor: 'transparent' as const },
      input: { color: colors.neutral[900] },
      callingCode: { color: colors.neutral[900] },
      caret: { color: colors.neutral[500] },
    }),
    [colors]
  );

  return (
    <View style={styles.wrap}>
      <PerfectText size={16} lines={1} style={styles.label}>
        {label}
      </PerfectText>
      <PhoneInput
        value={number}
        // NIENTE `defaultCountry`: il paese lo passiamo già noi, sempre valorizzato
        // (l'inizializzatore dello stato risolve 'IT' quando non c'è residenza).
        // Passandolo, l'effetto di montaggio della libreria notificava comunque
        // «Italia» al form — e su un profilo francese quel giro cambiava il campo
        // Paese, faceva comparire la Provincia obbligatoria e al salvataggio
        // scriveva `country: 'IT'`: l'italianizzazione silenziosa già chiusa
        // altrove, che rientrava da questa porta.
        country={country}
        accessibilityLabelPhoneInput={label}
        phoneInputStyles={phoneStyles}
        popularCountries={POPULAR_COUNTRIES}
        modalType="bottomSheet"
        initialBottomsheetHeight="75%"
        minBottomsheetHeight="75%"
        maxBottomsheetHeight="75%"
        showModalAlphabetFilter={false}
        modalStyles={MODAL_STYLES}
        showModalCloseButton
        onChangePhoneNumber={(num: string): void => {
          // Da qui in poi il numero è della persona, non del profilo: il prefisso
          // può tornare a seguire la residenza.
          numberIsFromOutside.current = false;
          setNumber(num);
          // `countryRef`, non `country`: incollando un numero internazionale la
          // libreria notifica prima il paese e poi le cifre, nello stesso giro —
          // la closure di questo render avrebbe ancora il paese vecchio.
          emit(num, countryRef.current);
        }}
        onChangeCountry={(c: ICountry): void => {
          // NB: non è per forza una scelta dal selettore — la libreria chiama questo
          // callback anche quando riconosce un prefisso nel testo incollato.
          numberIsFromOutside.current = false;
          countryRef.current = c;
          setCountry(c);
          emit(number, c);
          // Sync inverso: aggiorna il campo Paese sotto. Allinea anche il ref così
          // l'effetto di sync residenza→prefisso non ri-applica lo stesso paese.
          // Si segna la RESIDENZA come già applicata, non il paese del prefisso: la
          // residenza non è cambiata: è cambiato il prefisso. Scrivendoci `c.cca2`,
          // al giro dopo l'effetto vedeva residenza ≠ applicata e "riallineava",
          // rimettendo il prefisso vecchio sopra il numero appena scritto — con un
          // numero francese incollato su residenza italiana usciva '+39' + cifre
          // francesi, che ha 11 cifre e supera pure la validazione.
          appliedResidence.current = countryCca2;
          onCountryChange?.(c.cca2);
        }}
      />
      {error ? (
        <PerfectText size={13} lines={2} style={styles.error}>
          {error}
        </PerfectText>
      ) : null}
    </View>
  );
};

const createStyles = (_colors: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      marginBottom: PerfectSpacing.base,
    },
    label: {
      color: _colors.neutral[700],
      fontWeight: '600',
      marginBottom: PerfectSpacing.xs,
    },
    error: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
    },
  });
