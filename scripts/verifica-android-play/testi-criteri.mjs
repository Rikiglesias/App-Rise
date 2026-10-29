// C83 R29 (punto 12): il «testo del criterio» che una riga di rilievi-f13.md deve citare per un Cn. Sono i
// titoli e le guardie Jest del criterio, le azioni nominate di C47 (nomi dei file di prova), i casi SQL di C79 e
// C86, le guardie di C81 e, per i criteri solo statici, le frasi del controllo copiate dal testo del contratto.

// C47 emendato R28-R29: le 6 azioni nominate, file `matrice-<avd>-azione<N>-<nome>`; la matrice di base resta C47.
export const AZIONI_C47 = [
  'azione1-chiudi-come-donare',
  'azione2-home-scala-2',
  'azione3-registrazione-tastiera',
  'azione4-scheda-mappa',
  'azione5-finestra',
  'azione6-sfondi',
  'matrice dispositivi',
];

// Criteri senza titoli Jest: la frase del contratto che il loro controllo statico verifica.
export const CONTROLLI_STATICI = {
  C47: AZIONI_C47,
  C52: ['Rise Against Hunger Italia ETS'],
  C59: ['npm audit --omit=dev --json'],
  C60: [
    'delete-account: errore senza dettagli interni',
    'purge-deletions: errore senza dettagli interni',
  ],
  C61: ['auth.delete.confirmNow', "avviso di uscita verso Let's Donation"],
  C63: ['via dei Fornaciai 17, 40129 Bologna'],
  C76: ['allowFontScaling=true', 'immunity={true}'],
  C77: ['visual-diff.test.tsx'],
  C80: ['answer/10281818'],
  C82: ["userInterfaceStyle = 'light'", 'initialTheme'],
  C86: ['T16', 'M9'],
  C96: ['scambio-dati-quadro.md', 'informativa-punti-aperti.md'],
  C99: [
    'URL del gate § 8',
    'class="last-updated"',
    'da-validare',
    'Richieste di cancellazione da inoltrare',
  ],
};

/**
 * Mappa `Cn → testi citabili`. `definizioni` = le definizioni a titoli del verificatore; `elenchi` = altri testi
 * esportati per criterio (per esempio i casi SQL di C79 o le guardie di C81).
 */
export const testiDeiCriteri = (definizioni, elenchi = {}) => {
  const testi = {};
  const aggiungi = (id, voci) => {
    testi[id] = [...(testi[id] ?? []), ...(voci ?? [])];
  };
  for (const [id, d] of Object.entries(definizioni)) {
    aggiungi(id, d.titoli);
    aggiungi(id, d.guardie);
  }
  for (const [id, voci] of Object.entries(CONTROLLI_STATICI))
    aggiungi(id, voci);
  for (const [id, voci] of Object.entries(elenchi)) aggiungi(id, voci);
  return testi;
};
