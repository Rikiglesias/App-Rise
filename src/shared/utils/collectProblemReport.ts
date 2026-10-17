import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { Platform, useWindowDimensions } from 'react-native';
import { logger } from './logger';
import { buildProblemReport } from './buildProblemReport';
import type { ProblemReport, ProblemReportInput } from './buildProblemReport';
import { en, getCurrentLocale, it } from '@/locales';

/** Da chiamare al tocco: lingua, metadati e buffer vengono letti in quel momento. */
export const collectProblemReport = (
  window: ProblemReportInput['window']
): ProblemReport => {
  const language = getCurrentLocale();
  const translations = language === 'it' ? it : en;
  const constants = Platform.constants;
  return buildProblemReport({
    expoConfig: Constants.expoConfig,
    updates: {
      isEnabled: Updates.isEnabled,
      isEmbeddedLaunch: Updates.isEmbeddedLaunch,
      updateId: Updates.updateId,
      runtimeVersion: Updates.runtimeVersion,
      channel: Updates.channel,
      isEmergencyLaunch: Updates.isEmergencyLaunch,
    },
    platform: {
      os: Platform.OS,
      version: Platform.Version,
      manufacturer:
        'Manufacturer' in constants ? constants.Manufacturer : undefined,
      model: 'Model' in constants ? constants.Model : undefined,
      release: 'Release' in constants ? constants.Release : undefined,
    },
    language,
    window,
    logs: logger.getLogs(),
    authErrorKeys: Object.keys(translations.auth.errors),
    labels: translations.support,
  });
};

/** Nessun provider necessario: utilizzabile anche dal fallback di ErrorBoundary. */
export const useProblemReport = (): (() => ProblemReport) => {
  const window = useWindowDimensions();
  return () => collectProblemReport(window);
};
