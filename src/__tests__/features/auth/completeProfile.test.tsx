import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { fillValidProfileForm } from '../../helpers/profileFormHelpers';
import { CompleteProfileScreen } from '@/features/auth/screens/CompleteProfileScreen';
import { useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';

jest.mock('@react-navigation/native', () => ({
  // `canGoBack` fa parte dell'oggetto navigation vero (`@react-navigation/core`,
  // types.d.ts:267): il salvataggio lo consulta perché dietro il cancello del profilo
  // questa schermata è sola nello stack e un «indietro» non esiste. Qui risponde `true`
  // = il percorso normale, raggiunto dall'area donatori.
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => true,
  }),
}));

jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/shared/auth/supabaseClient', () => {
  const upsert = jest.fn(() => Promise.resolve({ error: null }));
  const updateUser = jest.fn(() => Promise.resolve({ data: {}, error: null }));
  // `rpc` è la funzione `nickname_disponibile` (migration 0018), interrogata dal campo
  // nickname mentre si scrive. Default `true` = libero: i test che vogliono il caso
  // «occupato» lo ridefiniscono. Senza questa voce l'errore sarebbe silenzioso — la
  // chiamata verrebbe inghiottita dal try/catch e ogni verdetto diventerebbe «non so»,
  // cioè un controllo che nei test non controlla niente.
  const rpc = jest.fn(() => Promise.resolve({ data: true, error: null }));
  return {
    supabase: { from: jest.fn(() => ({ upsert })), auth: { updateUser }, rpc },
  };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const makeAuth = (over: Partial<AuthState> = {}): AuthState =>
  ({
    status: 'authenticated',
    session: { user: { id: 'u1', email: 'm@r.it' } } as unknown as Session,
    profile: null,
    // Lettura del profilo ARRIVATA (qui: nessuna riga → nascita del profilo). I casi
    // «profilo esistente» lo passano insieme a `profile`; lasciarlo false significa
    // «non lo so ancora», che è un caso diverso e ha un test suo.
    profileLoaded: true,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    refreshProfile: jest.fn(),
    updateProfile: jest.fn(),
    updateEmail: jest.fn(),
    deleteAccountNow: jest.fn(),
    scheduleDeletion: jest.fn(),
    cancelScheduledDeletion: jest.fn(),
    exportData: jest.fn(),
    recordConsent: jest.fn().mockResolvedValue({ error: null }),
    setMarketingConsent: jest.fn(),
    getConsentHistory: jest.fn(),
    needsReConsent: false,
    acceptCurrentPolicy: jest.fn(),
    ...over,
  }) as AuthState;

// Compilazione del form: sta in `helpers/profileFormHelpers` perché la usa anche la
// suite del cancello del profilo, che serve proprio ad accorgersi se i campi richiesti
// e i campi raccolti smettono di coincidere — con due copie non se ne accorgerebbe.
const fillValidForm = fillValidProfileForm;

const existingProfile = {
  id: 'u1',
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: null,
  city: null,
  province: null,
  country: 'IT',
  birth_date: '1990-01-01',
  privacy_consent_at: '2026-06-20T09:00:00Z',
  marketing_consent: false,
  deletion_requested_at: null,
  contact_email: null,
  nickname: null,
};

describe('CompleteProfileScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('al completamento fa upsert profilo e registra il consenso privacy (Art.7)', async () => {
    const recordConsent = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(makeAuth({ recordConsent }));
    const upsert = (
      supabase.from('profiles') as unknown as {
        upsert: jest.Mock;
      }
    ).upsert;

    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() =>
      expect(recordConsent).toHaveBeenCalledWith('privacy_notice', 'granted')
    );
    expect(upsert).toHaveBeenCalled();
  });

  it('P1: dopo il salvataggio proietta il nome su user_metadata.name', async () => {
    // Percorso post-social: il provider può non aver dato nessun `name` (Apple con
    // "Nascondi la mia email" tipicamente no) → senza questa scrittura il claim OIDC
    // consegnato al partner sarebbe l'EMAIL dell'account, per gli Apple-hide l'alias.
    mockUseAuth.mockReturnValue(makeAuth());
    const updateUser = (supabase.auth as unknown as { updateUser: jest.Mock })
      .updateUser;
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() =>
      expect(updateUser).toHaveBeenCalledWith({
        data: { name: 'Mario Rossi' },
      })
    );
  });

  it('P2: su profilo GIÀ esistente non riscrive privacy_consent_at né registra un secondo consenso', async () => {
    // Percorso di COMPLETAMENTO (profilo minimo con campi mancanti): il consenso era
    // già stato dato alla nascita. Riscrivere la data lo sposterebbe e un secondo
    // «granted» nel ledger Art.7 sarebbe un evento mai avvenuto in quel momento.
    const recordConsent = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(
      makeAuth({ recordConsent, profile: existingProfile })
    );
    const upsert = (
      supabase.from('profiles') as unknown as { upsert: jest.Mock }
    ).upsert;
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId, { consent: false });
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(upsert).toHaveBeenCalled());
    expect(upsert).toHaveBeenCalledWith(
      expect.not.objectContaining({ privacy_consent_at: expect.anything() })
    );
    expect(recordConsent).not.toHaveBeenCalled();
  });
});

// Blocco a sé: la schermata serve a DUE percorsi diversi — la nascita del profilo
// (sopra) e il completamento di uno che esiste già (qui), che ha regole opposte sul
// consenso e sull'idratazione. Tenerli insieme sforava anche il limite di righe.
describe('CompleteProfileScreen — profilo che esiste già', () => {
  beforeEach(() => jest.clearAllMocks());

  it('profilo GIÀ esistente: la casella del consenso NON viene mostrata (non si chiede ciò che non si registra)', () => {
    // Prima la sezione c'era, era obbligatoria per validazione e la spunta veniva
    // scartata dal submit: un consenso chiesto e buttato. Contro-prova: rimettendo
    // la sezione incondizionata questo test cade.
    mockUseAuth.mockReturnValue(makeAuth({ profile: existingProfile }));
    const { queryByRole, queryByText } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    expect(queryByRole('checkbox')).toBeNull();
    expect(queryByText('Consensi')).toBeNull();
  });

  it('profilo NON ancora letto: il consenso viene chiesto lo stesso (in dubbio si raccoglie)', () => {
    // `profile: null` da solo non distingue «non ce l'ha» da «non lo so ancora».
    // Finché la lettura non è tornata la casella resta: un consenso in più non fa
    // danno, uno in meno sì.
    mockUseAuth.mockReturnValue(
      makeAuth({ profile: null, profileLoaded: false })
    );
    const { getByRole } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    expect(getByRole('checkbox')).toBeTruthy();
  });

  it('i campi già noti arrivano PRECOMPILATI dal profilo esistente', () => {
    mockUseAuth.mockReturnValue(makeAuth({ profile: existingProfile }));
    const { getByLabelText } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    // Senza idratazione la persona ritrova il form vuoto e deve ridigitare nome,
    // cognome e data di nascita per aggiungere il solo telefono.
    expect(
      (getByLabelText('Nome') as { props: { value: string } }).props.value
    ).toBe('Mario');
    expect(
      (getByLabelText('Cognome') as { props: { value: string } }).props.value
    ).toBe('Rossi');
  });

  it('se il profilo arriva MENTRE la persona scrive, non le cancella quello che ha digitato', () => {
    // La lettura può tornare dopo il primo render (arrivo diretto, rete lenta): un set
    // secco sovrascriverebbe il campo sotto le dita. Contro-prova: sostituendo
    // `prev || v` con un set incondizionato, questo test cade.
    mockUseAuth.mockReturnValue(
      makeAuth({ profile: null, profileLoaded: false })
    );
    const { getByLabelText, rerender } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fireEvent.changeText(getByLabelText('Nome'), 'Giovanna');
    mockUseAuth.mockReturnValue(makeAuth({ profile: existingProfile }));
    rerender(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    expect(
      (getByLabelText('Nome') as { props: { value: string } }).props.value
    ).toBe('Giovanna');
    // Gli altri campi, che lei non ha toccato, si riempiono comunque dal profilo.
    expect(
      (getByLabelText('Cognome') as { props: { value: string } }).props.value
    ).toBe('Rossi');
  });

  it('profilo ESTERO: il completamento NON lo italianizza', async () => {
    // Il danno vero dei default: gli altri campi vuoti sono bloccati dalla
    // validazione, `country` no — parte da 'IT', passa il controllo e sovrascrive
    // in silenzio il paese reale (e con esso la provincia). Contro-prova: togliendo
    // l'idratazione l'upsert torna a scrivere 'IT'.
    mockUseAuth.mockReturnValue(
      makeAuth({
        profile: {
          ...existingProfile,
          country: 'FR',
          city: 'Parigi',
          phone: '+33123456789',
        },
      })
    );
    const upsert = (
      supabase.from('profiles') as unknown as { upsert: jest.Mock }
    ).upsert;
    const { getByText, getByLabelText } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    // Il telefono NON si ridigita più: il campo riceve il valore del profilo e lo
    // mostra (F-EMAIL.27). Qui non si tocca la tastiera di proposito — è il punto
    // del test: il numero deve arrivare all'upsert per sola idratazione.
    expect(
      (
        getByLabelText('Telefono') as { props: { value: string } }
      ).props.value.replace(/\D/g, '')
    ).toBe('123456789');
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(upsert).toHaveBeenCalled());
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        country: 'FR',
        province: null,
        phone: '+33123456789',
      })
    );
  });

  it("mostra il campo Paese e l'upsert include country (default IT)", async () => {
    mockUseAuth.mockReturnValue(makeAuth());
    const upsert = (
      supabase.from('profiles') as unknown as { upsert: jest.Mock }
    ).upsert;
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    expect(getByText('Paese')).toBeTruthy();
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(upsert).toHaveBeenCalled());
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ country: 'IT' })
    );
  });

  it('S10: upsert NON ri-stampa marketing_consent (preserva la cache del consenso)', async () => {
    mockUseAuth.mockReturnValue(makeAuth());
    const upsert = (
      supabase.from('profiles') as unknown as { upsert: jest.Mock }
    ).upsert;
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(upsert).toHaveBeenCalled());
    expect(upsert).toHaveBeenCalledWith(
      expect.not.objectContaining({ marketing_consent: expect.anything() })
    );
  });

  it('S10: errore upsert → NON registra il consenso (recordConsent non chiamato)', async () => {
    const recordConsent = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(makeAuth({ recordConsent }));
    const upsert = (
      supabase.from('profiles') as unknown as { upsert: jest.Mock }
    ).upsert;
    upsert.mockResolvedValueOnce({ error: { message: 'boom' } });
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(upsert).toHaveBeenCalled());
    expect(recordConsent).not.toHaveBeenCalled();
  });
});

// F1.10: email di contatto obbligatoria SOLO per gli account Apple Private Relay.
const relaySession = {
  user: { id: 'u1', email: 'abc123@privaterelay.appleid.com' },
} as unknown as Session;

const getUpsert = (): jest.Mock =>
  (supabase.from('profiles') as unknown as { upsert: jest.Mock }).upsert;

describe('CompleteProfileScreen — F1.10 email di contatto (Apple relay)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('utente NON relay: il campo C’È, arriva PRECOMPILATO con la mail dell’account e finisce nell’upsert', async () => {
    mockUseAuth.mockReturnValue(makeAuth()); // email m@r.it (non relay)
    const upsert = getUpsert();
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    // Precompilato: chi ha già una mail reale non deve ridigitarla, e vede quale
    // indirizzo useremo. Contro-prova: togliendo l'effetto di precompilazione in
    // useProfileForm questo assert cade (il campo resta vuoto → submit bloccato).
    expect(getByLabelText('Email di contatto').props.value).toBe('m@r.it');
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(upsert).toHaveBeenCalled());
    // Scritta SEMPRE, non solo per gli alias: è la mail con cui riconosciamo la
    // persona nell'anagrafica importata dal partner.
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ contact_email: 'm@r.it' })
    );
  });

  it('utente NON relay: se SVUOTA la mail precompilata il submit è BLOCCATO', async () => {
    mockUseAuth.mockReturnValue(makeAuth());
    const upsert = getUpsert();
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.changeText(getByLabelText('Email di contatto'), '');
    fireEvent.press(getByText('Salva e continua'));

    // Contro-prova di `requireContactEmail: true`: rimettendo `isRelay` al suo posto
    // questo test cade, perché per un non-relay il campo tornerebbe facoltativo.
    expect(getByText('Campo obbligatorio')).toBeTruthy();
    await waitFor(() => expect(upsert).not.toHaveBeenCalled());
  });

  it('se cambia UTENTE, il testo digitato dal precedente non resta nel form del nuovo', () => {
    mockUseAuth.mockReturnValue(makeAuth()); // primo utente: m@r.it
    const { getByLabelText, rerender } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fireEvent.changeText(
      getByLabelText('Email di contatto'),
      'digitata@dal-primo.it'
    );

    // Cambio di utente senza smontare la schermata: possibile perché
    // CompleteProfile vive in uno stack unico, non separato per sessione.
    mockUseAuth.mockReturnValue(
      makeAuth({
        session: { user: { id: 'u2', email: 'secondo@r.it' } } as never,
      })
    );
    rerender(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );

    // Contro-prova del reset di `touchedForAccount`: senza quel confronto il flag
    // «l'ha digitato la persona» resterebbe true per sempre e il nuovo utente
    // vedrebbe nel campo l'indirizzo scritto dal precedente — un dato personale
    // che passa da una persona a un'altra.
    expect(getByLabelText('Email di contatto').props.value).toBe(
      'secondo@r.it'
    );
  });

  it('la precompilazione NON sovrascrive quello che la persona ha digitato', async () => {
    mockUseAuth.mockReturnValue(makeAuth());
    const upsert = getUpsert();
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fireEvent.changeText(getByLabelText('Email di contatto'), 'scelta@mia.it');
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.press(getByText('Salva e continua'));

    // Contro-prova del ref `contactEmailTouched`: senza quel flag un re-render con
    // sessione/profilo aggiornati riscriverebbe il campo sotto le dita della persona.
    await waitFor(() => expect(upsert).toHaveBeenCalled());
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ contact_email: 'scelta@mia.it' })
    );
  });

  it('utente relay: il campo compare e il submit è BLOCCATO se vuoto', async () => {
    mockUseAuth.mockReturnValue(makeAuth({ session: relaySession }));
    const upsert = getUpsert();
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    expect(getByLabelText('Email di contatto')).toBeTruthy();
    fillValidForm(getByLabelText, getByRole, getByTestId); // lascia vuoto il campo relay
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(getByText('Campo obbligatorio')).toBeTruthy());
    expect(upsert).not.toHaveBeenCalled();
  });

  it('utente relay: submit BLOCCATO se la mail è un altro indirizzo relay', async () => {
    mockUseAuth.mockReturnValue(makeAuth({ session: relaySession }));
    const upsert = getUpsert();
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.changeText(
      getByLabelText('Email di contatto'),
      'altro@privaterelay.appleid.com'
    );
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() =>
      expect(getByText(/non un indirizzo Apple nascosto/)).toBeTruthy()
    );
    expect(upsert).not.toHaveBeenCalled();
  });

  it('utente relay: submit BLOCCATO se la mail è di formato invalido', async () => {
    mockUseAuth.mockReturnValue(makeAuth({ session: relaySession }));
    const upsert = getUpsert();
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.changeText(getByLabelText('Email di contatto'), 'abc');
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(getByText('Email non valida')).toBeTruthy());
    expect(upsert).not.toHaveBeenCalled();
  });

  it('utente relay: submit OK con mail vera → upsert include contact_email', async () => {
    mockUseAuth.mockReturnValue(makeAuth({ session: relaySession }));
    const upsert = getUpsert();
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.changeText(getByLabelText('Email di contatto'), 'vera@mail.it');
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(upsert).toHaveBeenCalled());
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ contact_email: 'vera@mail.it' })
    );
  });
});

/**
 * F-NICKNAME-SOCIAL: il nickname si sceglie ANCHE qui.
 *
 * Perché conta: questa e la registrazione email/password sono le due schermate in cui un
 * profilo NASCE. Finché il campo esisteva solo nella seconda, chi entrava con un accesso
 * social non se lo vedeva proporre mai — stessa destinazione, due domande diverse a
 * seconda della porta da cui si è entrati.
 */
const getRpc = (): jest.Mock => (supabase as unknown as { rpc: jest.Mock }).rpc;

describe('CompleteProfileScreen — nickname', () => {
  beforeEach(() => jest.clearAllMocks());

  it('il nickname scelto qui arriva in colonna', async () => {
    mockUseAuth.mockReturnValue(makeAuth());
    const upsert = getUpsert();
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.changeText(
      getByLabelText('Nickname (facoltativo)'),
      'mariorossi'
    );
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(upsert).toHaveBeenCalled());
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ nickname: 'mariorossi' })
    );
  });

  it('campo lasciato vuoto → si scrive `null`, MAI la stringa vuota', async () => {
    // La colonna ha il CHECK `nickname_forma` (2-30 caratteri): una stringa vuota lo
    // violerebbe e il rifiuto porterebbe giù l'INTERO upsert — cioè anche i campi
    // obbligatori appena compilati. `null` è il modo in cui la colonna dice «non ne ho».
    mockUseAuth.mockReturnValue(makeAuth());
    const upsert = getUpsert();
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(upsert).toHaveBeenCalled());
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ nickname: null })
    );
  });

  it('forma sbagliata → errore sul campo e NIENTE viene scritto', async () => {
    // Senza questo controllo il trigger scarterebbe il valore in silenzio: la persona
    // scriverebbe un nickname, non vedrebbe nessun errore, e non lo troverebbe più.
    mockUseAuth.mockReturnValue(makeAuth());
    const upsert = getUpsert();
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.changeText(getByLabelText('Nickname (facoltativo)'), 'a');
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(getByText(/da 2 a 30 caratteri/)).toBeTruthy());
    expect(upsert).not.toHaveBeenCalled();
  });

  it('nickname già di qualcun altro → il salvataggio si ferma PRIMA di partire', async () => {
    mockUseAuth.mockReturnValue(makeAuth());
    const upsert = getUpsert();
    getRpc().mockResolvedValue({ data: false, error: null });
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.changeText(getByLabelText('Nickname (facoltativo)'), 'occupato');
    // Il verdetto arriva dopo l'attesa del campo (450 ms): si aspetta quello, non un
    // tempo a caso — è la risposta del server a decidere, non il cronometro.
    await waitFor(() => expect(getRpc()).toHaveBeenCalled(), { timeout: 3000 });
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(getByText(/già di qualcun altro/)).toBeTruthy());
    expect(upsert).not.toHaveBeenCalled();
  });

  it('IL PROPRIO nickname, arrivato dal profilo, non viene chiesto al server né blocca il salvataggio', async () => {
    // 🔴 IL DIFETTO CHE QUESTO TEST TIENE CHIUSO, previsto per iscritto in
    // `useNicknameAvailability.ts:51-59` prima che esistesse questo form.
    // Il campo nasce vuoto e viene riempito dal profilo DOPO il primo render: per il
    // controllo di disponibilità quel cambiamento è indistinguibile da una digitazione,
    // quindi parte una domanda al server su un nickname che è GIÀ SUO. La risposta è
    // «occupato» — vera e inutile — e il salvataggio si blocca addosso a chi non ha
    // toccato niente, sul campo che non voleva nemmeno cambiare.
    // La difesa non è «non chiedere quando la risposta è occupato» (sarebbe cieca sul
    // caso vero): è che una scrittura NOSTRA non è una digitazione della persona.
    mockUseAuth.mockReturnValue(
      makeAuth({
        profile: { ...existingProfile, nickname: 'mario' },
        profileLoaded: true,
      })
    );
    const upsert = getUpsert();
    getRpc().mockResolvedValue({ data: false, error: null });
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    // Il campo si è riempito da solo col nickname della persona.
    await waitFor(() =>
      expect(
        (
          getByLabelText('Nickname (facoltativo)') as {
            props: { value: string };
          }
        ).props.value
      ).toBe('mario')
    );
    // ⚠️ SI ASPETTA OLTRE L'ATTESA DEL CAMPO (450 ms), e non è pignoleria: senza,
    // «il server non è stato interrogato» sarebbe vero solo perché la domanda non ha
    // ancora avuto il tempo di partire — un verde che non guarda niente. Con questa
    // attesa, se la difesa non ci fosse la richiesta sarebbe già partita.
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 700));
    });
    expect(getRpc()).not.toHaveBeenCalled();
    fillValidForm(getByLabelText, getByRole, getByTestId, { consent: false });
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(upsert).toHaveBeenCalled());
    // Nessuna domanda al server: il valore non l'ha scritto la persona.
    expect(getRpc()).not.toHaveBeenCalled();
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ nickname: 'mario' })
    );
  });

  it('la corsa persa dice QUALE campo cambiare e che non è stato salvato niente', async () => {
    // Fra il controllo e il salvataggio qualcun altro ha preso lo stesso nickname.
    // L'errore generico manderebbe la persona a ricontrollare nome, telefono e città
    // mentre il campo da cambiare è uno solo.
    mockUseAuth.mockReturnValue(makeAuth());
    const upsert = getUpsert();
    upsert.mockResolvedValueOnce({
      error: {
        message:
          'duplicate key value violates unique constraint "profiles_nickname_unico"',
      },
    });
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.changeText(
      getByLabelText('Nickname (facoltativo)'),
      'contesissimo'
    );
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() =>
      expect(getByText(/un attimo prima di te/)).toBeTruthy()
    );
    // E che il resto del modulo NON è stato scritto: l'upsert è uno solo, quindi il
    // rifiuto dell'indice porta giù anche i campi corretti.
    expect(getByText(/Nessuna modifica è stata salvata/)).toBeTruthy();
  });

  it('dopo il salvataggio il nickname viaggia verso il claim del partner', async () => {
    // `preferred_username` è la chiave da cui il server auth costruisce il claim OIDC.
    // (Dalla migration 0020 il claim lo deriva il database: questa resta la strada per
    // tenerlo allineato fino a quel momento, e innocua dopo.)
    mockUseAuth.mockReturnValue(makeAuth());
    const updateUser = (supabase.auth as unknown as { updateUser: jest.Mock })
      .updateUser;
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.changeText(
      getByLabelText('Nickname (facoltativo)'),
      'mariorossi'
    );
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() =>
      expect(updateUser).toHaveBeenCalledWith({
        data: { preferred_username: 'mariorossi' },
      })
    );
  });
});
