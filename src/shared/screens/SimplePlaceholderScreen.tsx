import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { ResponsiveText } from '../../components/ui/ResponsiveText';

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
          <ResponsiveText
            style={styles.constructionIcon}
            responsiveFontSize={48}
          >
            🚧
          </ResponsiveText>
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          <ResponsiveText style={[{ fontSize: 36 }, styles.title]}>
            {title}
          </ResponsiveText>
          {subtitle && (
            <ResponsiveText style={[{ fontSize: 20 }, styles.subtitle]}>
              {subtitle}
            </ResponsiveText>
          )}

          <ResponsiveText style={[{ fontSize: 16 }, styles.message]}>
            Questa sezione è in fase di sviluppo.{'\n'}
            Stiamo lavorando per offrirti la migliore esperienza possibile.
          </ResponsiveText>

          <View style={styles.features}>
            <ResponsiveText style={[{ fontSize: 16 }, styles.featuresTitle]}>
              🎯 Prossimamente:
            </ResponsiveText>
            <ResponsiveText style={[{ fontSize: 14 }, styles.feature]}>
              ⚡ Contenuti aggiornati
            </ResponsiveText>
            <ResponsiveText style={[{ fontSize: 14 }, styles.feature]}>
              🎨 Design moderno
            </ResponsiveText>
            <ResponsiveText style={[{ fontSize: 14 }, styles.feature]}>
              📱 Esperienza ottimizzata
            </ResponsiveText>
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
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.extrabold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing[4],
  },

  subtitle: {
    // fontSize rimosso - ora gestito da ResponsiveText
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing[6],
  },

  message: {
    // fontSize rimosso - ora gestito da ResponsiveText
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
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.semibold,
    color: Colors.neutral[900],
    marginBottom: Spacing[3],
    textAlign: 'center',
  },

  feature: {
    // fontSize rimosso - ora gestito da ResponsiveText
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing[1],
  },

  actions: {
    gap: Spacing[3],
  },
});

export default SimplePlaceholderScreen;
