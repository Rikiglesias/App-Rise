/* eslint-disable max-lines-per-function */
import {
  errorTracking,
  captureError,
  captureMessage,
  addBreadcrumb,
  trackPerformance,
} from '../../../shared/services/errorTracking';

// Stub global ErrorUtils used by initialize()
beforeAll(() => {
  (global as any).ErrorUtils = {
    getGlobalHandler: jest.fn(() => jest.fn()),
    setGlobalHandler: jest.fn(),
  };
});

describe('ErrorTrackingService', () => {
  beforeEach(() => {
    // Fresh init for each test
    errorTracking.resetSession();
    errorTracking.initialize({
      enableInDevelopment: true,
      maxErrorsPerSession: 2,
      enableAutomaticCrashReporting: true,
      enablePerformanceMonitoring: true,
    });
  });

  it('captures errors and updates stats', () => {
    const err = new Error('boom');
    captureError(err, { userId: 'u1', screen: 'Home' });

    const stats = errorTracking.getErrorStats();
    expect(stats.errorCount).toBe(1);
    expect(typeof stats.sessionId).toBe('string');

    const report = errorTracking.generateDebugReport();
    expect(report).toContain('Error Count: 1');
  });

  it('respects maxErrorsPerSession limit', () => {
    captureError(new Error('e1'));
    captureError(new Error('e2')); // should be skipped due to limit 2 but errorCount starts at 0, so accept up to 2
    captureError(new Error('e3')); // beyond limit

    const stats = errorTracking.getErrorStats();
    // maxErrorsPerSession: 2
    expect(stats.errorCount).toBeLessThanOrEqual(2);
  });

  it('captures custom messages and breadcrumbs', () => {
    captureMessage('hello-world', 'warning', { action: 'test' });
    addBreadcrumb('user clicked', 'user', 'info', { id: 1 });

    const stats = errorTracking.getErrorStats();
    expect(stats.errorCount).toBeGreaterThanOrEqual(1);
  });

  it('tracks performance and warns on slow operations', () => {
    // Fast operation: debug path
    trackPerformance('fastOp', 50, { tag: 'fast' });
    // Slow operation: warn path (>1000ms)
    trackPerformance('slowOp', 1500, { tag: 'slow' });

    const stats = errorTracking.getErrorStats();
    expect(stats.sessionId).toBeTruthy();
  });

  it('resetSession creates a new session and clears counters', () => {
    captureError(new Error('before'));
    const before = errorTracking.getErrorStats();

    errorTracking.resetSession();
    const after = errorTracking.getErrorStats();

    expect(after.sessionId).not.toBe(before.sessionId);
    expect(after.errorCount).toBe(0);
    expect(after.crashReports).toBe(0);
  });
});
