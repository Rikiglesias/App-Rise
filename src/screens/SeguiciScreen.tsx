/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../constants/designTokens';
import { useLinkHandler } from '../hooks/useLinkHandler';
import type { RootStackParamList } from '../navigation/types';
import { isSuccess } from '../utils/result';

type SeguiciScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Seguici'
>;

interface Props {
  readonly navigation: SeguiciScreenNavigationProp;
}

const SeguiciScreen: React.FC<Props> = ({ navigation: _navigation }) => {
  const { openLink } = useLinkHandler();

  const handleWebsitePress = useCallback(async () => {
    const result = await openLink(
      'https://italy.riseagainsthunger.org/',
      'website',
      'Impossibile aprire il sito web.'
    );

    if (!isSuccess(result) && __DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[SeguiciScreen] Failed to open website:', result.error);
    }
  }, [openLink]);

  const handleInstagramPress = useCallback(async () => {
    const result = await openLink(
      'https://www.instagram.com/riseagainsthungeritalia/',
      'instagram',
      'Impossibile aprire Instagram.'
    );

    if (!isSuccess(result) && __DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[SeguiciScreen] Failed to open Instagram:', result.error);
    }
  }, [openLink]);

  const handleFacebookPress = useCallback(async () => {
    const result = await openLink(
      'https://www.facebook.com/RiseAgainstHungerItalia',
      'facebook',
      'Impossibile aprire Facebook.'
    );

    if (!isSuccess(result) && __DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[SeguiciScreen] Failed to open Facebook:', result.error);
    }
  }, [openLink]);

  const handleLinkedInPress = useCallback(async () => {
    const result = await openLink(
      'https://www.linkedin.com/company/rise-against-hunger-italia/mycompany/',
      'linkedin',
      'Impossibile aprire LinkedIn.'
    );

    if (!isSuccess(result) && __DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[SeguiciScreen] Failed to open LinkedIn:', result.error);
    }
  }, [openLink]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Seguici</Text>
          <Text style={styles.subtitle}>Resta connesso con noi</Text>
        </View>

        <View style={styles.socialSection}>
          <TouchableOpacity
            style={styles.socialCard}
            onPress={handleWebsitePress}
          >
            <Text style={styles.socialIcon}>🌐</Text>
            <View style={styles.socialInfo}>
              <Text style={styles.socialName}>Sito Web</Text>
              <Text style={styles.socialHandle}>
                italy.riseagainsthunger.org
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialCard}
            onPress={handleInstagramPress}
          >
            <Image
              // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
              source={
                require('../../assets/images/icons/instagram.png') as number
              }
              style={styles.platformIcon}
            />
            <View style={styles.socialInfo}>
              <Text style={styles.socialName}>Instagram</Text>
              <Text style={styles.socialHandle}>@riseagainsthungeritalia</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialCard}
            onPress={handleFacebookPress}
          >
            <Image
              // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
              source={
                require('../../assets/images/icons/facebook.png') as number
              }
              style={styles.platformIcon}
            />
            <View style={styles.socialInfo}>
              <Text style={styles.socialName}>Facebook</Text>
              <Text style={styles.socialHandle}>@RiseAgainstHungerItalia</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialCard}
            onPress={handleLinkedInPress}
          >
            <Image
              // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
              source={
                require('../../assets/images/icons/linkedin.png') as number
              }
              style={styles.platformIcon}
            />
            <View style={styles.socialInfo}>
              <Text style={styles.socialName}>LinkedIn</Text>
              <Text style={styles.socialHandle}>
                Rise Against Hunger Italia • 1.7K
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3.1M</Text>
              <Text style={styles.statLabel}>Pasti 2024</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>13K</Text>
              <Text style={styles.statLabel}>Volontari</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>16K</Text>
              <Text style={styles.statLabel}>Kit</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },

  scrollView: {
    flex: 1,
  },

  header: {
    backgroundColor: Colors.neutral[0],
    paddingVertical: Spacing[8],
    paddingHorizontal: Spacing[6],
    alignItems: 'center',
  },

  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: '800',
    color: Colors.neutral[900],
    textAlign: 'center',
  },

  subtitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '500',
    color: Colors.neutral[700],
    textAlign: 'center',
    marginTop: Spacing[2],
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
  },

  socialSection: {
    marginHorizontal: Spacing[4],
    marginTop: Spacing[6],
    gap: Spacing[3],
  },

  socialCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.sm,
  },

  socialIcon: {
    fontSize: 24,
    marginRight: Spacing[4],
  },

  platformIcon: {
    width: 24,
    height: 24,
    marginRight: Spacing[4],
  },

  socialInfo: {
    flex: 1,
  },

  socialName: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.neutral[900],
  },

  socialHandle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '400',
    color: Colors.neutral[600],
    marginTop: Spacing[1],
  },

  statsSection: {
    backgroundColor: Colors.neutral[0],
    marginHorizontal: Spacing[4],
    marginTop: Spacing[6],
    marginBottom: Spacing[8],
    borderRadius: BorderRadius.lg,
    padding: Spacing[6],
    ...Shadows.sm,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statItem: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '800',
    color: Colors.primary[600],
  },

  statLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: '500',
    color: Colors.neutral[600],
    marginTop: Spacing[1],
  },
});

export default SeguiciScreen;
