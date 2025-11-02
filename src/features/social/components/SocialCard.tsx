import React from 'react';
import {
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
  PerfectImage,
  PlatformIcon,
} from '@/components/ui';
import { Colors, PerfectSpacing } from '@/shared/constants';
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
}

export const SocialCard: React.FC<SocialCardProps> = React.memo(
  ({ platform }) => {
    return (
      <PerfectContainer style={styles.socialCardWrapper}>
        <PerfectContainer
          style={[
            styles.socialCardWhiteContainer,
            { borderColor: platform.gradient[0] },
          ]}
        >
          <PlatformTouchable
            onPress={platform.onPress}
            style={styles.touchableArea}
            accessibilityRole="button"
            accessibilityLabel={`Seguici su ${platform.name}: ${platform.handle}`}
            accessibilityHint={platform.description}
            testID={`social-card-${platform.id}`}
          >
            <PerfectContainer style={styles.socialCardContent}>
              <PerfectContainer style={styles.socialIconContainer}>
                {platform.icon ? (
                  <PerfectImage
                    width={40}
                    height={40}
                    source={platform.icon}
                    imageStyle={{ resizeMode: 'contain' }}
                  />
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
                  containerWidth={0}
                  style={styles.socialDescription}
                >
                  {platform.description}
                </PerfectText>
              </PerfectContainer>

              <PerfectContainer style={styles.arrowContainer}>
                <PlatformIcon
                  name="chevron-right"
                  size={24}
                  color={Colors.neutral[400]}
                />
              </PerfectContainer>
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
    marginBottom: PerfectSpacing.xs,
  },

  socialCardWhiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: scale(18),
    borderWidth: 2,
    overflow: 'hidden' as const,
  },
  touchableArea: {
    width: '100%' as const,
  },
  socialCardContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: PerfectSpacing.base,
    flexWrap: 'nowrap' as const,
    width: '100%' as const,
  },
  socialIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'transparent' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: PerfectSpacing.base,
    flexShrink: 0,
    overflow: 'hidden' as const,
  },
  socialIconEmoji: {
    textAlign: 'center' as const,
  },
  socialInfoContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: PerfectSpacing.md,
  },
  socialName: {
    color: Colors.neutral[900],
    marginBottom: PerfectSpacing.xs,
    letterSpacing: 0,
  },
  socialHandle: {
    color: Colors.primary[500],
    marginBottom: PerfectSpacing.xs,
  },
  socialDescription: {
    color: Colors.neutral[600],
  },
  arrowContainer: {
    flexShrink: 0,
    padding: PerfectSpacing.xs,
  },
};
