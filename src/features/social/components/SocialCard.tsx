import React from 'react';
import { Animated } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PlatformTouchable, PerfectText, PerfectContainer, PerfectImage } from '@/components/ui';
import {
  BorderColors,
  Colors,
  Spacing,
  Typography,
} from '@/shared/constants';
import {
  DesignTokens,
  
  getMillimetricScale,
  
} from '@/shared/constants/responsiveSystem';

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
          style={[
            styles.socialCardWhiteContainer,
            { borderColor: platform.gradient[0], borderWidth: 2 },
          ] as never}
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
                  const scale = getMillimetricScale();
                  const refWidth = Math.round(baseWidth / scale);
                  const refHeight = Math.round(baseHeight / scale);
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
                <PerfectText
                  size={24}
                  lines={1}
                  style={styles.socialIconEmoji}
                >
                  {platform.emoji}
                </PerfectText>
              )}
            </PerfectContainer>

            <PerfectContainer style={styles.socialInfoContainer}>
              <PerfectText
                size={16}
                lines={1}
                style={styles.socialName}
              >
                {platform.name}
              </PerfectText>
              <PerfectText
                size={14}
                lines={1}
                style={styles.socialHandle}
              >
                {platform.handle}
              </PerfectText>
              <PerfectText
                size={12}
                lines={2}
                style={styles.socialDescription}
              >
                {platform.description}
              </PerfectText>
            </PerfectContainer>

            <PerfectContainer style={styles.arrowContainer}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={scaleDimensionLinear(24)}
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
    borderRadius: /* scaleFont(18) */ 18,
    overflow: 'hidden' as const,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  socialCardContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: Spacing[4],
  },
  socialIconContainer: {
    width: DesignTokens.components.iconSize.xlarge + 16,
    height: DesignTokens.components.iconSize.xlarge + 16,
    borderRadius: /* scaleFont(28) */ 28,
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: Spacing[4],
    shadowColor: BorderColors.brandStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  platformIcon: {
    width: DesignTokens.components.iconSize.large + 2,
    height: DesignTokens.components.iconSize.large + 2,
    resizeMode: 'contain' as const,
  },
  linkedinIcon: {
    width: DesignTokens.components.iconSize.large + 3,
    height: DesignTokens.components.iconSize.large + 3,
  },
  socialIconEmoji: {
    textAlign: 'center' as const,
  },
  socialInfoContainer: {
    flex: 1,
    marginRight: Spacing[3],
  },
  socialName: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[1],
    letterSpacing: -0.3,
  },
  socialHandle: {
    fontWeight: Typography.weights.semibold,
    color: BorderColors.brandStrong,
    marginBottom: Spacing[1],
  },
  socialDescription: {
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600],
    lineHeight: /* scaleFont(16) */ 16,
  },
  arrowContainer: {
    padding: Spacing[1],
  },
};
