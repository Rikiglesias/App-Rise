import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModernCTA } from '../../components/ModernCTARefactored';
import { PerfectText } from '../../components/ui/PerfectText';
import Logo from '../../components/ui/Logo';
import type { RootStackParamList } from '../../navigation/types';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../constants/designTokens';

type SimplePlaceholderScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CharityShop' | 'CharityGiftCard' | 'Calendario' | 'Tracciabilita'
>;

interface Props {
  readonly navigation: SimplePlaceholderScreenNavigationProp;
  readonly route: {
    params?: {
      title?: string;
      subtitle?: string;
      description?: string;
    };
  };
}

const SimplePlaceholderScreen: React.FC<Props> = ({ navigation, route }) => {
  const { title = 'Sezione in Sviluppo', subtitle } = route.params ?? {};

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleGoHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Logo size={48} />
          <PerfectText size={48} lines={1} style={styles.constructionIcon}>
            🚧
          </PerfectText>
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          <PerfectText size={36} lines={2} style={styles.title}>
            {title}
          </PerfectText>
          {subtitle && (
            <PerfectText size={20} lines={2} style={styles.subtitle}>
              {subtitle}
            </PerfectText>
          )}

          <PerfectText size={16} lines={3} style={styles.message}>
            Questa sezione è in fase di sviluppo.{'\n'}
            Stiamo lavorando per offrirti la migliore esperienza possibile.
          </PerfectText>

          <View style={styles.features}>
            <PerfectText size={16} lines={1} style={styles.featuresTitle}>
              🎯 Prossimamente:
            </PerfectText>
            <PerfectText size={14} lines={1} style={styles.feature}>
              ⚡ Contenuti aggiornati
            </PerfectText>
            <PerfectText size={14} lines={1} style={styles.feature}>
              🎨 Design moderno
            </PerfectText>
            <PerfectText size={14} lines={1} style={styles.feature}>
              📱 Esperienza ottimizzata
            </PerfectText>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <ModernCTA
            title="TORNA ALLA HOME"
            variant="primary"
            onPress={handleGoHome}
          />
          <ModernCTA
            title="INDIETRO"
            variant="secondary"
            onPress={handleGoBack}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },

  content: {
    flex: 1,
    padding: Spacing[6],
    justifyContent: 'space-between',
  },

  header: {
    alignItems: 'center',
    paddingVertical: Spacing[8],
  },

  constructionIcon: {
    marginTop: Spacing[4],
  },

  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontWeight: Typography.weights.extrabold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing[4],
  },

  subtitle: {
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing[6],
  },

  message: {
    color: Colors.neutral[700],
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed,
    marginBottom: Spacing[8],
  },

  features: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    ...Shadows.sm,
  },

  featuresTitle: {
    fontWeight: Typography.weights.semibold,
    color: Colors.neutral[900],
    marginBottom: Spacing[3],
    textAlign: 'center',
  },

  feature: {
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing[1],
  },

  actions: {
    gap: Spacing[3],
  },
});

export default SimplePlaceholderScreen;
