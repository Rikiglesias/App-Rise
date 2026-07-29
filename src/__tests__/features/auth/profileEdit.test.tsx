import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { ProfileEditScreen } from '@/features/auth/screens/ProfileEditScreen';
import { useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import type { Profile } from '@/shared/auth/types';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const makeAuth = (over: Partial<AuthState> = {}): AuthState =>
  ({
    status: 'authenticated',
    session: {
      user: { id: 'u1', email: 'old@r.it', identities: [] },
    } as unknown as Session,
    profile: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    refreshProfile: jest.fn(),
    updateProfile: jest.fn().mockResolvedValue({ error: null }),
    updateEmail: jest.fn().mockResolvedValue({ error: null }),
    deleteAccountNow: jest.fn(),
    scheduleDeletion: jest.fn(),
    cancelScheduledDeletion: jest.fn(),
    exportData: jest.fn(),
    recordConsent: jest.fn(),
    setMarketingConsent: jest.fn(),
    getConsentHistory: jest.fn(),
    needsReConsent: false,
    acceptCurrentPolicy: jest.fn(),
    ...over,
  }) as AuthState;

const profile: Profile = {
  id: 'u1',
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  birth_date: '1990-01-01',
  privacy_consent_at: '2026-01-01T00:00:00.000Z',
  marketing_consent: false,
  deletion_requested_at: null,
  // Dal 2026-07-25 la mail di contatto è obbligatoria per TUTTI gli account, non
  // solo per gli alias Apple: un profilo realistico la ha popolata.
  contact_email: 'mario@r.it',
  nickname: null,
};

const wrap = (ui: React.ReactElement) =>
  render(<AllProviders>{ui}</AllProviders>);

describe('ProfileEditScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('pre-popola il form coi valori del profilo', () => {
    mockUseAuth.mockReturnValue(makeAuth({ profile }));
    const { getByDisplayValue } = wrap(<ProfileEditScreen />);
    expect(getByDisplayValue('Mario')).toBeTruthy();
    expect(getByDisplayValue('Rossi')).toBeTruthy();
    expect(getByDisplayValue('old@r.it')).toBeTruthy();
    // Il telefono usa ora il campo col selettore del prefisso (come nel resto
    // dell'app): a schermo compare la sola parte nazionale, il '+39' vive nel
    // selettore accanto. Ciò che deve restare E.164 è il valore SALVATO, ed è
    // verificato dal test del submit più sotto.
    expect(getByDisplayValue('333 123 4567')).toBeTruthy();
  });

  it('mostra il campo Paese (valore dal profilo)', () => {
    mockUseAuth.mockReturnValue(makeAuth({ profile }));
    const { getByText } = wrap(<ProfileEditScreen />);
    expect(getByText('Paese')).toBeTruthy();
  });

  it('telefono invalido → errore e updateProfile NON chiamato', () => {
    const updateProfile = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(makeAuth({ profile, updateProfile }));
    const { getByLabelText, getByText, queryByText } = wrap(
      <ProfileEditScreen />
    );
    fireEvent.changeText(getByLabelText('Telefono'), 'abc');
    fireEvent.press(getByText('Salva modifiche'));
    expect(queryByText('Telefono non valido (es. +39...)')).toBeTruthy();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('salva SOLO i campi cambiati (telefono)', async () => {
    const updateProfile = jest.fn().mockResolvedValue({ error: null });
    const updateEmail = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(
      makeAuth({ profile, updateProfile, updateEmail })
    );
    const { getByLabelText, getByText, findByText } = wrap(
      <ProfileEditScreen />
    );
    fireEvent.changeText(getByLabelText('Telefono'), '+393339998877');
    fireEvent.press(getByText('Salva modifiche'));
    await findByText('Profilo aggiornato.');
    expect(updateProfile).toHaveBeenCalledWith({ phone: '+393339998877' });
    expect(updateEmail).not.toHaveBeenCalled();
  });

  it('cambio email → updateEmail chiamato + nota doppia conferma', async () => {
    const updateProfile = jest.fn().mockResolvedValue({ error: null });
    const updateEmail = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(
      makeAuth({ profile, updateProfile, updateEmail })
    );
    const { getByLabelText, getByText, findByText } = wrap(
      <ProfileEditScreen />
    );
    fireEvent.changeText(getByLabelText('Email'), 'new@r.it');
    fireEvent.press(getByText('Salva modifiche'));
    await findByText(/entrambe le caselle/i);
    expect(updateEmail).toHaveBeenCalledWith('new@r.it');
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('S8: mostra il banner email-in-attesa da session.user.new_email', () => {
    mockUseAuth.mockReturnValue(
      makeAuth({
        profile,
        session: {
          user: {
            id: 'u1',
            email: 'old@r.it',
            new_email: 'pending@r.it',
            identities: [],
          },
        } as unknown as Session,
      })
    );
    const { getByText } = wrap(<ProfileEditScreen />);
    expect(getByText(/pending@r.it/)).toBeTruthy();
  });

  it('S8: senza new_email nessun banner pending', () => {
    mockUseAuth.mockReturnValue(makeAuth({ profile }));
    const { queryByText } = wrap(<ProfileEditScreen />);
    expect(queryByText(/in attesa di conferma/i)).toBeNull();
  });

  it('S12: errore updateProfile → messaggio errore e updateEmail NON chiamato', async () => {
    const updateProfile = jest.fn().mockResolvedValue({ error: 'boom' });
    const updateEmail = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(
      makeAuth({ profile, updateProfile, updateEmail })
    );
    const { getByLabelText, getByText, findByText } = wrap(
      <ProfileEditScreen />
    );
    fireEvent.changeText(getByLabelText('Telefono'), '+393339998877');
    fireEvent.press(getByText('Salva modifiche'));
    await findByText('Aggiornamento non riuscito. Riprova.');
    expect(updateEmail).not.toHaveBeenCalled();
  });
});

// Blocco a sé: la mail di contatto ha una storia sua (raccolta prima solo dagli
// account Apple relay, poi obbligatoria per tutti) e abbastanza casi da sforare il
// limite di righe per funzione se restasse nel describe sopra.
describe('ProfileEditScreen — mail di contatto', () => {
  beforeEach(() => jest.clearAllMocks());

  // Account con "Nascondi la mia email": la mail dell'account è un alias che non
  // recapita in modo stabile, quindi quella di contatto è l'unico indirizzo vero.
  const relayAuth = (over: Partial<AuthState> = {}): AuthState =>
    makeAuth({
      profile,
      session: {
        user: {
          id: 'u1',
          email: 'abc123@privaterelay.appleid.com',
          identities: [],
        },
      } as unknown as Session,
      ...over,
    });

  it('utente NON relay → il campo email di contatto C’È (obbligatorio per tutti)', () => {
    mockUseAuth.mockReturnValue(makeAuth({ profile })); // email old@r.it
    const { getByLabelText } = wrap(<ProfileEditScreen />);
    // Un campo obbligatorio che non si vede bloccherebbe il salvataggio senza dire
    // perché: da quando la mail serve a riconoscere la persona nell'anagrafica
    // importata dal partner, il campo è visibile a tutti.
    expect(getByLabelText('Email di contatto')).toBeTruthy();
  });

  it('utente NON relay → svuotare la mail di contatto BLOCCA il salvataggio', () => {
    const updateProfile = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(makeAuth({ profile, updateProfile }));
    const { getByLabelText, getByText } = wrap(<ProfileEditScreen />);
    fireEvent.changeText(getByLabelText('Email di contatto'), '');
    fireEvent.press(getByText('Salva modifiche'));
    // Contro-prova del gemello: se la validazione restasse condizionata al relay,
    // qui si potrebbe svuotare ciò che alla nascita del profilo è obbligatorio.
    expect(getByText('Campo obbligatorio')).toBeTruthy();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('utente NON relay → la mail di contatto modificata viene SALVATA', async () => {
    const updateProfile = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(makeAuth({ profile, updateProfile }));
    const { getByLabelText, getByText, findByText } = wrap(
      <ProfileEditScreen />
    );
    fireEvent.changeText(getByLabelText('Email di contatto'), 'nuova@r.it');
    fireEvent.press(getByText('Salva modifiche'));
    await findByText('Profilo aggiornato.');
    // Contro-prova: col vecchio `if (isRelay && …)` la modifica passava la
    // validazione e NON veniva scritta — in silenzio.
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ contact_email: 'nuova@r.it' })
    );
  });

  it('F1.10: utente relay → campo presente e salvato in contact_email', async () => {
    const updateProfile = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(relayAuth({ updateProfile }));
    const { getByLabelText, getByText, findByText } = wrap(
      <ProfileEditScreen />
    );
    fireEvent.changeText(getByLabelText('Email di contatto'), 'vera@mail.it');
    fireEvent.press(getByText('Salva modifiche'));
    await findByText('Profilo aggiornato.');
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ contact_email: 'vera@mail.it' })
    );
  });

  it('F1.10: utente relay → submit BLOCCATO se svuota la mail di contatto', () => {
    const updateProfile = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(
      relayAuth({
        updateProfile,
        profile: { ...profile, contact_email: 'vecchia@mail.it' },
      })
    );
    const { getByLabelText, getByText } = wrap(<ProfileEditScreen />);
    fireEvent.changeText(getByLabelText('Email di contatto'), '');
    fireEvent.press(getByText('Salva modifiche'));
    expect(getByText('Campo obbligatorio')).toBeTruthy();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('F1.10: utente relay → BLOCCATO se la mail di contatto è malformata', () => {
    const updateProfile = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(relayAuth({ updateProfile }));
    const { getByLabelText, getByText } = wrap(<ProfileEditScreen />);
    fireEvent.changeText(getByLabelText('Email di contatto'), 'abc');
    fireEvent.press(getByText('Salva modifiche'));
    expect(getByText('Email non valida')).toBeTruthy();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('F1.10: utente relay → BLOCCATO se la mail di contatto è un altro relay', () => {
    const updateProfile = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(relayAuth({ updateProfile }));
    const { getByLabelText, getByText } = wrap(<ProfileEditScreen />);
    fireEvent.changeText(
      getByLabelText('Email di contatto'),
      'altro@privaterelay.appleid.com'
    );
    fireEvent.press(getByText('Salva modifiche'));
    expect(getByText(/non un indirizzo Apple nascosto/)).toBeTruthy();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('profilo nato PRIMA della regola (contact_email null): la rettifica di altri campi NON è bloccata', async () => {
    // Art.16: correggere i propri dati è un diritto. Pretendere qui una mail che a
    // quella persona nessuno aveva mai chiesto significava tenerle in ostaggio anche
    // il solo cambio di telefono. Il campo resta visibile e lo chiede il sollecito
    // del profilo, che non blocca nulla.
    const updateProfile = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(
      makeAuth({ profile: { ...profile, contact_email: null }, updateProfile })
    );
    const { getByLabelText, getByText, findByText } = wrap(
      <ProfileEditScreen />
    );
    fireEvent.changeText(getByLabelText('Telefono'), '+393339999999');
    fireEvent.press(getByText('Salva modifiche'));
    await findByText('Profilo aggiornato.');
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '+393339999999' })
    );
    // E non si scrive una stringa vuota nella colonna: chi non l'ha, resta senza.
    expect(updateProfile).toHaveBeenCalledWith(
      expect.not.objectContaining({ contact_email: expect.anything() })
    );
  });

  it('profilo nato PRIMA della regola: se però la SCRIVE, deve essere valida', () => {
    // Il permesso vale per il campo lasciato vuoto, non per un valore qualsiasi.
    const updateProfile = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(
      makeAuth({ profile: { ...profile, contact_email: null }, updateProfile })
    );
    const { getByLabelText, getByText } = wrap(<ProfileEditScreen />);
    fireEvent.changeText(getByLabelText('Email di contatto'), 'abc');
    fireEvent.press(getByText('Salva modifiche'));
    expect(getByText('Email non valida')).toBeTruthy();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  // --- La colonna può cambiare SOTTO la schermata (migration 0013) -----------
  // Il trigger `on_auth_user_email_changed` riallinea `contact_email` quando la
  // persona conferma il cambio della mail dell'account, e AuthContext ricarica il
  // profilo. Se la schermata non si ri-sincronizza, al salvataggio successivo
  // rispedisce l'indirizzo vecchio e ANNULLA il riallineo: la chiave con cui la
  // 0012 cancella le anagrafiche storiche tornerebbe a un indirizzo abbandonato.
  it('la mail di contatto riallineata dal database NON viene rispedita vecchia', () => {
    const updateProfile = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(
      makeAuth({
        profile: { ...profile, contact_email: 'vecchia@r.it' },
        updateProfile,
      })
    );
    const { rerender, getByLabelText, getByText } = wrap(<ProfileEditScreen />);

    // Il trigger ha riallineato la colonna e il profilo è stato ricaricato.
    mockUseAuth.mockReturnValue(
      makeAuth({
        profile: { ...profile, contact_email: 'nuova@r.it' },
        updateProfile,
      })
    );
    // `wrap` monta i provider: il re-render deve rifarlo, altrimenti il tema sparisce.
    rerender(
      <AllProviders>
        <ProfileEditScreen />
      </AllProviders>
    );

    // La persona modifica un ALTRO campo e salva, senza toccare la mail di contatto:
    // è lo scenario reale (torno sulla schermata e sistemo il telefono).
    fireEvent.changeText(getByLabelText('Telefono'), '+393339998877');
    fireEvent.press(getByText('Salva modifiche'));

    // Il patch deve contenere il telefono e NON la mail. Senza la ri-sincronizzazione
    // lo stato locale resterebbe a 'vecchia@r.it', il confronto la vedrebbe diversa
    // da 'nuova@r.it' e la rispedirebbe: questo assert è la contro-prova.
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '+393339998877' })
    );
    expect(updateProfile).not.toHaveBeenCalledWith(
      expect.objectContaining({ contact_email: expect.anything() })
    );
  });

  it('ma se è la PERSONA a scriverla, il ricarico del profilo non gliela sovrascrive', () => {
    // Contro-prova del test sopra: la ri-sincronizzazione si ferma appena lei
    // digita, altrimenti le cancelleremmo sotto le dita quello che ha scritto.
    const updateProfile = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(
      makeAuth({
        profile: { ...profile, contact_email: 'vecchia@r.it' },
        updateProfile,
      })
    );
    const { rerender, getByLabelText, getByText } = wrap(<ProfileEditScreen />);

    fireEvent.changeText(getByLabelText('Email di contatto'), 'scelta@r.it');

    mockUseAuth.mockReturnValue(
      makeAuth({
        profile: { ...profile, contact_email: 'nuova@r.it' },
        updateProfile,
      })
    );
    // `wrap` monta i provider: il re-render deve rifarlo, altrimenti il tema sparisce.
    rerender(
      <AllProviders>
        <ProfileEditScreen />
      </AllProviders>
    );

    fireEvent.press(getByText('Salva modifiche'));

    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ contact_email: 'scelta@r.it' })
    );
  });
});
