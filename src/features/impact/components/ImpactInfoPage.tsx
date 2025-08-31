import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { PlatformScrollView } from '../../../components/ui';

import { TypographyTokens } from '../../../shared/constants/responsiveSystem';
import { Colors, Spacing, Typography } from '../../../shared/constants';

interface ImpactInfoPageProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const ImpactInfoPage: React.FC<ImpactInfoPageProps> = ({
  icon,
  title,
  subtitle,
  children,
}) => {
  return (
    <PlatformScrollView>
      <Animated.View style={styles.header} entering={FadeInUp.duration(600)}>
        <MaterialCommunityIcons
          name={icon}
          size={48}
          color={Colors.primary[600]}
        />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </Animated.View>
      {children}
    </PlatformScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: Spacing[6],
    paddingHorizontal: Spacing[4],
  },
  title: {
    fontSize: TypographyTokens.styles.headline.small,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginTop: Spacing[4],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TypographyTokens.styles.body.large,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginTop: Spacing[2],
  },
});

export default ImpactInfoPage;
