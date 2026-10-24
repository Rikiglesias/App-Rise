/**
 * C73 (contratto android-play): la schermata d'attesa dell'aggiornamento OTA all'avvio blocca l'app al
 * massimo 30 s. Scaduto il tempo l'app torna usabile, e un download che finisce DOPO non ricarica: il
 * nuovo bundle vale dal prossimo avvio a freddo. I titoli di C27 restano in `App.test.tsx`, invariato.
 */
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import * as Updates from 'expo-updates';
import App from '../../App';

/** Il tetto del contratto: con qualunque costante ≤ 30 s, a questo punto l'attesa è finita. */
const TETTO_CONTRATTO_MS = 30_000;

let mockUpdateState: {
  isDownloading: boolean;
  downloadProgress: number | undefined;
  isUpdatePending: boolean;
};
let mockNavigationReady: (() => void) | undefined;
const mockNavigationUnmount = jest.fn();

jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('expo-status-bar', () => ({ StatusBar: 'StatusBar' }));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('expo-updates', () => ({
  useUpdates: () => mockUpdateState,
  reloadAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/shared/services/displayZoom', () => ({
  initDisplayZoom: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/shared/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));
jest.mock('@/shared/auth/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/navigation/AppNavigator', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { TextInput } =
    jest.requireActual<typeof import('react-native')>('react-native');
  return function MockNavigator({ onReady }: { onReady?: () => void }) {
    mockNavigationReady = onReady;
    const [draft, setDraft] = React.useState('');
    React.useEffect(() => () => mockNavigationUnmount(), []);
    return (
      <TextInput
        testID="navigation-draft"
        value={draft}
        onChangeText={setDraft}
      />
    );
  };
});

/** Avvio con la navigazione pronta e un download che parte dentro la finestra dei 5 s. */
const avviaConDownloadNellaFinestra = async (bozza = '') => {
  const screen = render(<App />);
  await act(async () => {});
  act(() => mockNavigationReady?.());
  fireEvent.changeText(screen.getByTestId('navigation-draft'), bozza);
  act(() => jest.advanceTimersByTime(1000));
  mockUpdateState.isDownloading = true;
  screen.rerender(<App />);
  expect(screen.getByRole('progressbar')).toBeTruthy();
  return screen;
};

describe("C73 attesa dell'aggiornamento OTA all'avvio", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-10-15T10:00:00Z'));
    jest.clearAllMocks();
    jest.mocked(Updates.reloadAsync).mockResolvedValue(undefined);
    mockUpdateState = {
      isDownloading: false,
      downloadProgress: 0,
      isUpdatePending: false,
    };
    mockNavigationReady = undefined;
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("OTA all'avvio: oltre il tempo massimo l'app è usabile", async () => {
    const screen = await avviaConDownloadNellaFinestra();
    mockUpdateState.downloadProgress = 0.4;
    act(() => jest.advanceTimersByTime(TETTO_CONTRATTO_MS));
    screen.rerender(<App />);

    expect(screen.queryByRole('progressbar')).toBeNull();
    fireEvent.changeText(screen.getByTestId('navigation-draft'), 'si scrive');
    expect(screen.getByTestId('navigation-draft').props.value).toBe(
      'si scrive'
    );
  });

  it("OTA all'avvio: download finito dopo il tempo massimo non ricarica", async () => {
    const screen = await avviaConDownloadNellaFinestra('bozza');
    act(() => jest.advanceTimersByTime(TETTO_CONTRATTO_MS));
    mockUpdateState.isDownloading = false;
    mockUpdateState.isUpdatePending = true;
    screen.rerender(<App />);
    act(() => jest.advanceTimersByTime(60_000));

    expect(Updates.reloadAsync).not.toHaveBeenCalled();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(mockNavigationUnmount).not.toHaveBeenCalled();
    expect(screen.getByTestId('navigation-draft').props.value).toBe('bozza');
  });
});
