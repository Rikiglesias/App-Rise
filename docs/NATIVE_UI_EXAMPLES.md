# 🎯 Guida Pratica: UI Nativa Perfetta

Esempi concreti di implementazione dei principi cross-platform della nostra app.

## 🚀 **Componenti Platform-Aware**

### 1. **PlatformIcon - SF Symbols + Material Icons**

```tsx
import { PlatformIcon } from '../components/ui';

// iOS: SF Symbols, Android: Material Icons
function MyComponent() {
  return (
    <PlatformIcon
      name="house.fill" // iOS: SF Symbol, Android: tradotto in 'home'
      size={24}
      color="#DC2626"
    />
  );
}
```

### 2. **PlatformTouchable - Ripple vs Opacity**

```tsx
import { PlatformTouchable } from '../components/ui';

function MyButton() {
  return (
    <PlatformTouchable
      onPress={handlePress}
      rippleColor="rgba(220, 38, 38, 0.2)" // Solo Android
      activeOpacity={0.7} // Solo iOS
    >
      <Text>Bottone Intelligente</Text>
    </PlatformTouchable>
  );
}
```

### 3. **useAdaptiveUI - Everything In One Hook**

```tsx
import { useAdaptiveUI } from '../shared/hooks';

function AdaptiveComponent() {
  const {
    platform,
    typography,
    spacing,
    colors,
    components,
    getPlatformValue,
    getAdaptiveValue,
  } = useAdaptiveUI();

  return (
    <View
      style={{
        // Safe area automatica
        paddingTop: spacing.topSafe,

        // Padding adattivo per schermo
        paddingHorizontal: spacing.adaptive(16),

        // Colore background platform-aware
        backgroundColor: colors.background.primary,

        // Altezza bottone platform-correct
        height: components.button.height, // 44 iOS, 48 Android

        // Border radius platform-specific
        borderRadius: components.button.borderRadius, // 8 iOS, 4 Android
      }}
    >
      <Text
        style={{
          // Font family automatica
          fontFamily: typography.family.heading, // SF Pro iOS, Roboto Android

          // Size adattivo per schermo
          fontSize: typography.adaptiveSize(18),

          // Weight platform-optimized
          fontWeight: typography.getPlatformWeight('semibold'),

          // Letter spacing platform-specific
          letterSpacing: typography.letterSpacing.normal,

          // Colore text adaptive
          color: colors.text.primary,
        }}
      >
        {getPlatformValue('Testo iOS', 'Testo Android')}
      </Text>
    </View>
  );
}
```

## 🎨 **Design Tokens Platform-Specific**

### 1. **Shadows Intelligenti**

```tsx
import { PlatformShadows } from '../shared/constants/platformDesignTokens';

const styles = StyleSheet.create({
  card: {
    ...PlatformShadows.md, // iOS: shadow properties, Android: elevation
    backgroundColor: 'white',
  },
});
```

### 2. **Typography Avanzata**

```tsx
import { PlatformTypography } from '../shared/constants/platformDesignTokens';

const styles = StyleSheet.create({
  heading: {
    fontFamily: PlatformTypography.family.heading, // SF Pro Display | Roboto
    lineHeight: PlatformTypography.lineHeight.tight * 24, // 1.25 iOS, 1.3 Android
    letterSpacing: PlatformTypography.letterSpacing.tight, // -0.5 iOS, -0.25 Android
  },
});
```

### 3. **Dark Mode System-Aware**

```tsx
import {
  getPlatformDarkColors,
  getSystemColorScheme,
} from '../shared/constants/platformDesignTokens';

function DarkModeComponent() {
  const colorScheme = getSystemColorScheme();
  const darkColors = getPlatformDarkColors();

  if (colorScheme === 'dark') {
    return (
      <View
        style={{
          backgroundColor: darkColors.background.primary, // #000000 iOS, #121212 Android
        }}
      >
        <Text
          style={{
            color: darkColors.text.secondary, // #EBEBF5CC iOS, #E0E0E0 Android
          }}
        >
          Testo Dark Mode Platform-Specific
        </Text>
      </View>
    );
  }

  return <RegularComponent />;
}
```

## 🎭 **Gesture & Motion Platform-Specific**

### 1. **Swipe Gestures**

```tsx
import { PlatformMotion } from '../shared/constants/platformDesignTokens';

function SwipeComponent() {
  const panGesture = Gesture.Pan()
    .minDistance(PlatformMotion.pan.minDistance) // 10 iOS, 12 Android
    .failOffsetY(PlatformMotion.pan.failOffsetY); // 5 iOS, 8 Android

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View>{/* Content */}</Animated.View>
    </GestureDetector>
  );
}
```

### 2. **Animazioni Platform-Optimized**

```tsx
import { PlatformAnimations } from '../shared/constants/platformDesignTokens';

function AnimatedComponent() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animate = () => {
    Animated.timing(scaleAnim, {
      toValue: PlatformAnimations.scale.current.pressIn, // 0.95 iOS, 0.97 Android
      duration: PlatformAnimations.duration.fast, // 150 iOS, 200 Android
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      {/* Content */}
    </Animated.View>
  );
}
```

## 🔧 **Navigation Platform-Aware**

### 1. **Tab Bar Altezze**

```tsx
import { PlatformNavigation } from '../shared/constants/platformDesignTokens';

const tabBarStyle = {
  height: PlatformNavigation.tabBarHeight, // 83 iOS, 56 Android
  backgroundColor: 'white',
};
```

### 2. **Status Bar Configuration**

```tsx
import { PlatformNavigation } from '../shared/constants/platformDesignTokens';

function App() {
  return (
    <>
      <StatusBar
        barStyle={PlatformNavigation.statusBar.style}
        backgroundColor={PlatformNavigation.statusBar.backgroundColor}
        translucent={PlatformNavigation.statusBar.translucent}
      />
      {/* Rest of app */}
    </>
  );
}
```

## 🎯 **Accessibility Platform-Specific**

### 1. **Touch Targets**

```tsx
import { PlatformTouch } from '../shared/constants/platformDesignTokens';

const styles = StyleSheet.create({
  button: {
    minHeight: PlatformTouch.minSize, // 44 iOS, 48 Android
    minWidth: PlatformTouch.minSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### 2. **Accessibility Labels**

```tsx
import { useAdaptiveUI } from '../shared/hooks';

function AccessibleButton() {
  const { accessibility } = useAdaptiveUI();

  return (
    <PlatformTouchable
      accessibilityLabel={accessibility.getLabel('Dona ora')}
      accessibilityHint={accessibility.getHint('donare')}
    >
      <Text>Dona</Text>
    </PlatformTouchable>
  );
}
```

## 📱 **Esempi Completi**

### 1. **Card Component Perfetta**

```tsx
import {
  useAdaptiveUI,
  PlatformTouchable,
  PlatformIcon,
} from '../components/ui';

function PerfectCard({ title, onPress }) {
  const { platform, spacing, colors, components } = useAdaptiveUI();

  return (
    <PlatformTouchable
      onPress={onPress}
      style={{
        backgroundColor: colors.surface.elevated,
        borderRadius: components.card.borderRadius,
        padding: spacing.adaptive(16),
        marginBottom: spacing.adaptive(12),
        ...PlatformShadows.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <PlatformIcon
          name={platform.isIOS ? 'star.fill' : 'star'}
          size={24}
          color={colors.text.primary}
        />
        <Text
          style={{
            marginLeft: spacing.adaptive(12),
            fontFamily: typography.family.body,
            fontSize: typography.adaptiveSize(16),
            color: colors.text.primary,
          }}
        >
          {title}
        </Text>
        <PlatformIcon
          name={platform.isIOS ? 'chevron.right' : 'chevron-right'}
          size={20}
          color={colors.text.tertiary}
        />
      </View>
    </PlatformTouchable>
  );
}
```

## 🏆 **Best Practices**

### ✅ **DO**

- Usa sempre `useAdaptiveUI` per layout complessi
- Implementa `PlatformTouchable` per tutte le interazioni
- Gestisci dark mode con `getPlatformDarkColors`
- Rispetta `PlatformTouch.minSize` per accessibilità
- Usa `PlatformIcon` per coerenza visuale

### ❌ **DON'T**

- Non usare mai pixel fissi senza adaptive scaling
- Non ignorare le differenze di typography tra piattaforme
- Non usare shadow proprieties su Android (usa elevation)
- Non implementare gesture senza considerare platform thresholds
- Non hardcodare colori senza dark mode support

## 🎊 **Risultato**

Con questi strumenti la tua app avrà:

- ✅ **100% Native Feel** su entrambe le piattaforme
- ✅ **Accessibilità Perfect** iOS + Android
- ✅ **Dark Mode System-Aware**
- ✅ **Performance Optimized** per ogni OS
- ✅ **Future-Proof** per aggiornamenti iOS/Android
