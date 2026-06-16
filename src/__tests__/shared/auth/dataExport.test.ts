import { Share } from 'react-native';

import { buildExportPayload, exportData } from '@/shared/auth/dataExport';
import type { Profile, ConsentEvent } from '@/shared/auth/types';

const profile: Profile = {
  id: 'u1',
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  birth_date: '1990-01-01',
  privacy_consent_at: '2026-01-01T00:00:00.000Z',
  marketing_consent: true,
  deletion_requested_at: null,
};

const account = {
  id: 'u1',
  email: 'mario@rossi.it',
  created_at: '2026-01-01T00:00:00.000Z',
  providers: ['email'],
};

describe('dataExport', () => {
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
});
