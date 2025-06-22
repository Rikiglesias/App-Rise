/**
 * Performance Monitor Avanzato
 * Sistema completo di monitoraggio performance per Rise Against Hunger Italia
 */

import { logger } from '../utils/logger';
import { env, isFeatureEnabled } from '../config/environment';

// Tipizzazione per metriche performance
interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: 'ms' | 'fps' | 'mb' | 'count' | '%';
  timestamp: number;
  category: 'render' | 'network' | 'memory' | 'animation' | 'user';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
}

interface ComponentPerformanceData {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  slowRenders: number;
  lastRenderTime: number;
  memoryUsage: number;
}

interface NetworkPerformanceData {
  url: string;
  method: string;
  startTime: number;
  endTime: number;
  duration: number;
  statusCode: number;
  size?: number;
  success: boolean;
}

// Configurazione thresholds performance
const PERFORMANCE_THRESHOLDS = {
  render: {
    slow: 16.67, // 60fps threshold
    critical: 33.33, // 30fps threshold
  },
  memory: {
    warning: 100, // MB
    critical: 200, // MB
  },
  network: {
    slow: 3000, // 3 secondi
    critical: 10000, // 10 secondi
  },
  animation: {
    dropped_frames: 5, // frames persi consecutivi
  },
} as const;

class PerformanceMonitorService {
  private metrics: PerformanceMetric[] = [];
  private componentData: Map<string, ComponentPerformanceData> = new Map();
  private networkRequests: NetworkPerformanceData[] = [];
  private isEnabled: boolean;
  private maxMetricsBuffer = 1000;

  constructor() {
    this.isEnabled = isFeatureEnabled('ENABLE_PERFORMANCE_MONITORING');

    if (this.isEnabled) {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring(): void {
    // Setup periodic cleanup
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 60000); // Every minute

    logger.debug('Performance monitoring initialized', 'PERFORMANCE', {
      enabled: this.isEnabled,
      environment: env.NODE_ENV,
    });
  }

  // Component Performance Monitoring
  startComponentRender(componentName: string): () => void {
    if (!this.isEnabled)
      return () => {
        /* Performance monitoring disabled */
      };

    const startTime = Date.now();

    return () => {
      const endTime = Date.now();
      const renderTime = endTime - startTime;

      this.recordComponentRender(componentName, renderTime);
    };
  }

  private recordComponentRender(
    componentName: string,
    renderTime: number
  ): void {
    const existing = this.componentData.get(componentName) ?? {
      componentName,
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      slowRenders: 0,
      lastRenderTime: 0,
      memoryUsage: 0,
    };

    existing.renderCount++;
    existing.totalRenderTime += renderTime;
    existing.averageRenderTime =
      existing.totalRenderTime / existing.renderCount;
    existing.lastRenderTime = renderTime;

    if (renderTime > PERFORMANCE_THRESHOLDS.render.slow) {
      existing.slowRenders++;
    }

    this.componentData.set(componentName, existing);

    // Record metric
    this.addMetric({
      id: `render_${componentName}_${Date.now()}`,
      name: `Component Render: ${componentName}`,
      value: renderTime,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'render',
      severity: this.getPerformanceSeverity(renderTime, 'render'),
      context: { componentName, renderCount: existing.renderCount },
    });

    // Log slow renders
    if (renderTime > PERFORMANCE_THRESHOLDS.render.critical) {
      logger.warn(
        `Critical slow render detected: ${componentName}`,
        'PERFORMANCE',
        { renderTime, threshold: PERFORMANCE_THRESHOLDS.render.critical }
      );
    }
  }

  // Network Performance Monitoring
  startNetworkRequest(
    url: string,
    method: string
  ): (statusCode: number, size?: number) => void {
    if (!this.isEnabled)
      return () => {
        /* Performance monitoring disabled */
      };

    const startTime = Date.now();

    return (statusCode: number, size?: number) => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      const networkData: NetworkPerformanceData = {
        url,
        method,
        startTime,
        endTime,
        duration,
        statusCode,
        success: statusCode >= 200 && statusCode < 400,
      };

      if (size !== undefined) {
        networkData.size = size;
      }

      this.recordNetworkRequest(networkData);
    };
  }

  private recordNetworkRequest(data: NetworkPerformanceData): void {
    this.networkRequests.push(data);

    // Keep only recent requests
    if (this.networkRequests.length > 100) {
      this.networkRequests.shift();
    }

    // Record metric
    this.addMetric({
      id: `network_${data.url}_${Date.now()}`,
      name: `Network Request: ${data.method} ${data.url}`,
      value: data.duration,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'network',
      severity: this.getPerformanceSeverity(data.duration, 'network'),
      context: {
        url: data.url,
        method: data.method,
        statusCode: data.statusCode,
        size: data.size,
        success: data.success,
      },
    });

    // Log slow requests
    if (data.duration > PERFORMANCE_THRESHOLDS.network.critical) {
      logger.error(
        `Critical slow network request: ${data.method} ${data.url}`,
        'PERFORMANCE',
        { duration: data.duration, statusCode: data.statusCode }
      );
    }
  }

  // Memory Monitoring
  recordMemoryUsage(componentName?: string): void {
    if (!this.isEnabled) return;

    // Approximated memory usage (React Native doesn't have precise memory API)
    const memoryEstimate = this.estimateMemoryUsage();

    this.addMetric({
      id: `memory_${Date.now()}`,
      name: `Memory Usage${componentName ? ` - ${componentName}` : ''}`,
      value: memoryEstimate,
      unit: 'mb',
      timestamp: Date.now(),
      category: 'memory',
      severity: this.getPerformanceSeverity(memoryEstimate, 'memory'),
      context: { componentName },
    });

    if (memoryEstimate > PERFORMANCE_THRESHOLDS.memory.critical) {
      logger.error('Critical memory usage detected', 'PERFORMANCE', {
        memoryUsage: memoryEstimate,
        component: componentName,
      });
    }
  }

  // User Interaction Monitoring
  recordUserInteraction(action: string, duration?: number): void {
    if (!this.isEnabled) return;

    this.addMetric({
      id: `user_${action}_${Date.now()}`,
      name: `User Interaction: ${action}`,
      value: duration ?? 0,
      unit: duration ? 'ms' : 'count',
      timestamp: Date.now(),
      category: 'user',
      severity: 'low',
      context: { action },
    });
  }

  // Animation Performance
  recordAnimationFrame(animationName: string, frameTime: number): void {
    if (!this.isEnabled) return;

    const fps = 1000 / frameTime;

    this.addMetric({
      id: `animation_${animationName}_${Date.now()}`,
      name: `Animation Frame: ${animationName}`,
      value: fps,
      unit: 'fps',
      timestamp: Date.now(),
      category: 'animation',
      severity: this.getAnimationSeverity(fps),
      context: { animationName, frameTime },
    });

    if (fps < 30) {
      logger.warn(
        `Poor animation performance: ${animationName}`,
        'PERFORMANCE',
        { fps, frameTime }
      );
    }
  }

  // Utility Methods
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep buffer size manageable
    if (this.metrics.length > this.maxMetricsBuffer) {
      this.metrics.shift();
    }
  }

  private getPerformanceSeverity(
    value: number,
    type: 'render' | 'network' | 'memory'
  ): PerformanceMetric['severity'] {
    if (type === 'memory') {
      const memoryThresholds = PERFORMANCE_THRESHOLDS.memory;
      if (value > memoryThresholds.critical) return 'critical';
      if (value > memoryThresholds.warning) return 'high';
      return 'low';
    } else if (type === 'render') {
      const renderThresholds = PERFORMANCE_THRESHOLDS.render;
      if (value > renderThresholds.critical) return 'critical';
      if (value > renderThresholds.slow) return 'medium';
      return 'low';
    } else {
      const networkThresholds = PERFORMANCE_THRESHOLDS.network;
      if (value > networkThresholds.critical) return 'critical';
      if (value > networkThresholds.slow) return 'medium';
      return 'low';
    }
  }

  private getAnimationSeverity(fps: number): PerformanceMetric['severity'] {
    if (fps < 30) return 'critical';
    if (fps < 50) return 'medium';
    return 'low';
  }

  private estimateMemoryUsage(): number {
    // Simplified memory estimation for React Native
    // In a real implementation, you might use react-native-device-info
    const componentCount = this.componentData.size;
    const metricsCount = this.metrics.length;

    // Rough estimation in MB
    return componentCount * 0.1 + metricsCount * 0.001 + 10; // Base app memory
  }

  private cleanupOldMetrics(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.metrics = this.metrics.filter(metric => metric.timestamp > oneHourAgo);

    // Cleanup old network requests
    this.networkRequests = this.networkRequests.slice(-50); // Keep last 50
  }

  // Public APIs for reporting
  getMetrics(category?: PerformanceMetric['category']): PerformanceMetric[] {
    if (category) {
      return this.metrics.filter(metric => metric.category === category);
    }
    return [...this.metrics];
  }

  getComponentPerformance(componentName?: string): ComponentPerformanceData[] {
    if (componentName) {
      const data = this.componentData.get(componentName);
      return data ? [data] : [];
    }
    return Array.from(this.componentData.values());
  }

  getNetworkPerformance(): NetworkPerformanceData[] {
    return [...this.networkRequests];
  }

  getPerformanceReport(): Record<string, unknown> {
    const metrics = this.getMetrics();
    const criticalIssues = metrics.filter(m => m.severity === 'critical');

    return {
      summary: {
        totalMetrics: metrics.length,
        criticalIssues: criticalIssues.length,
        components: this.componentData.size,
        networkRequests: this.networkRequests.length,
      },
      categories: {
        render: metrics.filter(m => m.category === 'render').length,
        network: metrics.filter(m => m.category === 'network').length,
        memory: metrics.filter(m => m.category === 'memory').length,
        animation: metrics.filter(m => m.category === 'animation').length,
        user: metrics.filter(m => m.category === 'user').length,
      },
      criticalIssues: criticalIssues.map(issue => ({
        name: issue.name,
        value: issue.value,
        unit: issue.unit,
        timestamp: issue.timestamp,
      })),
    };
  }

  clearMetrics(): void {
    this.metrics = [];
    this.componentData.clear();
    this.networkRequests = [];

    logger.info('Performance metrics cleared', 'PERFORMANCE');
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitorService();

// Convenience hooks for React components
export const usePerformanceMonitor = (componentName: string) => {
  return {
    startRender: () => performanceMonitor.startComponentRender(componentName),
    recordMemory: () => performanceMonitor.recordMemoryUsage(componentName),
    recordInteraction: (action: string, duration?: number) =>
      performanceMonitor.recordUserInteraction(action, duration),
  };
};

// Export types for external usage
export type {
  PerformanceMetric,
  ComponentPerformanceData,
  NetworkPerformanceData,
};
