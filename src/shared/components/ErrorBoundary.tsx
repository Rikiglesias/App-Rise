/**
 * Error Boundary - Cattura errori JS e previene crash dell'app
 * Rise Against Hunger Italia
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import * as Updates from 'expo-updates';
import * as Sentry from '@sentry/react-native';
import { logger } from '@/shared/utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Aggiorna lo state così il prossimo render mostrerà l'UI di fallback
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log dell'errore per telemetria
    logger.error('Uncaught error in component tree', 'ErrorBoundary', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Crash reporting Sentry: invia il crash di render con il component stack come
    // contesto. No-op se Sentry non è inizializzato (DSN assente) — vedi App.tsx.
    Sentry.captureException(error, {
      contexts: {
        react: { componentStack: errorInfo.componentStack },
      },
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = async (): Promise<void> => {
    try {
      // Prova a ricaricare l'app con Updates se disponibile
      if (typeof Updates?.reloadAsync === 'function') {
        await Updates.reloadAsync();
      } else {
        // Fallback: reset dello state
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
        });
      }
    } catch (reloadError) {
      logger.error('Failed to reload app', 'ErrorBoundary', {
        error: (reloadError as Error).message,
      });
      // Reset manuale dello state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }
  };

  override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.emoji}>⚠️</Text>
              <Text style={styles.title}>Qualcosa è andato storto</Text>
              <Text style={styles.subtitle}>
                L&apos;app ha riscontrato un errore imprevisto
              </Text>
            </View>

            {/* Error Info */}
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Errore Tecnico:</Text>
              <Text style={styles.errorMessage}>
                {this.state.error.message || 'Unknown error'}
              </Text>
            </View>

            {/* Stack Trace (collapsible in produzione) */}
            {__DEV__ && this.state.error.stack && (
              <View style={styles.stackBox}>
                <Text style={styles.stackTitle}>Stack Trace (dev only):</Text>
                <Text style={styles.stackText}>{this.state.error.stack}</Text>
              </View>
            )}

            {/* Component Stack */}
            {__DEV__ && this.state.errorInfo?.componentStack && (
              <View style={styles.stackBox}>
                <Text style={styles.stackTitle}>Component Stack:</Text>
                <Text style={styles.stackText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={this.handleReload}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonPrimaryText}>🔄 Ricarica App</Text>
              </TouchableOpacity>

              {__DEV__ && (
                <TouchableOpacity
                  style={styles.buttonSecondary}
                  onPress={() => {
                    this.setState({
                      hasError: false,
                      error: null,
                      errorInfo: null,
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonSecondaryText}>
                    Ignora Errore (dev only)
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Footer Info */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Se il problema persiste, contatta il supporto tecnico
              </Text>
              <Text style={styles.footerVersion}>
                {/* Version displayed in footer */}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#DC2626',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  stackBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  stackTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  stackText: {
    fontSize: 11,
    color: '#4B5563',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  buttonPrimary: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerVersion: {
    fontSize: 11,
    color: '#D1D5DB',
    fontFamily: 'monospace',
  },
});
