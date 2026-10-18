import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../../../..');
const read = (file: string): string =>
  fs.readFileSync(path.join(root, file), 'utf8');
const text = (source: string): string =>
  source
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// C55: controlli positivi e negativi sui documenti reali, copiabili alla base.
it('B3b documenti: diagnostica facoltativa per analisi e motivazioni Play Console', () => {
  const source = read('docs/store/google-play/play-console-risposte.md');
  const diagnostic = source
    .split('\n')
    .find(line =>
      line.includes("Informazioni e prestazioni dell'app → Diagnostica")
    );
  expect(
    diagnostic
      ?.split('|')
      .map(cell => cell.trim())
      .slice(3, -1)
  ).toEqual(['Sì', 'No', 'Sì (solo se la persona invia la mail)', 'Analisi']);
  const cells = (label: string): string[] | undefined =>
    source
      .split('\n')
      .find(line => line.startsWith(`| ${label} |`))
      ?.split('|')
      .map(cell => cell.trim());
  // La schermata d'errore manda la riga dell'arresto: anche questo tipo è dichiarato.
  expect(
    cells("Informazioni e prestazioni dell'app → Arresti anomali")?.slice(3, -1)
  ).toEqual(['Sì', 'No', 'Sì (solo se la persona invia la mail)', 'Analisi']);
  expect(cells('Tutti i dati sono criptati in transito?')?.[2]).toMatch(/^Sì /);
  expect(source).toContain(
    "Informazioni e prestazioni dell'app → Altri dati sulle prestazioni"
  );
  expect(source).toContain('answer/10787469');
  expect(source).toContain(
    'Used to collect data about how users use the app or how it performs'
  );
  const normalized = text(source);
  expect(normalized).toContain('passaggio all’app di posta sul telefono');
  expect(normalized).toContain('vede il testo prima di inviarlo');
  expect(normalized).toContain('Messaggi → Email');
  expect(normalized).toContain('TLS della mail dipende dal fornitore di posta');
  expect(normalized).toContain('solo HTTPS');
  const obsolete =
    /informazioni e prestazioni dell'app \(nessun servizio di segnalazione errori\)/;
  expect(
    obsolete.test(
      "informazioni e prestazioni dell'app (nessun servizio di segnalazione errori)"
    )
  ).toBe(true);
  expect(obsolete.test(normalized)).toBe(false);
});

it('B3b documenti: informative bilingui sulle segnalazioni volontarie', () => {
  for (const [file, voluntary, legal, retention, transfer] of [
    [
      'privacy-policy.html',
      'solo se scegli',
      'Base giuridica',
      'Conservazione',
      'trasferimenti extra-UE',
    ],
    [
      'privacy-policy-en.html',
      'only if you choose',
      'Legal basis',
      'Retention',
      'outside the EU',
    ],
  ] as const) {
    const source = read(file);
    const section = source.match(
      /<section id="segnalazione-problemi">([\s\S]*?)<\/section>/
    )?.[1];
    expect(section).toBeDefined();
    const content = text(section ?? '');
    for (const expected of [
      voluntary,
      legal,
      retention,
      transfer,
      'Google Workspace',
      'info@riseagainsthunger.it',
      '10',
      'UTC',
      'runtime',
      'TLS',
    ])
      expect(content).toContain(expected);
    expect(section?.match(/class="da-validare"/g)).toHaveLength(2);
    const accountAssociation =
      /diagnostica associata all'account|diagnostics associated with the account/i;
    expect(accountAssociation.test("diagnostica associata all'account")).toBe(
      true
    );
    expect(
      accountAssociation.test('diagnostics associated with the account')
    ).toBe(true);
    expect(accountAssociation.test(text(source))).toBe(false);
    expect(source).toContain('href="#segnalazione-problemi"');
  }
});

it('B3b documenti: cancellazione account e segnalazioni conservate in entrambe le lingue', () => {
  for (const [file, heading, reports, expiry] of [
    [
      'elimina-account.html',
      'cosa-resta',
      'Le segnalazioni di problemi',
      'Oggi non hanno una scadenza automatica',
    ],
    [
      'delete-account.html',
      'what-we-keep',
      'Problem reports',
      'They currently have no automatic expiry',
    ],
  ] as const) {
    const source = read(`docs/store/google-play/web/${file}`);
    const section = source.match(
      new RegExp(`<h2 id="${heading}">[\\s\\S]*?<ul>([\\s\\S]*?)<\\/ul>`)
    )?.[1];
    expect(section).toBeDefined();
    expect(text(section ?? '')).toContain(reports);
    // Come le altre voci della lista: una durata, o il fatto che non c'è.
    expect(text(section ?? '')).toContain(expiry);
    expect(section).toContain('Google Workspace');
    // Pagine pubbliche: nessun marcatore di bozza; il punto legale aperto sta
    // nell'informativa (sezione 2.1), qui solo ciò che è già vero.
    expect(section).not.toContain('da-validare');
    expect(section).toContain('#segnalazione-problemi');
  }
});
