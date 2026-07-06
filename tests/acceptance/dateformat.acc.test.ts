/**
 * ORACOLO topic-loop «dateformat» (E-C3) — CONGELATO: ogni edit = TAMPER (run-topic-loop.ps1).
 * Comportamento atteso della util pura di formattazione date localizzata che sostituirà
 * l'inline di ProfileScreen.tsx (toLocaleDateString senza locale + grace-period non testabile).
 * Import dinamico: sulla baseline (src/shared/utils/dateFormat.ts assente) ogni test fallisce
 * singolarmente → report junit non-vacuo (fail-before).
 */

const load = () => import('../../src/shared/utils/dateFormat');

describe('formatDateLocalized', () => {
  it('formatta in italiano (gg mese aaaa)', async () => {
    const { formatDateLocalized } = await load();
    expect(formatDateLocalized(new Date(2026, 6, 5), 'it')).toBe('5 luglio 2026');
  });

  it('formatta in inglese (month gg, aaaa)', async () => {
    const { formatDateLocalized } = await load();
    expect(formatDateLocalized(new Date(2026, 6, 5), 'en')).toBe('July 5, 2026');
  });

  it('accetta anche una stringa ISO', async () => {
    const { formatDateLocalized } = await load();
    expect(formatDateLocalized('2026-01-31T10:00:00Z', 'it')).toBe('31 gennaio 2026');
  });

  it('input invalido → stringa vuota, mai crash', async () => {
    const { formatDateLocalized } = await load();
    expect(formatDateLocalized('non-una-data', 'it')).toBe('');
  });
});

describe('getDeletionScheduledDate', () => {
  it('somma i giorni di grazia alla richiesta di cancellazione', async () => {
    const { getDeletionScheduledDate } = await load();
    const out = getDeletionScheduledDate('2026-07-01T12:00:00Z', 30);
    expect(out?.toISOString()).toBe('2026-07-31T12:00:00.000Z');
  });

  it('requestedAt null/invalido → null', async () => {
    const { getDeletionScheduledDate } = await load();
    expect(getDeletionScheduledDate(null, 30)).toBeNull();
    expect(getDeletionScheduledDate('garbage', 30)).toBeNull();
  });
});
