export interface ProblemReportLabels {
  invitation: string;
  diagnostics: string;
  version: string;
  update: string;
  development: string;
  embedded: string;
  runtime: string;
  channel: string;
  emergencyLaunch: string;
  yes: string;
  no: string;
  platform: string;
  systemVersion: string;
  manufacturer: string;
  model: string;
  release: string;
  language: string;
  fontScale: string;
  window: string;
  errors: string;
  noErrors: string;
}

export interface ProblemLogEntry {
  timestamp: unknown;
  level: unknown;
  context?: unknown;
  data?: unknown;
}

export interface ProblemReportInput {
  expoConfig?: { version?: string | undefined } | null | undefined;
  updates: {
    isEnabled: boolean;
    isEmbeddedLaunch: boolean;
    updateId: string | null;
    runtimeVersion: string | null;
    channel: string | null;
    isEmergencyLaunch: boolean;
  };
  platform: {
    os: string;
    version: string | number;
    manufacturer?: unknown;
    model?: unknown;
    release?: unknown;
  };
  language: string;
  window: { width: number; height: number; fontScale: number };
  logs: readonly ProblemLogEntry[];
  authErrorKeys: readonly string[];
  labels: ProblemReportLabels;
}

export interface ProblemReport {
  body: string;
  diagnosticLines: readonly string[];
  errorLines: readonly string[];
}

const record = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const allowed = (value: unknown, pattern: RegExp): string =>
  typeof value === 'string' && value === value.trim() && pattern.test(value)
    ? value
    : '-';

const utcTime = (value: unknown): string => {
  if (typeof value !== 'string') return '-';
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : '-';
};

export const sanitizeProblemError = (
  value: unknown,
  authErrorKeys: readonly string[]
): { name: string; code: string; status: number | '-'; chiave: string } => {
  const data = record(value);
  const nested = record(data?.error);
  const field = (key: string): unknown => data?.[key] ?? nested?.[key];
  const status = field('status');
  const key = field('chiave');
  return {
    name: allowed(field('name'), /^[A-Z][A-Za-z]{0,39}Error$/),
    code: allowed(
      field('code'),
      /^(?:[A-Za-z_][A-Za-z0-9_]{0,39}|[0-9A-Z]{5})$/
    ),
    status:
      typeof status === 'number' &&
      Number.isInteger(status) &&
      (status === 0 || (status >= 100 && status <= 599))
        ? status
        : '-',
    chiave: typeof key === 'string' && authErrorKeys.includes(key) ? key : '-',
  };
};

const errorLine = (
  entry: ProblemLogEntry,
  authErrorKeys: readonly string[]
): string => {
  const details = sanitizeProblemError(entry.data, authErrorKeys);
  return [
    utcTime(entry.timestamp),
    allowed(entry.context, /^[A-Za-z][A-Za-z0-9_]{0,39}$/),
    details.name,
    details.code,
    details.status,
    details.chiave,
  ].join(' · ');
};

// I metadati nativi rimangono su una riga; oggetti e valori mancanti non si serializzano.
const metadata = (value: unknown, fallback = '-'): string => {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return typeof value === 'string' && value.trim()
    ? value.replace(/[\r\n]+/g, ' ')
    : fallback;
};

/** Costruisce la diagnosi solo dagli input espliciti, senza accessi al dispositivo. */
export const buildProblemReport = (
  input: ProblemReportInput
): ProblemReport => {
  const { labels, updates, platform, window } = input;
  const update = !updates.isEnabled
    ? labels.development
    : updates.isEmbeddedLaunch
      ? labels.embedded
      : metadata(updates.updateId);
  const line = (label: string, value: unknown): string =>
    `${label}: ${metadata(value)}`;
  const diagnosticLines = [
    labels.invitation,
    '',
    labels.diagnostics,
    line(labels.version, metadata(input.expoConfig?.version, '?')),
    line(labels.update, update),
    line(labels.runtime, updates.runtimeVersion),
    line(labels.channel, updates.channel),
    line(
      labels.emergencyLaunch,
      updates.isEmergencyLaunch ? labels.yes : labels.no
    ),
    line(labels.platform, platform.os),
    line(labels.systemVersion, platform.version),
    line(labels.manufacturer, platform.manufacturer),
    line(labels.model, platform.model),
    line(labels.release, platform.release),
    line(labels.language, input.language),
    line(labels.fontScale, window.fontScale),
    line(
      labels.window,
      `${metadata(window.width)} × ${metadata(window.height)} dp`
    ),
    '',
    labels.errors,
  ];
  const errors = input.logs
    .filter(entry => entry.level === 'error' || entry.level === 'fatal')
    .slice(-10);
  const errorLines = errors.map(entry => errorLine(entry, input.authErrorKeys));
  if (errorLines.length === 0) diagnosticLines.push(labels.noErrors);
  return {
    diagnosticLines,
    errorLines,
    body: [...diagnosticLines, ...errorLines].join('\r\n'),
  };
};
