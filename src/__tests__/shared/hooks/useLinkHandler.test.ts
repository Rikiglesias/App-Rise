import { renderHook } from '@testing-library/react-native';
import { useLinkHandler } from '../../../shared/hooks/useLinkHandler';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
}));

describe('useLinkHandler', () => {
  it('should return link handler object', () => {
    const { result } = renderHook(() => useLinkHandler());
    
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });

  it('should have openLink method', () => {
    const { result } = renderHook(() => useLinkHandler());
    
    expect(result.current.openLink).toBeDefined();
  });

  it('should have openWebsiteLink method', () => {
    const { result } = renderHook(() => useLinkHandler());
    
    expect(result.current.openWebsiteLink).toBeDefined();
  });

  it('should return valid handler with multiple link methods', () => {
    const { result } = renderHook(() => useLinkHandler());
    
    expect(result.current).toHaveProperty('openLink');
    expect(result.current).toHaveProperty('openWebsiteLink');
  });
});
