// Mock expo-haptics BEFORE imports to avoid EXDevLauncher issues
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

/* eslint-disable import/first */
// Imports must come after jest.mock() calls - required by Jest
import { renderHook, act } from '@testing-library/react-native';
import { useSocialPlatforms } from '@/features/social/useSocialPlatforms';
import { logWarn } from '@/shared/utils/logger';
import i18n from '@/locales';
/* eslint-enable import/first */

// Forza lingua italiana per i test
i18n.locale = 'it';

// Mock delle dipendenze - approccio semplificato
jest.mock('react-native', () => ({
  // useTranslation rilegge la lingua al ritorno in primo piano (C46).
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
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

const mockLinkHandler = {
  openWebsiteLink: jest.fn(),
  openInstagramLink: jest.fn(),
  openFacebookLink: jest.fn(),
  openYouTubeLink: jest.fn(),
  openLinkedInLink: jest.fn(),
};
jest.mock('@/shared/hooks/useLinkHandler', () => ({
  useLinkHandler: () => mockLinkHandler,
}));

const mockLogWarn = logWarn as jest.MockedFunction<typeof logWarn>;

describe('useSocialPlatforms', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns social platforms data correctly', () => {
    const { result } = renderHook(() => useSocialPlatforms());

    expect(result.current.socialPlatforms).toHaveLength(5);
  });

  it('contains all expected social platforms', () => {
    const { result } = renderHook(() => useSocialPlatforms());
    const platforms = result.current.socialPlatforms;

    const platformIds = platforms.map(p => p.id);
    expect(platformIds).toContain('website');
    expect(platformIds).toContain('instagram');
    expect(platformIds).toContain('facebook');
    expect(platformIds).toContain('youtube');
    expect(platformIds).toContain('linkedin');
    expect(platforms).toHaveLength(5);
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

// Apertura dei link: qui si prova solo ciò che questo hook decide — quale apertura parte da
// ogni scheda e che un errore non esca dal tocco. Indirizzi, allowlist e avviso quando il link
// non si apre sono di `useLinkHandler` e stanno nei suoi test (`useLinkHandler.test.ts`).
describe('useSocialPlatforms - Link Opening', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    for (const fn of Object.values(mockLinkHandler))
      fn.mockResolvedValue(undefined);
  });

  it.each([
    ['website', 'openWebsiteLink'],
    ['instagram', 'openInstagramLink'],
    ['facebook', 'openFacebookLink'],
    ['youtube', 'openYouTubeLink'],
    ['linkedin', 'openLinkedInLink'],
  ] as const)(
    'la scheda %s apre solo il suo link (%s)',
    async (id, apertura) => {
      const { result } = renderHook(() => useSocialPlatforms());
      const scheda = result.current.socialPlatforms.find(p => p.id === id);

      await act(async () => {
        await scheda?.onPress();
      });

      expect(mockLinkHandler[apertura]).toHaveBeenCalledTimes(1);
      for (const [nome, fn] of Object.entries(mockLinkHandler))
        if (nome !== apertura) expect(fn).not.toHaveBeenCalled();
    }
  );

  it("un'apertura che fallisce non esce dal tocco e resta nel log", async () => {
    const error = new Error('Network error');
    mockLinkHandler.openInstagramLink.mockRejectedValue(error);
    const { result } = renderHook(() => useSocialPlatforms());
    const instagram = result.current.socialPlatforms.find(
      p => p.id === 'instagram'
    );

    await act(async () => {
      await expect(instagram?.onPress()).resolves.toBeUndefined();
    });

    expect(mockLogWarn).toHaveBeenCalledWith(
      'open link failed',
      'SocialPlatforms',
      error
    );
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
