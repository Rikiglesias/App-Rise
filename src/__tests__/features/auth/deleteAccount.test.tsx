import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { DeleteAccountScreen } from '@/features/auth/screens/DeleteAccountScreen';
import { ProfileScreen } from '@/features/auth/screens/ProfileScreen';
import { ReConsentScreen } from '@/features/auth/screens/ReConsentScreen';
import { useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import type { Profile } from '@/shared/auth/types';
import itLocale from '@/locales/it';
import { RISE_URLS } from '@/shared/constants/urls';

const mockOpenLink = jest.fn().mockResolvedValue({ ok: true });
jest.mock('@/shared/hooks/useLinkHandler', () => ({
  useLinkHandler: () => ({ openLink: mockOpenLink, isLoading: null }),
}));

jest.mock('@react-navigation/native', () => {
  const navigate = jest.fn();
  return { useNavigation: () => ({ navigate, goBack: jest.fn() }) };
});

jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// La cancellazione differita è offerta solo se qualcuno la esegue davvero
// (`CANCELLAZIONE_PROGRAMMATA_ATTIVA`). Qui la costante è esposta da un getter
// perché servono ENTRAMBI gli stati: quello di oggi — spento, e che non deve
// promettere nulla — e quello di destinazione, che va tenuto in vita e verde
// mentre è spento, altrimenti il giorno in cui si riaccende si scopre rotto.
let mockCancellazioneProgrammataAttiva = false;
jest.mock('@/shared/auth/deletionPolicy', () => {
  const reale = jest.requireActual('@/shared/auth/deletionPolicy');
  return {
    // Esplicito: Babel definisce `__esModule` come NON enumerabile, quindi uno
    // spread di `requireActual` lo perde e l'interop dei named import salta.
    __esModule: true,
    GRACE_DAYS: reale.GRACE_DAYS,
    get CANCELLAZIONE_PROGRAMMATA_ATTIVA() {
      return mockCancellazioneProgrammataAttiva;
    },
  };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const makeAuth = (over: Partial<AuthState> = {}): AuthState =>
  ({
    status: 'authenticated',
    session: {
      user: { id: 'u1', email: 'm@r.it', identities: [] },
    } as unknown as Session,
    profile: null,
    // Lettura del profilo ARRIVATA: senza questo, `getProfileCompletion` risponde
    // «non lo so ancora» e nessun sollecito compare — che è il comportamento giusto
    // durante il caricamento, ma non il caso che questi test descrivono.
    profileLoaded: true,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    resetPassword: jest.fn(),
    refreshProfile: jest.fn(),
    updateProfile: jest.fn(),
    updateEmail: jest.fn(),
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

const profileWithDeletion: Profile = {
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
  deletion_requested_at: '2026-06-15T00:00:00.000Z',
  // Un profilo COMPLETO include la mail di contatto: da quando è obbligatoria per
  // tutti, un profilo che ne è privo ha ancora qualcosa da chiedere (il sollecito
  // deve vederlo — era il buco per cui un account email/password risultava a posto).
  contact_email: 'vera@mail.it',
  nickname: null,
};

const wrap = (ui: React.ReactElement) =>
  render(<AllProviders>{ui}</AllProviders>);

describe('DeleteAccountScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCancellazioneProgrammataAttiva = false;
  });

  // Nessuno esegue l'eliminazione differita (`pg_cron` non è installato in
  // produzione, verificato il 2026-08-15), quindi l'opzione non va offerta: chi
  // la sceglieva restava nel database per sempre credendo di essersi cancellato.
  it('finché nessuno la esegue, la cancellazione a 30 giorni NON è offerta', () => {
    mockUseAuth.mockReturnValue(makeAuth());
    const { getByText, queryByText } = wrap(<DeleteAccountScreen />);
    expect(getByText('Elimina subito')).toBeTruthy();
    expect(queryByText('Elimina tra 30 giorni')).toBeNull();
    // Non sparisce solo il pulsante: sparisce la frase che fa la promessa. Il
    // testo si prende dal dizionario e non si ricopia a mano, altrimenti il
    // giorno che qualcuno lo riscrive questo `queryByText` cerca una stringa che
    // non esiste più e passa sempre, senza controllare nulla.
    expect(queryByText(itLocale.auth.delete.scheduledHint)).toBeNull();
  });

  // Il ramo spento va tenuto VIVO: senza questo test marcirebbe in silenzio e si
  // scoprirebbe rotto il giorno in cui la leva viene tirata.
  it('riaccesa la leva, l’opzione torna e programma davvero la cancellazione', async () => {
    mockCancellazioneProgrammataAttiva = true;
    const scheduleDeletion = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(makeAuth({ scheduleDeletion }));
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _msg, buttons) => {
        const confirm = (buttons as { text?: string; onPress?: () => void }[])
          ?.length
          ? (buttons as { text?: string; onPress?: () => void }[])[1]
          : undefined;
        confirm?.onPress?.();
      });
    const { getByText } = wrap(<DeleteAccountScreen />);
    fireEvent.press(getByText('Elimina tra 30 giorni'));
    await waitFor(() => expect(scheduleDeletion).toHaveBeenCalled());
    alertSpy.mockRestore();
  });

  it('senza conferma dell’Alert NON elimina (doppia conferma)', () => {
    const deleteAccountNow = jest.fn();
    mockUseAuth.mockReturnValue(makeAuth({ deleteAccountNow }));
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation(() => undefined);
    const { getByText } = wrap(<DeleteAccountScreen />);
    fireEvent.press(getByText('Elimina subito'));
    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(deleteAccountNow).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('S12: confermando chiama deleteAccountNow senza argomenti', async () => {
    const deleteAccountNow = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(makeAuth({ deleteAccountNow }));
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _msg, buttons) => {
        const confirm = (
          buttons as { style?: string; onPress?: () => void }[]
        )?.find(b => b.style === 'destructive');
        confirm?.onPress?.();
      });
    const { getByText } = wrap(<DeleteAccountScreen />);
    fireEvent.press(getByText('Elimina subito'));
    await waitFor(() => expect(deleteAccountNow).toHaveBeenCalledWith());
    alertSpy.mockRestore();
  });

  // REGRESSIONE della rimozione social: chi ha un'identità apple residua (account
  // creato prima) non deve incontrare NESSUN passaggio in più — niente re-login
  // Apple, nessuna schermata di mezzo. La cancellazione parte identica a tutti.
  it('S12-bis: identità apple residua → nessun passaggio extra, stessa chiamata', async () => {
    const deleteAccountNow = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(
      makeAuth({
        deleteAccountNow,
        session: {
          user: {
            id: 'u1',
            email: 'm@r.it',
            identities: [{ provider: 'apple' }],
          },
        } as unknown as Session,
      })
    );
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _msg, buttons) => {
        const confirm = (
          buttons as { style?: string; onPress?: () => void }[]
        )?.find(b => b.style === 'destructive');
        confirm?.onPress?.();
      });
    const { getByText } = wrap(<DeleteAccountScreen />);
    fireEvent.press(getByText('Elimina subito'));
    await waitFor(() => expect(deleteAccountNow).toHaveBeenCalledWith());
    alertSpy.mockRestore();
  });
});

describe('ProfileScreen (autenticato)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('mostra le CTA esporta dati ed elimina account', () => {
    mockUseAuth.mockReturnValue(makeAuth());
    const { getByText } = wrap(<ProfileScreen />);
    expect(getByText('Esporta i miei dati')).toBeTruthy();
    expect(getByText('Elimina account')).toBeTruthy();
  });

  it('mostra il banner di cancellazione programmata con annulla', () => {
    mockUseAuth.mockReturnValue(makeAuth({ profile: profileWithDeletion }));
    const { getByText } = wrap(<ProfileScreen />);
    expect(getByText('Annulla eliminazione')).toBeTruthy();
  });

  it('il toggle marketing chiama setMarketingConsent', () => {
    const setMarketingConsent = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(makeAuth({ setMarketingConsent }));
    const { getByRole } = wrap(<ProfileScreen />);
    fireEvent(getByRole('switch'), 'valueChange', true);
    expect(setMarketingConsent).toHaveBeenCalledWith(true);
  });

  it('mostra il re-consenso quando needsReConsent è true', () => {
    mockUseAuth.mockReturnValue(makeAuth({ needsReConsent: true }));
    const { getByText } = wrap(<ProfileScreen />);
    expect(getByText('Aggiornamento informativa')).toBeTruthy();
  });

  it('mostra "Modifica profilo" e naviga a ProfileEdit quando il profilo esiste', () => {
    const activeProfile: Profile = {
      ...profileWithDeletion,
      deletion_requested_at: null,
    };
    mockUseAuth.mockReturnValue(makeAuth({ profile: activeProfile }));
    const { getByText } = wrap(<ProfileScreen />);
    fireEvent.press(getByText('Modifica profilo'));
    const navigate = (
      jest.requireMock('@react-navigation/native').useNavigation() as {
        navigate: jest.Mock;
      }
    ).navigate;
    expect(navigate).toHaveBeenCalledWith('ProfileEdit');
  });

  it('senza profilo NON mostra "Modifica profilo" (mostra completa profilo)', () => {
    mockUseAuth.mockReturnValue(makeAuth({ profile: null }));
    const { queryByText, getByText } = wrap(<ProfileScreen />);
    expect(queryByText('Modifica profilo')).toBeNull();
    expect(getByText('Completa il tuo profilo')).toBeTruthy();
  });

  it('P2: profilo che ESISTE ma con campi mancanti → chiede di completarlo', () => {
    // È il caso che nasce col profilo minimo (migration 0010) e che prima non
    // esisteva: il profilo c'è, quindi la vecchia condizione `!profile` mostrava
    // «Modifica profilo» e i campi mancanti non venivano mai chiesti a nessuno.
    mockUseAuth.mockReturnValue(
      makeAuth({
        profile: {
          ...profileWithDeletion,
          deletion_requested_at: null,
          phone: null,
          city: null,
          province: null,
        },
      })
    );
    const { queryByText, getByText, getAllByText } = wrap(<ProfileScreen />);
    expect(getByText('Completa il tuo profilo')).toBeTruthy();
    expect(queryByText('Modifica profilo')).toBeNull();
    // I campi mancanti si leggono come «da completare», non come righe vuote:
    // telefono e località, due righe.
    expect(getAllByText('Da completare')).toHaveLength(2);
  });

  it('mentre il profilo si sta caricando non compare NESSUNO dei due pulsanti', () => {
    // `!profile` è vero anche per chi il profilo ce l'ha: senza la guardia comparirebbe
    // «Completa il tuo profilo» a chi è a posto, e cambierebbe sotto il dito un istante
    // dopo. Contro-prova: togliendo `!profileLoaded ? null :` questo test cade.
    mockUseAuth.mockReturnValue(
      makeAuth({ profile: null, profileLoaded: false })
    );
    const { queryByText } = wrap(<ProfileScreen />);
    expect(queryByText('Completa il tuo profilo')).toBeNull();
    expect(queryByText('Modifica profilo')).toBeNull();
  });

  it('P2: profilo estero senza provincia è COMPLETO (non si chiede l’impossibile)', () => {
    // Per i paesi esteri la provincia è null per costruzione: se il gate la
    // pretendesse, quell'utente vedrebbe un sollecito che non può soddisfare.
    mockUseAuth.mockReturnValue(
      makeAuth({
        profile: {
          ...profileWithDeletion,
          deletion_requested_at: null,
          country: 'FR',
          province: null,
        },
      })
    );
    const { getByText, queryByText } = wrap(<ProfileScreen />);
    expect(getByText('Modifica profilo')).toBeTruthy();
    expect(queryByText('Completa il tuo profilo')).toBeNull();
  });
});

describe('ReConsentScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('accetta l’informativa chiamando acceptCurrentPolicy', () => {
    const acceptCurrentPolicy = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(makeAuth({ acceptCurrentPolicy }));
    const { getByText } = wrap(<ReConsentScreen />);
    fireEvent.press(getByText('Accetto'));
    expect(acceptCurrentPolicy).toHaveBeenCalled();
  });

  // La schermata chiede «leggila e accetta»: senza un modo di leggerla l'unica
  // strada era accettare alla cieca, cioè un consenso non informato (Art.7).
  it('offre di LEGGERE l’informativa, e la apre davvero', () => {
    mockUseAuth.mockReturnValue(makeAuth());
    const { getByText } = wrap(<ReConsentScreen />);
    fireEvent.press(getByText('Leggi l’informativa'));
    expect(mockOpenLink).toHaveBeenCalledWith(
      RISE_URLS.privacyPolicy,
      'reconsent-privacy'
    );
  });
});
