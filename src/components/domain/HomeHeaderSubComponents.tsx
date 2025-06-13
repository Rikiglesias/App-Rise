import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Image, View } from 'react-native';
import { Text } from 'react-native-paper';
import {
  type HeaderImageSectionProps,
  type HeaderMissionSectionProps,
  type HeaderTextSectionProps,
} from '../../types/HomeHeaderTypes';

// Sub-components for max-lines-per-function compliance
export const HeaderTextSection: React.FC<HeaderTextSectionProps> = React.memo(
  ({ colors, titleAnim, titleOpacity, titleTransform, styles }) => (
    <View style={styles.headerSection}>
      <LinearGradient
        colors={[colors.primary[100], colors.primary[50], colors.neutral[50]]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.textContainer}>
        <Animated.View
          style={{
            opacity: Animated.multiply(titleAnim, titleOpacity),
            transform: [
              {
                translateY: Animated.add(
                  titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                  titleTransform
                ),
              },
              { scale: titleAnim },
            ],
          }}
        >
          <Text style={styles.title}>Rise Against Hunger Italia</Text>
        </Animated.View>
      </View>
    </View>
  )
);

HeaderTextSection.displayName = 'HeaderTextSection';

export const HeaderImageSection: React.FC<HeaderImageSectionProps> = React.memo(
  ({
    imageAnim,
    imageParallax,
    imageScale,
    gradientOpacity,
    pulseAnim,
    styles,
  }) => (
    <View style={styles.imageSection}>
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: imageAnim,
            transform: [
              { translateY: imageParallax },
              { scale: Animated.multiply(imageScale, pulseAnim) },
            ],
          },
        ]}
      >
        <Image
          source={require('../../assets/images/hero-banner.png')}
          style={styles.image}
        />

        <Animated.View
          style={[styles.imageGradientOverlay, { opacity: gradientOpacity }]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.1)']}
            style={styles.flexOne}
          />
        </Animated.View>
      </Animated.View>
    </View>
  )
);

HeaderImageSection.displayName = 'HeaderImageSection';

export const HeaderMissionSection: React.FC<HeaderMissionSectionProps> =
  React.memo(({ styles }) => (
    <View style={styles.missionSection}>
      <View style={styles.missionCard}>
        <Text style={styles.missionTitle}>🌍 La nostra missione</Text>
        <Text style={styles.missionDescription}>
          Combattiamo la fame nel mondo attraverso programmi alimentari
          concreti, coinvolgendo comunità locali e volontari per creare un
          impatto duraturo.
        </Text>
        <View style={styles.missionStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3.1M</Text>
            <Text style={styles.statLabel}>Pasti distribuiti</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>13K</Text>
            <Text style={styles.statLabel}>Volontari attivi</Text>
          </View>
        </View>
      </View>
    </View>
  ));

HeaderMissionSection.displayName = 'HeaderMissionSection';
