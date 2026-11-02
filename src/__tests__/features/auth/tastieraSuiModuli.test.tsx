/**
 * Moduli dell'account e tastiera. Da bordo a bordo (target 36) la finestra non si ridimensiona più
 * quando la tastiera si apre: su Pixel_7 API 36 il campo Telefono della Registrazione restava sotto
 * la tastiera e si scriveva alla cieca. Tutti i campi di testo dell'app stanno in AuthScreen.
 * Alla chiusura, su Android, `keyboardDidHide` riporta l'altezza dell'area visibile e non il suo
 * fondo: `KeyboardAvoidingView` attiva lascerebbe una fascia vuota sotto il modulo.
 */
import React from 'react';
import { Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import type { EmitterSubscription } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AllProviders } from '@/__tests__/helpers/testProviders';
import { AuthScreen } from '@/features/auth/components/AuthScreen';
import { PerfectText } from '@/components/ui';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ goBack: jest.fn(), canGoBack: () => true }),
}));

const initialMetrics = {
  frame: { x: 0, y: 0, width: 411, height: 914 },
  insets: { top: 24, left: 0, right: 0, bottom: 24 },
};

const ascoltatori = new Map<string, Set<() => void>>();
const emetti = (evento: string) =>
  act(() => {
    ascoltatori.get(evento)?.forEach(fn => fn());
  });

const modulo = () => (
  <SafeAreaProvider initialMetrics={initialMetrics}>
    <AllProviders>
      <AuthScreen title="Crea account">
        <PerfectText size={16} lines={1}>
          Telefono
        </PerfectText>
      </AuthScreen>
    </AllProviders>
  </SafeAreaProvider>
);

const vista = () => screen.UNSAFE_getByType(KeyboardAvoidingView);

const osOriginale = Platform.OS;

beforeEach(() => {
  ascoltatori.clear();
  jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false);
  jest.spyOn(Keyboard, 'addListener').mockImplementation(((
    evento: string,
    fn: () => void
  ) => {
    const insieme = ascoltatori.get(evento) ?? new Set();
    insieme.add(fn);
    ascoltatori.set(evento, insieme);
    return {
      remove: () => insieme.delete(fn),
    } as unknown as EmitterSubscription;
  }) as unknown as typeof Keyboard.addListener);
});

afterEach(() => {
  Platform.OS = osOriginale;
  jest.restoreAllMocks();
});

describe('AuthScreen e tastiera', () => {
  it('Android: alza il modulo solo mentre la tastiera è aperta', () => {
    Platform.OS = 'android';
    render(modulo());

    expect(vista().props.behavior).toBe('padding');
    expect(vista().props.enabled).toBe(false);

    emetti('keyboardDidShow');
    expect(vista().props.enabled).toBe(true);

    emetti('keyboardDidHide');
    expect(vista().props.enabled).toBe(false);
  });

  it('Android: conta la tastiera già aperta quando la schermata si monta', () => {
    Platform.OS = 'android';
    jest.spyOn(Keyboard, 'isVisible').mockReturnValue(true);
    render(modulo());

    expect(vista().props.enabled).toBe(true);
  });

  it('iOS: resta attiva anche prima dell’evento di fine animazione', () => {
    Platform.OS = 'ios';
    render(modulo());

    expect(vista().props.behavior).toBe('padding');
    expect(vista().props.enabled).toBe(true);
  });

  it('smontando la schermata toglie i propri ascoltatori', () => {
    Platform.OS = 'android';
    const { unmount } = render(modulo());
    expect(ascoltatori.get('keyboardDidShow')?.size).toBeGreaterThan(0);

    unmount();

    expect(ascoltatori.get('keyboardDidShow')?.size ?? 0).toBe(0);
    expect(ascoltatori.get('keyboardDidHide')?.size ?? 0).toBe(0);
  });
});
