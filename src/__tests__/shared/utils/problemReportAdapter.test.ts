import { renderHook } from '@testing-library/react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import * as Native from 'react-native';
import { changeLanguage, getCurrentLocale } from '@/locales';
import {
  collectProblemReport,
  useProblemReport,
} from '@/shared/utils/collectProblemReport';
import { logger, logError, logInfo } from '@/shared/utils/logger';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '3.2.1' } },
}));
jest.mock('expo-updates', () => ({
  isEnabled: true,
  isEmbeddedLaunch: false,
  updateId: 'adapter-ota',
  runtimeVersion: '3.2',
  channel: 'test',
  isEmergencyLaunch: true,
}));

const initialLocale = getCurrentLocale();
afterEach(() => {
  logger.clearLogs();
  changeLanguage(initialLocale);
  jest.restoreAllMocks();
});

it('diagnosi: adattatore legge metadati e buffer al momento del tocco senza provider', () => {
  logger.clearLogs();
  changeLanguage('it');
  const nativeConstants = {
    ...Native.Platform.constants,
    Manufacturer: 'Acme',
    Model: 'Alpha',
    Release: '16',
    osVersion: '16',
    Version: 36,
    Serial: 'seriale-privato',
    Fingerprint: 'impronta-privata',
  };
  jest
    .spyOn(Native.Platform, 'constants', 'get')
    .mockReturnValue(nativeConstants);
  const { result } = renderHook(() => ({
    collect: useProblemReport(),
    window: Native.useWindowDimensions(),
  }));
  const empty = result.current.collect();
  expect(empty.body).toContain('nessun errore registrato');
  logInfo('messaggio escluso', 'InfoOnly', { code: 'info_only' });
  logError('messaggio privato', 'ErrorBoundary', { name: 'TypeError' });
  expect(logger.getLogs().at(-1)?.level).toBe('error');
  const report = result.current.collect();
  expect(report.body).toContain('ErrorBoundary · TypeError');
  expect(report.body).not.toContain('nessun errore registrato');
  expect(report.body).not.toContain('InfoOnly');
  expect(report.body).not.toContain('messaggio privato');
  expect(report.body).not.toContain(nativeConstants.Serial);
  expect(report.body).not.toContain(nativeConstants.Fingerprint);
  expect(report.body).toContain(
    `Versione app: ${Constants.expoConfig?.version}`
  );
  expect(report.body).toContain(`Aggiornamento: ${Updates.updateId}`);
  expect(report.body).toContain('Runtime: 3.2');
  expect(report.body).toContain('Canale: test');
  expect(report.body).toContain('Avvio di emergenza: sì');
  expect(report.body).toContain(`Piattaforma: ${Native.Platform.OS}`);
  expect(report.body).toContain(`Versione sistema: ${Native.Platform.Version}`);
  expect(report.body).toContain('Produttore: Acme');
  expect(report.body).toContain('Modello: Alpha');
  expect(report.body).toContain('Release sistema: 16');
  expect(result.current.window.width).toBeGreaterThan(0);
  expect(report.body).toContain(
    `Scala del testo: ${result.current.window.fontScale}`
  );
  expect(report.body).toContain(
    `Finestra: ${result.current.window.width} × ${result.current.window.height} dp`
  );

  changeLanguage('en');
  const english = result.current.collect();
  expect(english.body).toContain('Language: en');
  expect(english.body).toContain('App version: 3.2.1');
  // Il testo resta disponibile anche quando il successivo mailto non può contenerlo.
  nativeConstants.Model = '界'.repeat(1000);
  expect(result.current.collect().body).toContain(nativeConstants.Model);
  logger.clearLogs();
  expect(
    collectProblemReport({ width: 915, height: 412, fontScale: 2 }).body
  ).toContain('Window: 915 × 412 dp');
});
