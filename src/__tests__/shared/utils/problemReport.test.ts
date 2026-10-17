import en from '@/locales/en';
import italian from '@/locales/it';
import { RISE_CONTACTS } from '@/shared/constants/urls';
import { buildProblemReport } from '@/shared/utils/buildProblemReport';
import type { ProblemReportInput } from '@/shared/utils/buildProblemReport';
import { buildProblemMailto } from '@/shared/utils/buildProblemMailto';

const input = (): ProblemReportInput => ({
  expoConfig: { version: '2.3.4' },
  updates: {
    isEnabled: true,
    isEmbeddedLaunch: false,
    updateId: 'ota-123',
    runtimeVersion: '2.3',
    channel: 'production',
    isEmergencyLaunch: true,
  },
  platform: {
    os: 'android',
    version: 36,
    manufacturer: 'Google',
    model: 'Pixel 9',
    release: '16',
  },
  language: 'it',
  window: { width: 412, height: 915, fontScale: 1.3 },
  logs: [],
  authErrorKeys: Object.keys(italian.auth.errors),
  labels: italian.support,
});

const entry = (index = 0) => ({
  timestamp: `2026-10-17T08:00:${String(index).padStart(2, '0')}.000Z`,
  level: 'error',
  context: `Accesso_${index}`,
  message: 'Non deve essere copiato',
  data: {
    name: 'AuthApiError',
    code: 'invalid_credentials',
    status: 400,
    chiave: 'invalid_credentials',
  },
});

// C55: metadati reali espliciti, priorità sviluppo/embedded, limite e ordine del buffer.
it('segnala un problema: corpo con versione e codici', () => {
  const fixture = input();
  fixture.logs = Array.from({ length: 12 }, (_, index) => ({
    ...entry(index),
    level: index === 11 ? 'fatal' : 'error',
  }));
  const report = buildProblemReport(fixture);
  expect(report.body.startsWith(italian.support.invitation)).toBe(true);
  expect(report.errorLines).toEqual(
    Array.from(
      { length: 10 },
      (_, index) =>
        `${entry(index + 2).timestamp} · Accesso_${index + 2} · AuthApiError · invalid_credentials · 400 · invalid_credentials`
    )
  );
  for (const line of [
    'Versione app: 2.3.4',
    'Aggiornamento: ota-123',
    'Runtime: 2.3',
    'Canale: production',
    'Avvio di emergenza: sì',
    'Piattaforma: android',
    'Versione sistema: 36',
    'Produttore: Google',
    'Modello: Pixel 9',
    'Release sistema: 16',
    'Lingua: it',
    'Scala del testo: 1.3',
    'Finestra: 412 × 915 dp',
  ])
    expect(report.body).toContain(line);
  expect(report.body).not.toContain('Accesso_0 ·');
  expect(report.body).not.toContain('Accesso_1 ·');
  expect(fixture.logs).toHaveLength(12);

  fixture.logs = [];
  fixture.updates.isEmbeddedLaunch = true;
  expect(buildProblemReport(fixture).body).toContain('Aggiornamento: embedded');
  fixture.updates.isEnabled = false;
  fixture.updates.isEmergencyLaunch = false;
  fixture.expoConfig = null;
  const empty = buildProblemReport(fixture);
  expect(empty.body).toContain('Aggiornamento: sviluppo');
  expect(empty.body).toContain('Versione app: ?');
  expect(empty.body).toContain('Avvio di emergenza: no');
  expect(empty.body).toContain(italian.support.noErrors);
  expect(empty.errorLines).toEqual([]);
  delete fixture.expoConfig;
  fixture.labels = en.support;
  fixture.language = 'en';
  const english = buildProblemReport(fixture).body;
  expect(english).toContain(en.support.invitation);
  expect(english).toContain('Update: development');
  expect(english).toContain('App version: ?');
  expect(english).toContain('Language: en');
  expect(english).toContain(en.support.noErrors);

  fixture.logs = [{ ...entry(), data: { error: entry().data } }];
  expect(buildProblemReport(fixture).errorLines[0]).toContain(
    'AuthApiError · invalid_credentials · 400 · invalid_credentials'
  );
});

// C55: ogni canale contaminato è provato con un codice/stato lecito nella stessa voce.
it('segnala un problema: nessun dato personale', () => {
  const secrets = [
    'persona@example.com',
    '+393331234567',
    '3331234567',
    '550e8400-e29b-41d4-a716-446655440000',
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature',
    'https://example.com/auth?access_token=segreto',
  ];
  for (const secret of secrets) {
    const contaminated = [
      { ...entry(), message: secret },
      { ...entry(), context: secret },
      { ...entry(), userId: secret },
      { ...entry(), data: { ...entry().data, raw: secret, stack: secret } },
      { ...entry(), data: { ...entry().data, code: secret } },
      { ...entry(), data: { ...entry().data, name: secret } },
      { ...entry(), data: { error: { ...entry().data, code: secret } } },
    ];
    for (const item of contaminated) {
      const report = buildProblemReport({
        ...input(),
        logs: [
          item,
          { ...entry(1), level: 'info', message: secret },
          {
            ...entry(2),
            level: 'warn',
            data: { ...entry().data, message: secret },
          },
        ],
      });
      expect(report.errorLines).toHaveLength(1);
      expect(report.body).not.toContain(secret);
      expect(report.errorLines[0]).toContain('400');
      expect(report.errorLines[0]).toContain('invalid_credentials');
    }
    const raw = buildProblemReport({
      ...input(),
      logs: [{ ...entry(), data: secret }],
    });
    expect(raw.errorLines[0]).toContain(' · - · - · - · -');
    expect(raw.body).not.toContain(secret);
  }
  for (const status of [-1, 99, 600, 400.5, '400', null, undefined]) {
    const report = buildProblemReport({
      ...input(),
      logs: [
        { ...entry(), data: { ...entry().data, status, chiave: 'unknown' } },
      ],
    });
    expect(report.errorLines[0]?.endsWith(' · - · -')).toBe(true);
  }
  for (const status of [0, 100, 599]) {
    const report = buildProblemReport({
      ...input(),
      logs: [{ ...entry(), data: { ...entry().data, status, code: '23505' } }],
    });
    expect(report.errorLines[0]).toContain(
      ` · 23505 · ${status} · invalid_credentials`
    );
  }
  const invalid = buildProblemReport({
    ...input(),
    logs: [
      {
        ...entry(),
        timestamp: 'not a timestamp',
        context: 'x'.repeat(41),
        data: {
          name: 'notAnError',
          code: 'x'.repeat(41),
          status: 400,
          chiave: 'invalid_credentials',
        },
      },
    ],
  });
  expect(invalid.errorLines).toEqual([
    '- · - · - · - · 400 · invalid_credentials',
  ]);
  const newline = buildProblemReport({
    ...input(),
    logs: [
      {
        ...entry(),
        context: 'Accesso\n',
        data: {
          ...entry().data,
          name: 'TypeError\n',
          code: 'invalid_credentials\n',
        },
      },
    ],
  });
  expect(newline.errorLines[0]).toContain(
    ' · - · - · - · 400 · invalid_credentials'
  );
});

// C55: codifica esatta, CRLF e rimozione dal più vecchio senza tagliare i caratteri.
it('segnala un problema: mailto codificato', () => {
  const fixture = input();
  fixture.labels = {
    ...italian.support,
    invitation: 'Descrivi: caffè & tè? #1\nGrazie + 100%',
  };
  const report = buildProblemReport(fixture);
  const subject = `${italian.support.reportSubject}: caffè & tè? #1 + 100%`;
  const small = buildProblemMailto(report, subject);
  expect(small.url).toBe(
    `mailto:${RISE_CONTACTS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(small.body)}`
  );
  expect(small.url).toContain('%0D%0A');
  expect(small.body.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
  expect(decodeURIComponent(small.url.split('&body=')[1] ?? '')).toBe(
    small.body
  );

  fixture.logs = Array.from({ length: 12 }, (_, index) => entry(index));
  const large = buildProblemReport(fixture);
  const bounded = buildProblemMailto(large, subject);
  expect(bounded.url.length).toBeLessThanOrEqual(2000);
  const retained = large.errorLines.filter(line => bounded.body.includes(line));
  expect(retained.length).toBeGreaterThan(0);
  expect(retained.length).toBeLessThan(10);
  expect(retained).toEqual(large.errorLines.slice(-retained.length));
  expect(bounded.body.endsWith(large.errorLines[9] ?? '')).toBe(true);
  expect(large.errorLines).toHaveLength(10);
  const previous =
    large.errorLines[large.errorLines.length - retained.length - 1];
  const withOneMore = [...large.diagnosticLines, previous, ...retained]
    .join('\r\n')
    .replace(/\r?\n/g, '\r\n');
  expect(
    `mailto:${RISE_CONTACTS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(withOneMore)}`
      .length
  ).toBeGreaterThan(2000);

  const extreme = buildProblemReport({
    ...input(),
    platform: { os: 'android', version: 36, model: '界'.repeat(1000) },
  });
  expect(() =>
    buildProblemMailto(extreme, italian.support.reportSubject)
  ).toThrow(RangeError);
  expect(extreme.body).toContain('界'.repeat(1000));
});
