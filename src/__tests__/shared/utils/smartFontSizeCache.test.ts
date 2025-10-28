/* eslint-disable max-lines-per-function */
import {
  SmartFontSizeCache,
  smartFontSizeCache,
} from '../../../shared/utils/SmartFontSizeCache';

describe('SmartFontSizeCache', () => {
  const text = 'Lorem ipsum dolor sit amet';
  const scaledFontSize = 16;
  const targetLines = 2;
  const containerWidth = 320;

  const makeCalc = () => {
    let count = 0;
    const fn = () => {
      count += 1;
      return 14 + count; // produce a deterministic but different result per call
    };
    return { fn, getCount: () => count };
  };

  beforeEach(() => {
    smartFontSizeCache.clear();
    jest.spyOn(performance, 'now').mockReturnValue(0);
  });

  it('returns calculated value on miss and caches result', () => {
    const { fn, getCount } = makeCalc();

    const first = smartFontSizeCache.get(
      text,
      scaledFontSize,
      targetLines,
      containerWidth,
      fn
    );

    expect(first).toBe(15); // 14 + 1
    expect(getCount()).toBe(1);

    const stats = smartFontSizeCache.getStats();
    expect(stats.cacheMisses).toBe(1);
    expect(stats.cacheHits).toBe(0);
    expect(smartFontSizeCache.size()).toBe(1);
  });

  it('returns cached value on hit and does not call calculateFn again', () => {
    const { fn, getCount } = makeCalc();

    const first = smartFontSizeCache.get(
      text,
      scaledFontSize,
      targetLines,
      containerWidth,
      fn
    );
    const second = smartFontSizeCache.get(
      text,
      scaledFontSize,
      targetLines,
      containerWidth,
      fn
    );

    expect(first).toBe(second);
    expect(getCount()).toBe(1); // calculateFn called only once

    const stats = smartFontSizeCache.getStats();
    expect(stats.cacheHits).toBe(1);
    expect(stats.totalRequests).toBe(2);
    expect(stats.hitRate).toBeGreaterThan(0);
  });

  it('expires entries after TTL and recalculates', () => {
    const localCache = new SmartFontSizeCache();
    const calc = jest.fn(() => 20);

    // Freeze Date.now for initial insert
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(0);

    const first = localCache.get(text, 16, 1, 200, calc);
    expect(first).toBe(20);
    expect(calc).toHaveBeenCalledTimes(1);

    // Advance time past TTL (30 minutes)
    nowSpy.mockReturnValue(31 * 60 * 1000);

    const second = localCache.get(text, 16, 1, 200, calc);
    expect(second).toBe(20);
    expect(calc).toHaveBeenCalledTimes(2); // recalculated after expiry

    nowSpy.mockRestore();
  });

  it('evicts least used entries when exceeding max size', () => {
    const localCache = new SmartFontSizeCache();

    // Insert many unique keys to exceed capacity (1000)
    for (let i = 0; i < 1005; i++) {
      const v = localCache.get(`t${i}`, 16, 1, 200 + i, () => 10 + i);
      expect(v).toBe(10 + i);
    }

    // Capacity should not exceed hard limit
    expect(localCache.size()).toBeLessThanOrEqual(1000);
  });

  it('clear() resets cache and stats', () => {
    const calc = jest.fn(() => 18);
    smartFontSizeCache.get(text, 16, 1, 200, calc);
    expect(smartFontSizeCache.size()).toBe(1);

    smartFontSizeCache.clear();
    const stats = smartFontSizeCache.getStats();
    expect(smartFontSizeCache.size()).toBe(0);
    expect(stats.totalRequests).toBe(0);
    expect(stats.cacheHits).toBe(0);
    expect(stats.cacheMisses).toBe(0);
  });
});
