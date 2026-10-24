import { Share } from 'react-native';

import { buildExportPayload, exportData } from '@/shared/auth/dataExport';
import { supabase } from '@/shared/auth/supabaseClient';
import type { Profile, ConsentEvent } from '@/shared/auth/types';
import { changeLanguage, getCurrentLocale } from '@/locales';

jest.mock('@/shared/auth/supabaseClient', () => {
  const builder = { select: jest.fn().mockReturnThis(), eq: jest.fn() };
  return { supabase: { from: jest.fn(() => builder), __builder: builder } };
});

const mockClient = supabase as unknown as {
  from: jest.Mock;
  __builder: { select: jest.Mock; eq: jest.Mock };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockClient.__builder.eq.mockResolvedValue({ data: [], error: null });
});

afterEach(() => jest.restoreAllMocks());

const profile: Profile = {
  id: 'u1',
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  birth_date: '1990-01-01',
  privacy_consent_at: '2026-01-01T00:00:00.000Z',
  marketing_consent: true,
  deletion_requested_at: null,
  contact_email: null,
  nickname: null,
};

const account = {
  id: 'u1',
  email: 'mario@rossi.it',
  created_at: '2026-01-01T00:00:00.000Z',
  providers: ['email'],
};

describe('dataExport', () => {
  it.each([
    ['it', 'I miei dati — Rise Against Hunger Italia ETS'],
    ['en', 'My data — Rise Against Hunger Italia ETS'],
  ] as const)(
    'traduce il titolo del foglio di condivisione in %s',
    async (locale, title) => {
      const originalLocale = getCurrentLocale();
      const spy = jest
        .spyOn(Share, 'share')
        .mockResolvedValue({ action: 'sharedAction' });
      try {
        changeLanguage(locale);
        await exportData(account, profile);
        expect(spy).toHaveBeenCalledWith(expect.objectContaining({ title }));
      } finally {
        changeLanguage(originalLocale);
        spy.mockRestore();
      }
    }
  );
  it('buildExportPayload include account, profilo e timestamp', () => {
    const payload = buildExportPayload(account, profile);
    expect(payload.account.email).toBe('mario@rossi.it');
    expect(payload.profile?.first_name).toBe('Mario');
    expect(payload.profile?.marketing_consent).toBe(true);
    expect(typeof payload.exported_at).toBe('string');
  });

  it('buildExportPayload include la cronologia consensi (Art.20)', () => {
    const history: ConsentEvent[] = [
      {
        id: '1',
        user_id: 'u1',
        purpose: 'marketing',
        action: 'granted',
        policy_version: 'privacy-2026-06-15',
        legal_basis: 'consent',
        channel: 'ios:signup',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ];
    const payload = buildExportPayload(account, profile, history);
    expect(payload.consent_history).toHaveLength(1);
    expect(payload.consent_history[0]?.purpose).toBe('marketing');
  });

  it('exportData apre il share-sheet con un JSON valido contenente i dati', async () => {
    const spy = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: 'sharedAction' } as never);
    await exportData(account, profile);
    expect(spy).toHaveBeenCalledTimes(1);
    const arg = spy.mock.calls[0]?.[0] as { message: string };
    expect(arg.message).toContain('mario@rossi.it');
    expect(() => JSON.parse(arg.message)).not.toThrow();
    spy.mockRestore();
  });

  it('export: contiene i riferimenti partner', async () => {
    const refs = [
      { partner: 'donorbox', ref: 'ref-d', created_at: '2026-10-01T12:00:00Z' },
      {
        partner: 'letsdonation',
        ref: 'ref-l',
        created_at: '2026-10-02T12:00:00Z',
      },
      {
        partner: 'donorbox',
        ref: 'ref-old',
        created_at: '2026-09-01T12:00:00Z',
      },
    ];
    mockClient.__builder.eq.mockResolvedValue({ data: refs, error: null });
    const share = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: 'sharedAction' });

    await exportData(account, profile);

    const payload = JSON.parse(
      (share.mock.calls[0]?.[0] as { message: string }).message
    );
    expect(payload.partner_refs).toEqual(refs);
    expect(mockClient.from).toHaveBeenCalledWith('partner_refs');
    expect(mockClient.__builder.select).toHaveBeenCalledWith(
      'partner, ref, created_at'
    );
    expect(mockClient.__builder.eq).toHaveBeenCalledTimes(1);
    expect(mockClient.__builder.eq).toHaveBeenCalledWith('user_id', account.id);
  });

  it('export: senza riferimenti la sezione è vuota, non assente', async () => {
    const share = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: 'sharedAction' });

    await exportData(account, profile);

    const payload = JSON.parse(
      (share.mock.calls[0]?.[0] as { message: string }).message
    );
    expect(payload).toHaveProperty('partner_refs', []);
  });

  it('export: lettura dei riferimenti fallita → errore, non sezione vuota', async () => {
    const error = { message: 'lettura partner_refs negata', code: '42501' };
    mockClient.__builder.eq.mockResolvedValue({ data: null, error });
    const share = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: 'sharedAction' });

    await expect(exportData(account, profile)).rejects.toBe(error);
    expect(share).not.toHaveBeenCalled();
  });
});
