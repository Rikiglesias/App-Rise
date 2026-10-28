// C90 (contratto android-play, R27-R29), gemello dei consensi: una lettura partita PRIMA
// dell'accettazione porta la storia di prima e non deve riaprire il cancello. File NUOVO (R27).
import { act, renderHook } from '@testing-library/react-native';

import { useConsentState } from '@/shared/auth/useConsentState';
import type { ConsentEvent } from '@/shared/auth/types';

jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { is_material: true },
        error: null,
      }),
    })),
  },
}));

type Args = Parameters<typeof useConsentState>[0];

it("consensi: una lettura partita prima dell'accettazione non riapre il cancello", async () => {
  let rispondi!: (history: ConsentEvent[] | null) => void;
  const getConsentHistory = jest.fn<ReturnType<Args['getConsentHistory']>, []>(
    () =>
      new Promise(resolve => {
        rispondi = resolve;
      })
  );
  const { result } = renderHook((props: Args) => useConsentState(props), {
    initialProps: {
      status: 'authenticated',
      userId: 'A',
      getConsentHistory,
    } as Args,
  });
  expect(getConsentHistory).toHaveBeenCalledTimes(1);

  act(() => result.current.markConsentGiven());
  expect(result.current.consentState).toBe('ok');

  // La lettura partita prima dell'accettazione: nessun consenso alla versione corrente.
  await act(async () => {
    rispondi([]);
    await Promise.resolve();
  });
  expect(result.current.consentState).toBe('ok');
  expect(result.current.needsReConsent).toBe(false);
});
