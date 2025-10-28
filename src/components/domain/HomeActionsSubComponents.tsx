import React from 'react';
import { View, TextStyle } from 'react-native';
import { Surface } from 'react-native-paper';
import { PlatformTouchable } from '../ui';
import { PerfectText } from '../ui/PerfectText';
import { useAnimatedPress } from '../../shared/hooks/useAnimatedPress';
import type {
  BentoActionCardProps,
  CardHeaderProps,
  CardOverlaysProps,
} from '../../features/actions/types/HomeActionsTypes';

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
        <PerfectText
          size={(cardStyles.iconText as TextStyle)?.fontSize ?? 18}
          lines={1}
          style={cardStyles.iconText}
        >
          {action.icon}
        </PerfectText>
      </View>

      {/* 📝 Text Container */}
      <View style={cardStyles.textContainer}>
        <PerfectText
          size={(cardStyles.cardSubtitle as TextStyle)?.fontSize ?? 16}
          lines={2}
          style={cardStyles.cardSubtitle}
        >
          {action.subtitle}
        </PerfectText>
        <PerfectText
          size={(cardStyles.cardTitle as TextStyle)?.fontSize ?? 20}
          lines={2}
          style={cardStyles.cardTitle}
        >
          {action.title}
        </PerfectText>
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
              <PerfectText
                size={(cardStyles.cardDescription as TextStyle)?.fontSize ?? 14}
                lines={3}
                style={cardStyles.cardDescription}
              >
                {action.description}
              </PerfectText>
            </View>
          </View>
        </Surface>
      </PlatformTouchable>
    );
  }
);

BentoActionCard.displayName = 'BentoActionCard';
