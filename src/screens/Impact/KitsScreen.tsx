import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlatformTouchable } from '../../components/ui';
import {
  Colors,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';
import { useHapticFeedback } from '../../shared/hooks/useHapticFeedback';
import { useNavigation } from '@react-navigation/native';

const KitsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { triggerHaptic } = useHapticFeedback();

  const handleBackPress = useCallback(async () => {
    await triggerHaptic('medium');
    navigation.goBack();
  }, [triggerHaptic, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <PlatformTouchable onPress={handleBackPress} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#000000" />
      </PlatformTouchable>

      {/* Work in Progress Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="package-variant"
            size={64}
            color="#DC2626"
          />
        </View>

        <Text style={styles.title}>Kit Prodotti</Text>

        <View style={styles.workInProgressContainer}>
          <MaterialCommunityIcons name="wrench" size={48} color="#6B7280" />
          <Text style={styles.workInProgressTitle}>Work in Progress</Text>
          <Text style={styles.workInProgressSubtitle}>
            Questa sezione è in fase di sviluppo.{'\n'}
            Torneremo presto con contenuti dettagliati!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: Spacing[4],
    padding: Spacing[2],
    borderRadius: 50,
    backgroundColor: Colors.neutral[0],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[20],
  },
  iconContainer: {
    marginBottom: Spacing[6],
    padding: Spacing[4],
    borderRadius: 50,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: Spacing[8],
    letterSpacing: -0.8,
  },
  workInProgressContainer: {
    alignItems: 'center',
    padding: Spacing[6],
    borderRadius: 20,
    backgroundColor: Colors.neutral[50],
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    borderStyle: 'dashed',
  },
  workInProgressTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: Spacing[3],
    marginBottom: Spacing[2],
  },
  workInProgressSubtitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default KitsScreen;
