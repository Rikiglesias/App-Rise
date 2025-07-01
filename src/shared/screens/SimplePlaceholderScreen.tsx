import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';

import { ModernCTA } from '../../components/ModernCTARefactored';
import Logo from '../../components/ui/Logo';
import type { RootStackParamList } from '../../navigation/types';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../constants/designTokens';
import { useResponsive } from '../hooks/useResponsive';

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
  const { scaleFont } = useResponsive();

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
          <Text style={[styles.constructionIcon, { fontSize: scaleFont(48) }]}>
            🚧
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          <Text style={[styles.title, { fontSize: scaleFont(36) }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { fontSize: scaleFont(20) }]}>
              {subtitle}
            </Text>
          )}

          <Text style={[styles.message, { fontSize: scaleFont(16) }]}>
            Questa sezione è in fase di sviluppo.{'\n'}
            Stiamo lavorando per offrirti la migliore esperienza possibile.
          </Text>

          <View style={styles.features}>
            <Text style={[styles.featuresTitle, { fontSize: scaleFont(16) }]}>
              🎯 Prossimamente:
            </Text>
            <Text style={[styles.feature, { fontSize: scaleFont(14) }]}>
              ⚡ Contenuti aggiornati
            </Text>
            <Text style={[styles.feature, { fontSize: scaleFont(14) }]}>
              🎨 Design moderno
            </Text>
            <Text style={[styles.feature, { fontSize: scaleFont(14) }]}>
              📱 Esperienza ottimizzata
            </Text>
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
