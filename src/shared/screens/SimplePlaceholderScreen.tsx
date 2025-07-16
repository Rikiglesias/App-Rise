import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { ModernCTA } from '../../components/ModernCTARefactored';
import { FormattedText } from '../../components/ui/FormattedText';
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
          <FormattedText
            fontSize={48}
            fixedLines={1}
            style={styles.constructionIcon}
          >
            🚧
          </FormattedText>
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          <FormattedText fontSize={36} fixedLines={2} style={styles.title}>
            {title}
          </FormattedText>
          {subtitle && (
            <FormattedText fontSize={20} fixedLines={2} style={styles.subtitle}>
              {subtitle}
            </FormattedText>
          )}

          <FormattedText fontSize={16} fixedLines={3} style={styles.message}>
            Questa sezione è in fase di sviluppo.{'\n'}
            Stiamo lavorando per offrirti la migliore esperienza possibile.
          </FormattedText>

          <View style={styles.features}>
            <FormattedText
              fontSize={16}
              fixedLines={1}
              style={styles.featuresTitle}
            >
              🎯 Prossimamente:
            </FormattedText>
            <FormattedText fontSize={14} fixedLines={1} style={styles.feature}>
              ⚡ Contenuti aggiornati
            </FormattedText>
            <FormattedText fontSize={14} fixedLines={1} style={styles.feature}>
              🎨 Design moderno
            </FormattedText>
            <FormattedText fontSize={14} fixedLines={1} style={styles.feature}>
              📱 Esperienza ottimizzata
            </FormattedText>
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
