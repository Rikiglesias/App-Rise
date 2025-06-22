import React from 'react';
import { Text, View } from 'react-native';
import { PlatformTouchable } from '../ui';
import { Surface } from 'react-native-paper';
import { useAnimatedPress } from '../../shared/hooks/useAnimatedPress';
import type {
  BentoActionCardProps,
  CardHeaderProps,
  CardOverlaysProps,
} from '../../types/HomeActionsTypes';

// ===================================================================
// CARD CONTENT COMPONENTS - Extracted for max-lines-per-function compliance
// ===================================================================
export const CardOverlays: React.FC<CardOverlaysProps> = React.memo(
  ({ accentColor, cardStyles }) => (
    <>
      {/* 🌈 Gradient Background */}
      <View
        style={[cardStyles.gradientOverlay, { backgroundColor: accentColor }]}
      />

      {/* 🎨 Accent Border */}
      <View
        style={[cardStyles.accentBorder, { backgroundColor: accentColor }]}
      />

      {/* 🌟 Press Overlay */}
      <View style={cardStyles.pressOverlay} />
    </>
  )
);

CardOverlays.displayName = 'CardOverlays';

export const CardHeader: React.FC<CardHeaderProps> = React.memo(
  ({ action, cardStyles }) => (
    <View style={cardStyles.cardHeader}>
      {/* 📍 Icon */}
      <View style={cardStyles.iconContainer}>
        <Text style={cardStyles.iconText}>{action.icon}</Text>
      </View>

      {/* 📝 Text Container */}
      <View style={cardStyles.textContainer}>
        <Text style={cardStyles.cardSubtitle}>{action.subtitle}</Text>
        <Text style={cardStyles.cardTitle}>{action.title}</Text>
      </View>
    </View>
  )
);

CardHeader.displayName = 'CardHeader';

// ===================================================================
// BENTO ACTION CARD - Now under 60 lines
// ===================================================================
export const BentoActionCard: React.FC<BentoActionCardProps> = React.memo(
  ({ action, cardStyles }) => {
    const { animatedStyle, handlePressIn, handlePressOut } = useAnimatedPress({
      scaleValue: 0.97,
      minOpacity: 0.9,
    });

    return (
      <PlatformTouchable
        style={cardStyles.bentoCard}
        onPress={action.handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${action.title}: ${action.description}`}
        rippleColor="rgba(220, 38, 38, 0.2)"
      >
        <Surface style={[cardStyles.cardSurface, animatedStyle]} elevation={2}>
          <View style={cardStyles.cardContentWrapper}>
            <CardOverlays
              accentColor={action.accentColor}
              cardStyles={cardStyles}
            />

            {/* 📦 Content */}
            <View style={cardStyles.cardContent}>
              <CardHeader action={action} cardStyles={cardStyles} />

              {/* 📝 Description */}
              <Text style={cardStyles.cardDescription}>
                {action.description}
              </Text>
            </View>
          </View>
        </Surface>
      </PlatformTouchable>
    );
  }
);

BentoActionCard.displayName = 'BentoActionCard';
