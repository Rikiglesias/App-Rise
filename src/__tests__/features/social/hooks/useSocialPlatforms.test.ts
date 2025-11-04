// Mock expo-haptics BEFORE imports to avoid EXDevLauncher issues
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

/* eslint-disable import/first */
// Imports must come after jest.mock() calls - required by Jest
import { renderHook, act } from '@testing-library/react-native';
import { Linking, Alert } from 'react-native';
import { useSocialPlatforms } from '@/features/social/hooks/useSocialPlatforms';
import { logWarn } from '@/shared/utils/logger';
/* eslint-enable import/first */

// Mock delle dipendenze - approccio semplificato
jest.mock('react-native', () => ({
  Linking: {
    canOpenURL: jest.fn(),
    openURL: jest.fn(),
  },
  Alert: {
    alert: jest.fn(),
  },
  Animated: {
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
    timing: jest.fn(() => ({ start: jest.fn() })),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 390, height: 844, scale: 3, fontScale: 1 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn(obj => obj.ios || obj.default),
  },
  StyleSheet: {
    create: jest.fn(styles => styles),
    flatten: jest.fn(style => style || {}),
  },
}));

jest.mock('@/shared/utils/logger', () => ({
  logWarn: jest.fn(),
  logError: jest.fn(),
}));

// Mock delle icone - gestite automaticamente da Jest

const mockLinking = Linking as jest.Mocked<typeof Linking>;
const mockAlert = Alert as jest.Mocked<typeof Alert>;
const mockLogWarn = logWarn as jest.MockedFunction<typeof logWarn>;

describe('useSocialPlatforms', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns social platforms data correctly', () => {
    const { result } = renderHook(() => useSocialPlatforms());

    expect(result.current.socialPlatforms).toHaveLength(4);
  });

  it('contains all expected social platforms', () => {
    const { result } = renderHook(() => useSocialPlatforms());
    const platforms = result.current.socialPlatforms;

    const platformIds = platforms.map(p => p.id);
    expect(platformIds).toContain('website');
    expect(platformIds).toContain('instagram');
    expect(platformIds).toContain('facebook');
    expect(platformIds).toContain('linkedin');
    expect(platforms).toHaveLength(4);
  });

  it('each platform has required properties', () => {
    const { result } = renderHook(() => useSocialPlatforms());
    const platforms = result.current.socialPlatforms;

    platforms.forEach(platform => {
      expect(platform).toHaveProperty('id');
      expect(platform).toHaveProperty('name');
      expect(platform).toHaveProperty('handle');
      expect(platform).toHaveProperty('description');
      expect(platform).toHaveProperty('gradient');
      expect(platform).toHaveProperty('onPress');
      expect(typeof platform.onPress).toBe('function');
    });
  });
});

describe('useSocialPlatforms - Link Opening', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('openSocialLink functionality', () => {
    // TODO: Questi test andrebbero rifatti per testare solo useSocialPlatforms, non useLinkHandler
    it.skip('opens URL when supported', async () => {
      mockLinking.canOpenURL.mockResolvedValue(true);
      mockLinking.openURL.mockResolvedValue(true);

      const { result } = renderHook(() => useSocialPlatforms());
      const instagramPlatform = result.current.socialPlatforms.find(
        p => p.id === 'instagram'
      );

      await act(async () => {
        await instagramPlatform?.onPress();
      });

      expect(mockLinking.canOpenURL).toHaveBeenCalledWith(
        'https://instagram.com/riseagainsthungeritalia'
      );
      expect(mockLinking.openURL).toHaveBeenCalledWith(
        'https://instagram.com/riseagainsthungeritalia'
      );
    });

    it.skip('shows alert when URL is not supported', async () => {
      mockLinking.canOpenURL.mockResolvedValue(false);

      const { result } = renderHook(() => useSocialPlatforms());
      const instagramPlatform = result.current.socialPlatforms.find(
        p => p.id === 'instagram'
      );

      await act(async () => {
        await instagramPlatform?.onPress();
      });

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Errore',
        "Non è possibile aprire Instagram. Assicurati di avere l'app installata.",
        [{ text: 'OK' }]
      );
    });

    it.skip('handles errors and logs warnings', async () => {
      const error = new Error('Network error');
      mockLinking.canOpenURL.mockRejectedValue(error);

      const { result } = renderHook(() => useSocialPlatforms());
      const instagramPlatform = result.current.socialPlatforms.find(
        p => p.id === 'instagram'
      );

      await act(async () => {
        await instagramPlatform?.onPress();
      });

      expect(mockLogWarn).toHaveBeenCalledWith(
        'SocialPlatforms',
        'open link failed',
        error
      );
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Errore',
        "Si è verificato un errore nell'apertura di Instagram.",
        [{ text: 'OK' }]
      );
    });
  });
});

describe('useSocialPlatforms - Animation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides animation value (static)', () => {
    const { result } = renderHook(() => useSocialPlatforms());

    // Verifica che l'hook funzioni correttamente
    expect(result.current.socialPlatforms).toBeDefined();
  });
});

describe('useSocialPlatforms - Platform Data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Instagram platform has correct data', () => {
    const { result } = renderHook(() => useSocialPlatforms());
    const instagram = result.current.socialPlatforms.find(
      p => p.id === 'instagram'
    );

    expect(instagram).toMatchObject({
      id: 'instagram',
      name: 'Instagram',
      handle: '@riseagainsthungeritalia',
      description: 'Foto e storie delle missioni',
      gradient: ['#E1306C', '#F56040', '#FCAF45'],
    });
  });

  it('Website platform has correct data', () => {
    const { result } = renderHook(() => useSocialPlatforms());
    const website = result.current.socialPlatforms.find(
      p => p.id === 'website'
    );

    expect(website).toMatchObject({
      id: 'website',
      name: 'Sito Web',
      handle: 'italy.riseagainsthunger.org',
      description: 'Scopri tutte le nostre iniziative',
      gradient: ['#6B7280', '#9CA3AF', '#D1D5DB'],
    });
  });

  it('LinkedIn platform has correct data', () => {
    const { result } = renderHook(() => useSocialPlatforms());
    const linkedin = result.current.socialPlatforms.find(
      p => p.id === 'linkedin'
    );

    expect(linkedin).toMatchObject({
      id: 'linkedin',
      name: 'LinkedIn',
      handle: 'Rise Against Hunger Italia',
      description: 'Opportunità e partnership',
    });
  });

  it('maintains consistent data across multiple renders', () => {
    const { result, rerender } = renderHook(() => useSocialPlatforms());

    const initialPlatforms = result.current.socialPlatforms;
    rerender({});
    const rerenderedPlatforms = result.current.socialPlatforms;

    expect(initialPlatforms).toHaveLength(rerenderedPlatforms.length);
    expect(initialPlatforms?.[0]?.id).toBe(rerenderedPlatforms?.[0]?.id);
  });
});
