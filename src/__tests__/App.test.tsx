import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import * as Updates from 'expo-updates';
import App from '../../App';
import i18n from '@/locales';
import { logger } from '@/shared/utils/logger';

let mockUpdateState: {
  isDownloading: boolean;
  downloadProgress: number | undefined;
  isUpdatePending: boolean;
};
let mockNavigationReady: (() => void) | undefined;
const mockNavigationMount = jest.fn();
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
    React.useEffect(() => {
      mockNavigationMount();
      return () => {
        mockNavigationUnmount();
      };
    }, []);
    return (
      <TextInput
        testID="navigation-draft"
        value={draft}
        onChangeText={setDraft}
      />
    );
  };
});

describe('App Root Component', () => {
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

  it('dovrebbe renderizzare senza errori', async () => {
    const screen = render(<App />);
    await act(async () => {});
    expect(screen.toJSON()).toBeTruthy();
  });

  it('dovrebbe inizializzare i provider necessari', async () => {
    const screen = render(<App />);
    await act(async () => {});
    expect(screen.getByTestId('navigation-draft')).toBeTruthy();
  });

  it('aggiornamento OTA: dentro la finestra ricarica subito', async () => {
    const screen = render(<App />);
    await act(async () => {});
    act(() => mockNavigationReady?.());
    act(() => jest.advanceTimersByTime(5000));
    mockUpdateState.isDownloading = true;
    screen.rerender(<App />);
    act(() => jest.advanceTimersByTime(20_000));
    mockUpdateState.isDownloading = false;
    mockUpdateState.isUpdatePending = true;
    screen.rerender(<App />);

    // Nessun avanzamento timer dopo pending: reload non aspetta l'animazione.
    expect(Updates.reloadAsync).toHaveBeenCalledTimes(1);
    expect(mockNavigationUnmount).not.toHaveBeenCalled();
    screen.rerender(<App />);
    expect(Updates.reloadAsync).toHaveBeenCalledTimes(1);
  });

  it('aggiornamento OTA: fuori dalla finestra aspetta il prossimo avvio', async () => {
    const screen = render(<App />);
    await act(async () => {});
    act(() => mockNavigationReady?.());
    fireEvent.changeText(
      screen.getByTestId('navigation-draft'),
      'bozza aperta'
    );
    act(() => jest.advanceTimersByTime(5001));
    mockUpdateState.isDownloading = true;
    screen.rerender(<App />);
    expect(screen.getByTestId('navigation-draft').props.value).toBe(
      'bozza aperta'
    );
    expect(screen.queryByRole('progressbar')).toBeNull();
    mockUpdateState.isDownloading = false;
    mockUpdateState.isUpdatePending = true;
    screen.rerender(<App />);
    act(() => jest.advanceTimersByTime(60_000));

    expect(Updates.reloadAsync).not.toHaveBeenCalled();
    expect(mockNavigationMount).toHaveBeenCalledTimes(1);
    expect(mockNavigationUnmount).not.toHaveBeenCalled();
    expect(screen.getByTestId('navigation-draft').props.value).toBe(
      'bozza aperta'
    );
  });

  it('aggiornamento OTA: avanzamento visibile', async () => {
    mockUpdateState.isDownloading = true;
    const screen = render(<App />);
    await act(async () => {});
    expect(screen.queryByText('0%')).toBeNull();
    expect(screen.getByRole('progressbar').props.accessibilityValue).toEqual({
      text: i18n.t('updates.downloading'),
    });

    mockUpdateState.downloadProgress = 0.25;
    screen.rerender(<App />);
    expect(screen.getByText('25%')).toBeTruthy();
    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(
      25
    );
    mockUpdateState.downloadProgress = 0.6;
    screen.rerender(<App />);
    expect(screen.getByText('60%')).toBeTruthy();
    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(
      60
    );
  });

  it('prima che la navigazione sia pronta accetta anche download dopo cinque secondi', async () => {
    const screen = render(<App />);
    await act(async () => {});
    act(() => jest.advanceTimersByTime(8000));
    mockUpdateState.isDownloading = true;
    screen.rerender(<App />);
    act(() => mockNavigationReady?.());
    mockUpdateState.isDownloading = false;
    mockUpdateState.isUpdatePending = true;
    screen.rerender(<App />);
    expect(Updates.reloadAsync).toHaveBeenCalledTimes(1);
  });

  it('un pending tardivo senza inizio osservato non interrompe la sessione', async () => {
    const screen = render(<App />);
    await act(async () => {});
    act(() => mockNavigationReady?.());
    act(() => jest.advanceTimersByTime(8000));
    mockUpdateState.isUpdatePending = true;
    screen.rerender(<App />);
    expect(Updates.reloadAsync).not.toHaveBeenCalled();
    expect(screen.getByTestId('navigation-draft')).toBeTruthy();
  });

  it('se il reload fallisce mantiene la navigazione e non ripete il tentativo', async () => {
    const failure = new Error('reload failed');
    jest.mocked(Updates.reloadAsync).mockRejectedValue(failure);
    mockUpdateState.isDownloading = true;
    const screen = render(<App />);
    await act(async () => {});
    mockUpdateState.isDownloading = false;
    mockUpdateState.isUpdatePending = true;
    screen.rerender(<App />);
    await act(async () => {});
    screen.rerender(<App />);
    act(() => jest.advanceTimersByTime(30_000));
    expect(Updates.reloadAsync).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(mockNavigationUnmount).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      'OTA reload failed',
      'App',
      failure
    );
  });

  it('un pending già disponibile al primo render viene applicato subito', async () => {
    mockUpdateState.isUpdatePending = true;
    render(<App />);
    await act(async () => {});
    expect(Updates.reloadAsync).toHaveBeenCalledTimes(1);
    expect(mockNavigationUnmount).not.toHaveBeenCalled();
  });

  it('StrictMode non duplica il reload e libera lo schermo dopo un errore', async () => {
    jest
      .mocked(Updates.reloadAsync)
      .mockRejectedValue(new Error('reload failed'));
    mockUpdateState.isUpdatePending = true;
    const screen = render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    await act(async () => {});
    expect(Updates.reloadAsync).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('navigation-draft')).toBeTruthy();
  });

  it('un download interrotto restituisce la navigazione senza perdere la bozza', async () => {
    const screen = render(<App />);
    await act(async () => {});
    fireEvent.changeText(screen.getByTestId('navigation-draft'), 'bozza');
    mockUpdateState.isDownloading = true;
    screen.rerender(<App />);
    mockUpdateState.isDownloading = false;
    screen.rerender(<App />);
    expect(screen.getByTestId('navigation-draft').props.value).toBe('bozza');
    expect(Updates.reloadAsync).not.toHaveBeenCalled();
    expect(mockNavigationUnmount).not.toHaveBeenCalled();
  });

  it('un nuovo download tardivo con pending nello stesso render non eredita la finestra precedente', async () => {
    const screen = render(<App />);
    await act(async () => {});
    act(() => mockNavigationReady?.());
    mockUpdateState.isDownloading = true;
    screen.rerender(<App />);
    mockUpdateState.isDownloading = false;
    screen.rerender(<App />);
    act(() => jest.advanceTimersByTime(8000));
    mockUpdateState.isDownloading = true;
    mockUpdateState.isUpdatePending = true;
    screen.rerender(<App />);
    expect(Updates.reloadAsync).not.toHaveBeenCalled();
    expect(screen.getByTestId('navigation-draft')).toBeTruthy();
  });
});
