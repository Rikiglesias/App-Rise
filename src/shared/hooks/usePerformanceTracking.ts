/**
 * Hook per Performance Tracking Semplificato
 * Fornisce un'interfaccia facile per monitorare performance nei componenti
 */

import { useCallback, useEffect, useRef } from 'react';
import type { PerformanceMonitorService } from '../monitoring/PerformanceMonitor';
import { performanceMonitor } from '../monitoring/PerformanceMonitor';
import { isFeatureEnabled } from '../config/environment';

interface UsePerformanceTrackingOptions {
  componentName: string;
  enableMemoryTracking?: boolean;
  enableRenderTracking?: boolean;
}

interface PerformanceTrackingHook {
  trackRender: () => () => void;
  trackNetworkRequest: (
    url: string,
    method: string
  ) => (statusCode: number, size?: number) => void;
  trackUserInteraction: (action: string, duration?: number) => void;
  trackMemoryUsage: () => void;
  trackAnimationFrame: (animationName: string, frameTime: number) => void;
  isEnabled: boolean;
}

export const usePerformanceTracking = ({
  componentName,
  enableMemoryTracking = false,
  enableRenderTracking = true,
}: UsePerformanceTrackingOptions): PerformanceTrackingHook => {
  const monitorRef = useRef<PerformanceMonitorService | null>(null);
  const isEnabled = isFeatureEnabled('ENABLE_PERFORMANCE_MONITORING');

  // Inizializza il monitor solo se abilitato
  useEffect(() => {
    monitorRef.current = isEnabled ? performanceMonitor : null;
  }, [isEnabled]);

  // Track automatico della memoria se abilitato
  useEffect(() => {
    if (!isEnabled || !enableMemoryTracking || !monitorRef.current) return;

    const interval = setInterval(() => {
      monitorRef.current?.recordMemoryUsage(componentName);
    }, 30000); // Ogni 30 secondi

    return () => clearInterval(interval);
  }, [isEnabled, enableMemoryTracking, componentName]);

  // Track render del componente
  const trackRender = useCallback(() => {
    if (!isEnabled || !enableRenderTracking || !monitorRef.current) {
      return () => undefined; // Noop function
    }

    return monitorRef.current.startComponentRender(componentName);
  }, [isEnabled, enableRenderTracking, componentName]);

  // Track network requests
  const trackNetworkRequest = useCallback(
    (url: string, method: string) => {
      if (!isEnabled || !monitorRef.current) {
        return () => undefined; // Noop function
      }

      return monitorRef.current.startNetworkRequest(url, method);
    },
    [isEnabled]
  );

  // Track user interactions
  const trackUserInteraction = useCallback(
    (action: string, duration?: number) => {
      if (!isEnabled || !monitorRef.current) return;

      monitorRef.current.recordUserInteraction(
        `${componentName}_${action}`,
        duration
      );
    },
    [isEnabled, componentName]
  );

  // Track memory usage manuale
  const trackMemoryUsage = useCallback(() => {
    if (!isEnabled || !monitorRef.current) return;

    monitorRef.current.recordMemoryUsage(componentName);
  }, [isEnabled, componentName]);

  // Track animation frames
  const trackAnimationFrame = useCallback(
    (animationName: string, frameTime: number) => {
      if (!isEnabled || !monitorRef.current) return;

      monitorRef.current.recordAnimationFrame(
        `${componentName}_${animationName}`,
        frameTime
      );
    },
    [isEnabled, componentName]
  );

  return {
    trackRender,
    trackNetworkRequest,
    trackUserInteraction,
    trackMemoryUsage,
    trackAnimationFrame,
    isEnabled,
  };
};

/**
 * Simplified performance tracking hook for components that want automatic tracking.
 * Automatically tracks component renders and provides user interaction tracking.
 *
 * @param componentName - Name of the component for tracking identification
 * @returns Object with trackUserInteraction function and isEnabled flag
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { trackUserInteraction, isEnabled } = useAutoPerformanceTracking('MyComponent');
 *
 *   const handleButtonClick = () => {
 *     trackUserInteraction('button_click');
 *     // ... handle click
 *   };
 *
 *   return <Button onPress={handleButtonClick} />;
 * }
 * ```
 */
export const useAutoPerformanceTracking = (componentName: string) => {
  const { trackRender, trackUserInteraction, isEnabled } =
    usePerformanceTracking({
      componentName,
      enableMemoryTracking: true,
      enableRenderTracking: true,
    });

  // Auto-track render del componente
  useEffect(() => {
    if (!isEnabled) return;

    const stopTracking = trackRender();
    return stopTracking;
  });

  // Ritorna solo le funzioni più comuni
  return {
    trackUserInteraction,
    isEnabled,
  };
};

/**
 * Returns the global performance monitor instance for direct access.
 * Use this when you need advanced performance monitoring capabilities
 * outside of React components.
 *
 * @returns The global PerformanceMonitorService instance
 *
 * @example
 * ```typescript
 * const monitor = getGlobalPerformanceMonitor();
 * monitor.startComponentRender('CustomComponent');
 * // ... perform operations
 * monitor.recordMemoryUsage('CustomComponent');
 * ```
 */
export const getGlobalPerformanceMonitor = (): PerformanceMonitorService => {
  return performanceMonitor;
};
