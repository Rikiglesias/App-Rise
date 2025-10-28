// @ts-nocheck
/* eslint-disable max-lines-per-function */
import { renderHook, act } from '@testing-library/react-native';
import { Animated } from 'react-native';

import {
  useMicroInteraction,
  MicroInteractionPresets,
  HapticEngine,
} from '../../systems/MicroInteractionEngine';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  impactAsync: jest.fn().mockResolvedValue(undefined),
}));

describe('useMicroInteraction hook', () => {
  const timingSpy = jest.spyOn(Animated, 'timing');
  const parallelSpy = jest.spyOn(Animated, 'parallel');

  beforeAll(() => {
    // Make animations synchronous and set end values immediately
    timingSpy.mockImplementation((value: any, cfg: any) => {
      return {
        start: (cb?: () => void) => {
          if (value && typeof value.setValue === 'function') {
            value.setValue(cfg.toValue);
          }
          cb && cb();
        },
        stop: jest.fn(),
      } as any;
    });
    parallelSpy.mockImplementation((anims: any[]) => {
      return {
        start: (cb?: () => void) => {
          anims.forEach(a => a?.start?.(() => {}));
          cb && cb();
        },
        stop: jest.fn(),
      } as any;
    });
  });

  afterAll(() => {
    timingSpy.mockRestore();
    parallelSpy.mockRestore();
  });

  it('trigger moves values forward and toggles isAnimating', async () => {
    const { result } = renderHook(() =>
      useMicroInteraction(MicroInteractionPresets.buttonTap)
    );

    const scale = result.current.values.scale as unknown as {
      __getValue?: () => number;
      _value?: number;
    };

    // initial
    expect(scale.__getValue?.() ?? (scale as any)._value).toBe(1);

    await act(async () => {
      await result.current.trigger();
    });

    const final = scale.__getValue?.() ?? (scale as any)._value;
    expect(final).toBeCloseTo(0.95);
    expect(result.current.isAnimating).toBe(false);
  });

  it('reverse brings values back and reset restores initial state', async () => {
    const { result } = renderHook(() =>
      useMicroInteraction(MicroInteractionPresets.buttonTap)
    );
    const scale = result.current.values.scale as any;

    await act(async () => {
      await result.current.trigger();
    });
    expect(scale.__getValue?.() ?? scale._value).toBeCloseTo(0.95);

    await act(async () => {
      await result.current.reverse();
    });
    expect(scale.__getValue?.() ?? scale._value).toBeCloseTo(1);

    act(() => {
      result.current.reset();
    });
    expect(scale.__getValue?.() ?? scale._value).toBeCloseTo(1);
    expect(result.current.isAnimating).toBe(false);
  });

  it('haptics: disabled setting prevents impact', async () => {
    const Haptics = require('expo-haptics');
    (Haptics.impactAsync as jest.Mock).mockClear();

    const { result } = renderHook(() =>
      useMicroInteraction(MicroInteractionPresets.buttonTap)
    );

    // Enabled by default
    await act(async () => {
      await result.current.trigger();
    });
    expect(Haptics.impactAsync).toHaveBeenCalled();

    // Disable and try again
    HapticEngine.setEnabled(false);
    await act(async () => {
      await result.current.trigger();
    });
    // Count should not increase after disabling
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    HapticEngine.setEnabled(true);
  });
});
// @ts-nocheck
