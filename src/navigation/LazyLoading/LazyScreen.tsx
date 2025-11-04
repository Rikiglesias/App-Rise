/**
 * LAZY SCREEN COMPONENT - Code Splitting con Loading States
 * Gestisce il caricamento lazy delle screen con fallback e error handling
 */

import React, { Suspense } from 'react';
import { StyleSheet } from 'react-native';
import { PerfectText, PerfectContainer } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { logger } from '@/shared/utils/logger';

interface LazyScreenProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

/**
 * Componente di fallback per il loading - RIMOSSO
 */
const DefaultLoadingFallback: React.FC = () => (
  <PerfectContainer style={styles.loadingContainer}>
    {/* Loading rimosso per migliorare UX */}
  </PerfectContainer>
);

/**
 * Componente di fallback per errori
 */
const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({
  error,
  retry,
}) => (
  <PerfectContainer style={styles.errorContainer}>
    <PerfectText
      size={18}
      lines={1}
      fontWeight="400"
      style={styles.errorTitle}
      immunity={true}
    >
      Errore di caricamento
    </PerfectText>
    <PerfectText
      size={14}
      lines={2}
      fontWeight="400"
      style={styles.errorMessage}
      immunity={true}
    >
      {error.message || 'Impossibile caricare la schermata'}
    </PerfectText>
    <PerfectContainer style={styles.retryButton}>
      <PerfectText
        size={16}
        lines={1}
        fontWeight="400"
        style={styles.retryText}
        immunity={true}
        onPress={retry}
      >
        Riprova
      </PerfectText>
    </PerfectContainer>
  </PerfectContainer>
);

/**
 * Error Boundary per gestire errori durante il lazy loading
 */
class LazyErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback: React.ComponentType<{ error: Error; retry: () => void }>;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback: React.ComponentType<{ error: Error; retry: () => void }>;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('LazyScreen', 'Component error caught', {
      error: error.message,
      stack: error.stack,
      errorInfo,
    });
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      return <FallbackComponent error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

/**
 * Componente principale per lazy loading delle screen
 *
 * BENEFICI:
 * - Code splitting automatico
 * - Loading states eleganti
 * - Error handling robusto
 * - Performance ottimizzate
 * - Bundle size ridotto
 */
export const LazyScreen: React.FC<LazyScreenProps> = ({
  children,
  fallback: LoadingFallback = DefaultLoadingFallback,
  errorFallback: ErrorFallback = DefaultErrorFallback,
}) => {
  return (
    <LazyErrorBoundary fallback={ErrorFallback}>
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </LazyErrorBoundary>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: PerfectSpacing.lg,
  },
  loadingText: {
    marginTop: PerfectSpacing.base,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: PerfectSpacing.lg,
  },
  errorTitle: {
    color: Colors.primary[500],
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: PerfectSpacing.sm,
  },
  errorMessage: {
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: PerfectSpacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: PerfectSpacing.lg,
    paddingVertical: PerfectSpacing.md,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.neutral[0],
    fontWeight: '600',
  },
});
