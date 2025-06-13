import { useCallback, useEffect, useRef, useState } from 'react';

import { PerformanceConfig } from '../constants/performance';

interface PerformanceMetrics {
  renderCount: number;
  avgRenderTime: number;
  memoryUsage?: number;
  isSlowDevice: boolean;
  frameDrops: number;
}

interface UsePerformanceMonitorOptions {
  enableMetrics?: boolean;
  warningThreshold?: number;
  componentName?: string;
}

export const usePerformanceMonitor = (
  options: UsePerformanceMonitorOptions = {}
) => {
  const {
    enableMetrics = PerformanceConfig.debug.enablePerformanceLogging,
    warningThreshold = PerformanceConfig.debug.slowOperationThreshold,
    componentName = 'Unknown',
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    avgRenderTime: 0,
    isSlowDevice: false,
    frameDrops: 0,
  });

  const renderStartTime = useRef<number | undefined>(undefined);
  const renderTimes = useRef<number[]>([]);
  const frameRequestId = useRef<number | undefined>(undefined);

  // Monitora frame drops
  const monitorFrameDrops = useCallback(() => {
    let lastFrameTime = performance.now();
    let frameDrops = 0;

    const checkFrame = () => {
      const currentTime = performance.now();
      const timeDiff = currentTime - lastFrameTime;

      // Frame drop se > 16.67ms (60fps)
      if (timeDiff > 16.67 * 2) {
        frameDrops++;
      }

      lastFrameTime = currentTime;
      frameRequestId.current = requestAnimationFrame(checkFrame);
    };

    frameRequestId.current = requestAnimationFrame(checkFrame);

    return () => {
      if (frameRequestId.current !== undefined) {
        cancelAnimationFrame(frameRequestId.current);
      }
      setMetrics(prev => ({ ...prev, frameDrops }));
    };
  }, []);

  // Hook per misurare tempo di render
  const measureRenderTime = useCallback(() => {
    if (!enableMetrics) return undefined;

    renderStartTime.current = performance.now();

    return () => {
      if (renderStartTime.current === undefined) {
        return;
      }

      const renderTime = performance.now() - renderStartTime.current;
      renderTimes.current.push(renderTime);

      // Mantieni solo ultimi 10 render times
      if (renderTimes.current.length > 10) {
        renderTimes.current.shift();
      }

      const avgRenderTime =
        renderTimes.current.reduce((sum, time) => sum + time, 0) /
        renderTimes.current.length;

      setMetrics(prev => ({
        ...prev,
        renderCount: prev.renderCount + 1,
        avgRenderTime,
      }));

      // Warning per render lenti
      if (
        renderTime > warningThreshold &&
        PerformanceConfig.debug.enableSlowOperationWarnings
      ) {
        if (__DEV__) {
          // Dev-only performance logging
          // eslint-disable-next-line no-console
          console.warn(
            `[Performance Warning] Slow render in ${componentName}: ${renderTime.toFixed(
              2
            )}ms (threshold: ${warningThreshold}ms)`
          );
        }
      }
    };
  }, [enableMetrics, warningThreshold, componentName]);

  // Ottimizzazioni automatiche basate su performance
  const getOptimizationRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (metrics.avgRenderTime > warningThreshold) {
      recommendations.push('Consider using React.memo');
      recommendations.push('Add useMemo for expensive calculations');
    }

    if (metrics.frameDrops > 5) {
      recommendations.push('Reduce animation complexity');
      recommendations.push('Use useCallback for event handlers');
    }

    if (metrics.renderCount > 50) {
      recommendations.push('Check for unnecessary re-renders');
      recommendations.push('Optimize dependency arrays');
    }

    return recommendations;
  }, [
    metrics.avgRenderTime,
    metrics.frameDrops,
    metrics.renderCount,
    warningThreshold,
  ]);

  // Setup monitoring
  useEffect(() => {
    if (!enableMetrics) return;

    const cleanup = monitorFrameDrops();
    return cleanup;
  }, [enableMetrics, monitorFrameDrops]);

  // Device performance detection
  useEffect(() => {
    const detectSlowDevice = () => {
      const startTime = performance.now();

      // Simulazione operazione computazionale
      for (let i = 0; i < 100000; i++) {
        Math.random();
      }

      const executionTime = performance.now() - startTime;
      const isSlowDevice = executionTime > 50; // soglia empirica

      setMetrics(prev => ({ ...prev, isSlowDevice }));
    };

    detectSlowDevice();
  }, []);

  return {
    metrics,
    measureRenderTime,
    getOptimizationRecommendations,
    isSlowDevice: metrics.isSlowDevice,
  };
};
