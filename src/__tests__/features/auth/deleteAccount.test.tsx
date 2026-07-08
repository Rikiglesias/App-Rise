import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { DeleteAccountScreen } from '@/features/auth/screens/DeleteAccountScreen';
import { ProfileScreen } from '@/features/auth/screens/ProfileScreen';
import { ConsentsScreen } from '@/features/auth/screens/ConsentsScreen';
import { PrivacyScreen } from '@/features/auth/screens/PrivacyScreen';
import { ReConsentScreen } from '@/features/auth/screens/ReConsentScreen';
import { useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import type { Profile } from '@/shared/auth/types';
import { getAppleAuthCodeForDeletion } from '@/shared/auth/socialAuth';

jest.mock('@react-navigation/native', () => {
  const navigate = jest.fn();
  return { useNavigation: () => ({ navigate, goBack: jest.fn() }) };
});

jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/shared/auth/socialAuth', () => ({
  getAppleAuthCodeForDeletion: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const makeAuth = (over: Partial<AuthState> = {}): AuthState =>
  ({
    status: 'authenticated',
    session: {
      user: { id: 'u1', email: 'm@r.it', identities: [] },
    } as unknown as Session,
    profile: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    signInWithApple: jest.fn(),
    signInWithGoogle: jest.fn(),
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
};

const wrap = (ui: React.ReactElement) =>
  render(<AllProviders>{ui}</AllProviders>);

describe('DeleteAccountScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('mostra le due opzioni di eliminazione', () => {
    mockUseAuth.mockReturnValue(makeAuth());
    const { getByText } = wrap(<DeleteAccountScreen />);
    expect(getByText('Elimina subito')).toBeTruthy();
    expect(getByText('Elimina tra 30 giorni')).toBeTruthy();
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

  it('S12: branch Apple → confermando passa l’authCode fresco a deleteAccountNow', async () => {
    const deleteAccountNow = jest.fn().mockResolvedValue({ error: null });
    (getAppleAuthCodeForDeletion as jest.Mock).mockResolvedValue(
      'apple-code-xyz'
    );
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
    await waitFor(() =>
      expect(deleteAccountNow).toHaveBeenCalledWith('apple-code-xyz')
    );
    alertSpy.mockRestore();
  });

  it('S12: branch non-Apple → confermando chiama deleteAccountNow senza authCode', async () => {
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
    await waitFor(() =>
      expect(deleteAccountNow).toHaveBeenCalledWith(undefined)
    );
    expect(getAppleAuthCodeForDeletion).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});

describe('ProfileScreen (autenticato)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('mostra il menu Privacy ed Elimina account (con profilo)', () => {
    // Redesign: export e delete non sono più CTA inline ma voci di menu verso
    // le sotto-pagine dedicate (Privacy → PrivacyScreen, Elimina → DeleteAccount).
    mockUseAuth.mockReturnValue(
      makeAuth({
        profile: { ...profileWithDeletion, deletion_requested_at: null },
      })
    );
    const { getByText } = wrap(<ProfileScreen />);
    expect(getByText('Privacy e dati')).toBeTruthy();
    expect(getByText('Elimina account')).toBeTruthy();
  });

  it('mostra il banner di cancellazione programmata con annulla', () => {
    mockUseAuth.mockReturnValue(makeAuth({ profile: profileWithDeletion }));
    const { getByText } = wrap(<ProfileScreen />);
    expect(getByText('Annulla eliminazione')).toBeTruthy();
  });

  it('il toggle marketing (sotto-pagina Consensi) chiama setMarketingConsent', () => {
    // Redesign: il toggle vive nella sotto-pagina Consensi, raggiungibile solo con
    // un profilo → l'update marketing agisce sempre su una riga reale.
    const setMarketingConsent = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(
      makeAuth({
        setMarketingConsent,
        profile: { ...profileWithDeletion, deletion_requested_at: null },
      })
    );
    const { getByRole } = wrap(<ConsentsScreen />);
    fireEvent(getByRole('switch'), 'valueChange', true);
    expect(setMarketingConsent).toHaveBeenCalledWith(true);
  });

  it('mostra il re-consenso quando needsReConsent è true e il profilo esiste', () => {
    // Il gate re-consenso vale SOLO per utenti già stabiliti (con profilo): un social nuovo
    // senza profilo va a CompleteProfile, non a ReConsentScreen (fix review round 4).
    mockUseAuth.mockReturnValue(
      makeAuth({
        needsReConsent: true,
        profile: { ...profileWithDeletion, deletion_requested_at: null },
      })
    );
    const { getByText } = wrap(<ProfileScreen />);
    expect(getByText('Aggiornamento informativa')).toBeTruthy();
  });

  it('NON mostra il re-consenso a un utente senza profilo (signup social nuovo)', () => {
    mockUseAuth.mockReturnValue(
      makeAuth({ needsReConsent: true, profile: null })
    );
    const { queryByText } = wrap(<ProfileScreen />);
    expect(queryByText('Aggiornamento informativa')).toBeNull();
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
});

describe('PrivacyScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it("l'esportazione dati chiama exportData (GDPR Art.20)", async () => {
    const exportData = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(makeAuth({ exportData }));
    const { getByText } = wrap(<PrivacyScreen />);
    fireEvent.press(getByText('Esporta i miei dati'));
    await waitFor(() => expect(exportData).toHaveBeenCalled());
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
});
