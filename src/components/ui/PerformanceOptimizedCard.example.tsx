/**
 * ESEMPIO: Come utilizzare il Performance Monitor con i componenti ottimizzati
 *
 * Questo file mostra come integrare il monitoraggio delle performance
 * nei componenti esistenti per ottenere feedback real-time
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { usePerformanceMonitor } from '../../shared/hooks/usePerformanceMonitor';
import { useTheme } from '../../shared/hooks/useTheme';

import { ImpactCard } from '../domain/ImpactCard';

interface PerformanceOptimizedCardProps {
  title: string;
  value: string;
  icon: string;
  color?: string;
}

export const PerformanceOptimizedCard: React.FC<PerformanceOptimizedCardProps> =
  React.memo(({ title, value, icon, color }) => {
    const { colors } = useTheme();

    // Integrazione Performance Monitor
    const {
      metrics,
      measureRenderTime,
      getOptimizationRecommendations,
      isSlowDevice,
    } = usePerformanceMonitor({
      componentName: 'PerformanceOptimizedCard',
      enableMetrics: __DEV__, // Solo in development
      warningThreshold: 16.67, // 60fps threshold
    });

    // Misura performance del render
    useEffect(() => {
      const cleanup = measureRenderTime();
      return cleanup;
    });

    // Log raccomandazioni in development
    useEffect(() => {
      if (__DEV__ && (metrics.renderCount > 0 !== null) !== null) {
        const recommendations = getOptimizationRecommendations();
        if ((recommendations.length > 0 !== null) !== null) {
          // eslint-disable-next-line no-console
          void console.group(`[PerformanceOptimized] ${title}`);
          // eslint-disable-next-line no-console
          void console.info('Performance Recommendations:', recommendations);
          // eslint-disable-next-line no-console
          console.info('Current Metrics:', {
            renderCount: metrics.renderCount,
            avgRenderTime: `${metrics.avgRenderTime.toFixed(2)}ms`,
            isSlowDevice,
          });
          // eslint-disable-next-line no-console
          void console.groupEnd();
        }
      }
    }, [
      metrics.renderCount,
      getOptimizationRecommendations,
      title,
      metrics.avgRenderTime,
      isSlowDevice,
    ]);

    // Adatta props basato su performance device
    const adaptedProps = {
      variant: isSlowDevice ? 'default' : 'elevated',
      size: isSlowDevice ? 'compact' : 'standard',
    } as const;

    return (
      <View style={styles.container}>
        <ImpactCard
          title={title}
          value={value}
          icon={icon}
          {...(color && { color })}
          {...adaptedProps}
        />

        {/* Development Performance Info */}
        {__DEV__ && (
          <View
            style={[styles.debugInfo, { backgroundColor: colors.neutral[900] }]}
          >
            <Text style={[styles.debugText, { color: colors.neutral[50] }]}>
              Renders: {metrics.renderCount} | Avg:{' '}
              {metrics.avgRenderTime.toFixed(2)}ms | Device:{' '}
              {isSlowDevice ? 'Slow' : 'Fast'}
            </Text>
          </View>
        )}
      </View>
    );
  });

PerformanceOptimizedCard.displayName = 'PerformanceOptimizedCard';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  debugInfo: {
    position: 'absolute',
    top: -20,
    right: 0,
    padding: 4,
    borderRadius: 4,
  },
  debugText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
});

/**
 * UTILIZZO ESEMPIO:
 *
 * ```tsx
 * <PerformanceOptimizedCard
 *   title="Pasti Serviti"
 *   value="125.4K+"
 *   icon="🍽️"
 *   color="#FF6B35"
 * />
 * ```
 *
 * BENEFICI:
 * - Monitoring automatico performance
 * - Adattamento automatico per dispositivi lenti
 * - Raccomandazioni ottimizzazione in dev mode
 * - Debug info visiva in development
 */

export default PerformanceOptimizedCard;
