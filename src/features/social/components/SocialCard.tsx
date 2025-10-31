import React from 'react';
import { Animated } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
  PerfectImage,
} from '@/components/ui';
import { Colors, Spacing, Shadows } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

export interface SocialPlatform {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
  readonly description: string;
  readonly icon?: number;
  readonly emoji?: string;
  readonly gradient: readonly [string, string, ...string[]];
  readonly onPress: () => Promise<void>;
}

interface SocialCardProps {
  readonly platform: SocialPlatform;
  readonly animationValue?: Animated.Value; // Opzionale per compatibilità
}

export const SocialCard: React.FC<SocialCardProps> = React.memo(
  ({ platform }) => {
    return (
      <PerfectContainer style={styles.socialCardWrapper}>
        <PerfectContainer
          style={
            [
              styles.socialCardWhiteContainer,
              { borderColor: platform.gradient[0], borderWidth: 2 },
            ] as never
          }
        >
          <PlatformTouchable
            onPress={platform.onPress}
            style={styles.socialCardContent}
            accessibilityRole="button"
            accessibilityLabel={`Seguici su ${platform.name}: ${platform.handle}`}
            accessibilityHint={platform.description}
            testID={`social-card-${platform.id}`}
          >
            <PerfectContainer style={styles.socialIconContainer}>
              {platform.icon ? (
                (() => {
                  const baseWidth =
                    (styles[
                      platform.id === 'linkedin'
                        ? 'linkedinIcon'
                        : 'platformIcon'
                    ].width as number) ?? 32;
                  const baseHeight =
                    (styles[
                      platform.id === 'linkedin'
                        ? 'linkedinIcon'
                        : 'platformIcon'
                    ].height as number) ?? 32;
                  // Usa dimensioni dirette senza millimetric scale
                  const refWidth = baseWidth;
                  const refHeight = baseHeight;
                  return (
                    <PerfectImage
                      width={refWidth}
                      height={refHeight}
                      source={platform.icon}
                      imageStyle={{ resizeMode: 'contain' }}
                    />
                  );
                })()
              ) : (
                <PerfectText size={24} lines={1} style={styles.socialIconEmoji}>
                  {platform.emoji}
                </PerfectText>
              )}
            </PerfectContainer>

            <PerfectContainer style={styles.socialInfoContainer}>
              <PerfectText
                size={16}
                lines={1}
                fontWeight="700"
                style={styles.socialName}
              >
                {platform.name}
              </PerfectText>
              <PerfectText
                size={14}
                lines={1}
                fontWeight="600"
                style={styles.socialHandle}
              >
                {platform.handle}
              </PerfectText>
              <PerfectText
                size={12}
                lines={2}
                fontWeight="500"
                style={styles.socialDescription}
              >
                {platform.description}
              </PerfectText>
            </PerfectContainer>

            <PerfectContainer style={styles.arrowContainer}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={Colors.neutral[400]}
              />
            </PerfectContainer>
          </PlatformTouchable>
        </PerfectContainer>
      </PerfectContainer>
    );
  }
);

SocialCard.displayName = 'SocialCard';

const styles = {
  socialCardWrapper: {
    marginBottom: Spacing[1],
  },

  socialCardWhiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: scale(18),
    overflow: 'hidden' as const,
    ...Shadows.lg,
  },
  socialCardContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: Spacing[4],
  },
  socialIconContainer: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: Spacing[4],
    ...Shadows.md,
  },
  platformIcon: {
    width: scale(34),
    height: scale(34),
    resizeMode: 'contain' as const,
  },
  linkedinIcon: {
    width: scale(35),
    height: scale(35),
  },
  socialIconEmoji: {
    textAlign: 'center' as const,
  },
  socialInfoContainer: {
    flex: 1,
    marginRight: Spacing[3],
  },
  socialName: {
    color: Colors.neutral[900],
    marginBottom: Spacing[1],
    letterSpacing: -0.3,
  },
  socialHandle: {
    color: Colors.primary[500],
    marginBottom: Spacing[1],
  },
  socialDescription: {
    color: Colors.neutral[600],
  },
  arrowContainer: {
    padding: Spacing[1],
  },
};
