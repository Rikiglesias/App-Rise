import React from 'react';
import { act, render, renderHook } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';

import ChiSiamoScreen from '@/features/about/screens/ChiSiamoScreen';
import { ContactSection } from '@/features/about/components';
import type {
  ChiSiamoScreenNavigationProp,
  ContactData,
} from '@/features/about/types';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import { UniversalThemeProvider } from '@/shared/theme/UniversalTheme';
import { changeLanguage, getCurrentLocale } from '@/locales';

jest.mock('@/features/about/components', () => ({
  ChiSiamoSection: () => null,
  StoriaModal: () => null,
  ContactSection: jest.fn(() => null),
}));
jest.mock('react-native/Libraries/Linking/Linking', () => {
  const linkingMock = { openURL: jest.fn(), canOpenURL: jest.fn() };
  return { __esModule: true, default: linkingMock, ...linkingMock };
});

describe('link esterni', () => {
  const originalLocale = getCurrentLocale();
  const runtime = globalThis as typeof globalThis & { __DEV__: boolean };
  const originalDev = runtime.__DEV__;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    runtime.__DEV__ = false;
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);
    (Linking.openURL as jest.Mock).mockResolvedValue(undefined);
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });
  afterEach(() => {
    changeLanguage(originalLocale);
    runtime.__DEV__ = originalDev;
    alertSpy.mockRestore();
  });

  it('link esterni senza canOpenURL: telefono', async () => {
    const { result } = renderHook(() =>
      useLinkHandler({ enableHaptics: false })
    );
    await act(async () => {
      const opened = await result.current.openLink('tel:051704070', 'phone');
      expect(opened.success).toBe(true);
    });
    expect(Linking.openURL).toHaveBeenCalledWith('tel:051704070');
    expect(Linking.canOpenURL).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('link esterni senza canOpenURL: email', async () => {
    const { result } = renderHook(() =>
      useLinkHandler({ enableHaptics: false })
    );
    await act(async () => {
      const opened = await result.current.openLink(
        'mailto:info@riseagainsthunger.it',
        'email'
      );
      expect(opened.success).toBe(true);
    });
    expect(Linking.openURL).toHaveBeenCalledWith(
      'mailto:info@riseagainsthunger.it'
    );
    expect(Linking.canOpenURL).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it.each(['it', 'en'] as const)(
    'link esterni senza canOpenURL: rifiuto mostra il contatto',
    async locale => {
      changeLanguage(locale);
      (Linking.openURL as jest.Mock).mockRejectedValue(
        new Error('No matching activity')
      );
      render(
        <UniversalThemeProvider initialTheme="light" followSystem={false}>
          <ChiSiamoScreen
            navigation={
              { goBack: jest.fn() } as unknown as ChiSiamoScreenNavigationProp
            }
          />
        </UniversalThemeProvider>
      );
      const contactProps = (ContactSection as jest.Mock).mock.calls[0]?.[0] as {
        contacts: ContactData[];
      };
      for (const [id, displayedContact] of [
        ['phone', '051 704070'],
        ['email', 'info@riseagainsthunger.it'],
        ['location', 'Via dei Fornaciai, 17, 40129 Bologna, BO, Italia'],
      ] as const) {
        await act(async () => {
          await contactProps.contacts
            .find(contact => contact.id === id)
            ?.onPress();
        });
        expect(alertSpy).toHaveBeenLastCalledWith(
          locale === 'it' ? 'Errore' : 'Error',
          expect.stringContaining(displayedContact)
        );
      }
      expect(Linking.canOpenURL).not.toHaveBeenCalled();
      expect(Linking.openURL).toHaveBeenCalledTimes(3);
    }
  );
});
