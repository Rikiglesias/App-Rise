import { shouldReloadOtaAtStartup } from '@/shared/utils/otaStartupPolicy';

describe('Politica OTA all’inizio del download', () => {
  it.each([
    [false, 0, true],
    [false, 60_000, true],
    [true, 0, true],
    [true, 4999, true],
    [true, 5000, true],
    [true, 5001, false],
    [true, 60_000, false],
    [true, -1, false],
    [true, Number.NaN, false],
    [true, Number.POSITIVE_INFINITY, false],
  ])(
    'navigazione pronta=%s, trascorsi=%s ms: reload=%s',
    (navigationReady, elapsedSinceStartupMs, expected) => {
      expect(
        shouldReloadOtaAtStartup({ navigationReady, elapsedSinceStartupMs })
      ).toBe(expected);
    }
  );
});
