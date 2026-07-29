import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { fillValidProfileForm } from '../../helpers/profileFormHelpers';
import { CompleteProfileScreen } from '@/features/auth/screens/CompleteProfileScreen';
import { useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';
import {
  getProfileCompletion,
  missingProfileFields,
} from '@/shared/auth/profileCompletion';
import type { Profile } from '@/shared/auth/types';

/**
 * Il cancello visto dalla schermata: la CONTRO-PROVA che salvare lo apre, e le due vie
 * d'uscita che impediscono di restare in trappola.
 *
 * Perché questa suite esiste: il timore che Riccardo ha nominato per primo è che il
 * passaggio «ricompaia ogni volta anche a chi l'aveva già fatto». Succede quando i
 * campi che il cancello pretende e i campi che il form raccoglie smettono di
 * coincidere — nessuno dei due lati sbaglia da solo, sbagliano insieme. Il test qui
 * sotto prende ciò che il salvataggio manda DAVVERO al database e lo giudica con lo
 * stesso predicato del cancello: se un domani divergono, diventa rosso.
 */
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
    canGoBack: () => false,
  }),
}));

jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/shared/auth/supabaseClient', () => {
  const upsert = jest.fn(() => Promise.resolve({ error: null }));
  const updateUser = jest.fn(() => Promise.resolve({ data: {}, error: null }));
  return {
    supabase: { from: jest.fn(() => ({ upsert })), auth: { updateUser } },
  };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const signOut = jest.fn();

const makeAuth = (over: Partial<AuthState> = {}): AuthState =>
  ({
    status: 'authenticated',
    session: { user: { id: 'u1', email: 'm@r.it' } } as unknown as Session,
    profile: null,
    profileLoaded: true,
    signOut,
    refreshProfile: jest.fn(),
    recordConsent: jest.fn().mockResolvedValue({ error: null }),
    needsReConsent: false,
    ...over,
  }) as AuthState;

const getUpsert = (): jest.Mock =>
  (supabase.from('profiles') as unknown as { upsert: jest.Mock }).upsert;

const completeProfile: Profile = {
  id: 'u1',
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  birth_date: '1990-01-01',
  privacy_consent_at: '2026-01-01T00:00:00Z',
  marketing_consent: false,
  deletion_requested_at: null,
  contact_email: 'm@r.it',
  nickname: null,
};

describe('contro-prova: dopo il salvataggio il profilo è completo', () => {
  beforeEach(() => jest.clearAllMocks());

  it('ciò che viene scritto sul database soddisfa il predicato del cancello', async () => {
    mockUseAuth.mockReturnValue(makeAuth());
    const upsert = getUpsert();

    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidProfileForm(getByLabelText, getByRole, getByTestId);
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(upsert).toHaveBeenCalled());

    // Non si guarda «il form era valido», si guarda la RIGA che parte: è quella che il
    // cancello leggerà al giro dopo.
    const written = upsert.mock.calls[0][0] as Profile;
    expect(missingProfileFields(written)).toEqual([]);
    expect(getProfileCompletion(written, true)).toBe('complete');
  });

  it('il predicato NON è compiacente: tolto un campo, lo stesso profilo è incompleto', async () => {
    // Contro-prova della contro-prova. Senza questa, un predicato che dicesse «completo»
    // a qualunque cosa farebbe passare il test sopra senza provare niente — è la trappola
    // del test verde per costruzione.
    mockUseAuth.mockReturnValue(makeAuth());
    const upsert = getUpsert();

    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidProfileForm(getByLabelText, getByRole, getByTestId);
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(upsert).toHaveBeenCalled());
    const written = upsert.mock.calls[0][0] as Profile;

    expect(getProfileCompletion({ ...written, phone: null }, true)).toBe(
      'incomplete'
    );
    expect(getProfileCompletion({ ...written, city: null }, true)).toBe(
      'incomplete'
    );
    expect(
      getProfileCompletion({ ...written, contact_email: null }, true)
    ).toBe('incomplete');
  });

  it('un profilo che resterebbe incompleto non viene scritto: errore leggibile, dato fermo', () => {
    // Il salvataggio consulta lo stesso predicato PRIMA di scrivere. Qui il form non è
    // stato compilato: la validazione lo ferma già, e infatti al database non arriva
    // nulla — la persona non finisce mai in un salvataggio riuscito che lascia il
    // cancello chiuso.
    mockUseAuth.mockReturnValue(makeAuth());
    const upsert = getUpsert();

    const { getByText } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fireEvent.press(getByText('Salva e continua'));

    expect(upsert).not.toHaveBeenCalled();
  });
});

describe('vie d’uscita dal cancello', () => {
  beforeEach(() => jest.clearAllMocks());

  it('con il profilo da completare offre di uscire e di eliminare l’account', () => {
    // Senza queste due, il passaggio obbligato è una stanza chiusa: chi non può
    // completare (la data di nascita che non passa) o non vuole farlo adesso
    // disinstallerebbe l'app.
    mockUseAuth.mockReturnValue(
      makeAuth({ profile: null, profileLoaded: true })
    );
    const { getByText } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    expect(getByText('Esci')).toBeTruthy();
    expect(getByText('Elimina account')).toBeTruthy();
  });

  it('«Esci» chiude la sessione: si torna nell’app come ospite', () => {
    mockUseAuth.mockReturnValue(
      makeAuth({ profile: null, profileLoaded: true })
    );
    const { getByText } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fireEvent.press(getByText('Esci'));
    expect(signOut).toHaveBeenCalled();
  });

  it('«Elimina account» porta alla schermata di cancellazione', () => {
    mockUseAuth.mockReturnValue(
      makeAuth({ profile: null, profileLoaded: true })
    );
    const { getByText } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fireEvent.press(getByText('Elimina account'));
    expect(mockNavigate).toHaveBeenCalledWith('DeleteAccount');
  });

  it('a profilo completo le vie d’uscita NON compaiono: lì non c’è nessun cancello', () => {
    mockUseAuth.mockReturnValue(
      makeAuth({ profile: completeProfile, profileLoaded: true })
    );
    const { queryByText } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    expect(queryByText('Esci')).toBeNull();
    expect(queryByText('Elimina account')).toBeNull();
  });
});
