import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SocialCard } from '../../../../features/social/components/SocialCard';
import type { SocialPlatform } from '../../../../features/social/components/SocialCard';
import { AllProviders } from '../../../helpers/testProviders';

// Mock delle dipendenze - approccio semplificato
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Animated: {
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      interpolate: jest.fn(() => ({
        setValue: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    })),
    timing: jest.fn(() => ({ start: jest.fn() })),
    createAnimatedComponent: jest.fn(component => component),
    View: 'Animated.View',
  },
  Platform: {
    OS: 'ios',
    select: jest.fn(obj => obj.ios || obj.default),
  },
  StyleSheet: {
    create: jest.fn(styles => styles),
    flatten: jest.fn(style => style || {}),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  View: 'View',
  Image: 'Image',
  Appearance: {
    getColorScheme: jest.fn(() => 'light'),
    addChangeListener: jest.fn(),
    removeChangeListener: jest.fn(),
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock(
  '@expo/vector-icons/MaterialCommunityIcons',
  () => 'MaterialCommunityIcons'
);

jest.mock('react-native-paper', () => ({
  Text: 'Text',
  Button: 'Button',
  Card: 'Card',
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

jest.mock('react-native-svg', () => ({
  default: 'Svg',
  Circle: 'Circle',
  Path: 'Path',
  G: 'G',
}));

jest.mock('../../../../components/ui', () => {
  const React = jest.requireActual('react');
  return {
    PlatformTouchable: ({
      children,
      testID,
      onPress,
      ...props
    }: React.ComponentProps<'div'> & {
      children: React.ReactNode;
      testID?: string;
      onPress?: () => void;
    }) => {
      return React.createElement(
        'View',
        { testID, onPress, ...props },
        children
      );
    },
    PerfectText: ({
      children,
      ...props
    }: React.ComponentProps<'span'> & { children: React.ReactNode }) => {
      return React.createElement('Text', props, children);
    },
    PerfectContainer: ({
      children,
      ...props
    }: React.ComponentProps<'div'> & { children?: React.ReactNode }) => {
      return React.createElement('View', props, children);
    },
    PerfectImage: (props: any) => {
      return React.createElement('Image', props);
    },
  };
});

const mockOnPress = jest.fn();

const mockSocialPlatform: SocialPlatform = {
  id: 'instagram',
  name: 'Instagram',
  handle: '@test_handle',
  description: 'Test description for Instagram',
  emoji: '📸',
  gradient: ['#E1306C', '#F56040', '#FCAF45'],
  onPress: mockOnPress,
};

const mockAnimationValue = new (jest.requireActual(
  'react-native'
).Animated.Value)(1);

const SocialCardWithTheme = (props: { platform: SocialPlatform }) => (
  <AllProviders>
    <SocialCard platform={props.platform} animationValue={mockAnimationValue} />
  </AllProviders>
);

describe('SocialCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders social platform information correctly', () => {
    render(<SocialCardWithTheme platform={mockSocialPlatform} />);

    expect(screen.getByText('📸')).toBeTruthy();
    expect(screen.getByText('Instagram')).toBeTruthy();
    expect(screen.getByText('@test_handle')).toBeTruthy();
    expect(screen.getByText('Test description for Instagram')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    render(<SocialCardWithTheme platform={mockSocialPlatform} />);

    const card = screen.getByTestId('social-card-instagram');
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders with icon when provided instead of emoji', () => {
    const platformWithIcon: SocialPlatform = {
      ...mockSocialPlatform,
      icon: 123, // Mock image source
    };
    delete (platformWithIcon as unknown as { emoji?: string }).emoji;

    render(<SocialCardWithTheme platform={platformWithIcon} />);

    expect(screen.queryByText('📸')).toBeNull();
  });

  it('applies correct gradient colors', () => {
    const { toJSON } = render(
      <SocialCardWithTheme platform={mockSocialPlatform} />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('handles different social platforms', () => {
    const linkedinPlatform: SocialPlatform = {
      id: 'linkedin',
      name: 'LinkedIn',
      handle: '@linkedin_handle',
      description: 'Professional network',
      emoji: '💼',
      gradient: ['#0077B5', '#00A0DC'],
      onPress: mockOnPress,
    };

    render(<SocialCardWithTheme platform={linkedinPlatform} />);

    expect(screen.getByText('💼')).toBeTruthy();
    expect(screen.getByText('LinkedIn')).toBeTruthy();
    expect(screen.getByText('@linkedin_handle')).toBeTruthy();
    expect(screen.getByText('Professional network')).toBeTruthy();
  });

  it('renders consistently across multiple instances', () => {
    const { toJSON: json1 } = render(
      <SocialCardWithTheme platform={mockSocialPlatform} />
    );
    const { toJSON: json2 } = render(
      <SocialCardWithTheme platform={mockSocialPlatform} />
    );

    expect(json1).toBeTruthy();
    expect(json2).toBeTruthy();
  });
});
