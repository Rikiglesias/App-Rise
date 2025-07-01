import { renderHook, act } from '@testing-library/react-native';
import { useAppStore } from '../../stores/appStore';

describe('AppStore - Initial State', () => {
  it('should have correct initial state', () => {
    const { result } = renderHook(() => useAppStore());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeNull();
  });

  it('should have all required actions', () => {
    const { result } = renderHook(() => useAppStore());

    expect(typeof result.current.setLoading).toBe('function');
    expect(typeof result.current.setError).toBe('function');
    expect(typeof result.current.setLastUpdated).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });
});

describe('AppStore - Loading State Management', () => {
  it('should set loading state to true', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should set loading state to false', () => {
    const { result } = renderHook(() => useAppStore());

    // First set to true
    act(() => {
      result.current.setLoading(true);
    });

    // Then set to false
    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should toggle loading state multiple times', () => {
    const { result } = renderHook(() => useAppStore());

    // Initial state
    expect(result.current.isLoading).toBe(false);

    // Toggle to true
    act(() => {
      result.current.setLoading(true);
    });
    expect(result.current.isLoading).toBe(true);

    // Toggle to false
    act(() => {
      result.current.setLoading(false);
    });
    expect(result.current.isLoading).toBe(false);

    // Toggle to true again
    act(() => {
      result.current.setLoading(true);
    });
    expect(result.current.isLoading).toBe(true);
  });
});

describe('AppStore - Error State Management', () => {
  it('should set error message', () => {
    const { result } = renderHook(() => useAppStore());
    const errorMessage = 'Network connection failed';

    act(() => {
      result.current.setError(errorMessage);
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should set error to null', () => {
    const { result } = renderHook(() => useAppStore());

    // First set an error
    act(() => {
      result.current.setError('Some error');
    });

    // Then set to null
    act(() => {
      result.current.setError(null);
    });

    expect(result.current.error).toBeNull();
  });

  it('should clear error using clearError action', () => {
    const { result } = renderHook(() => useAppStore());

    // Set an error first
    act(() => {
      result.current.setError('Test error message');
    });
    expect(result.current.error).toBe('Test error message');

    // Clear the error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle different error messages', () => {
    const { result } = renderHook(() => useAppStore());

    const errors = [
      'Network timeout',
      'Invalid credentials',
      'Server unavailable',
      'Permission denied',
    ];

    errors.forEach(errorMsg => {
      act(() => {
        result.current.setError(errorMsg);
      });
      expect(result.current.error).toBe(errorMsg);
    });
  });

  it('should handle empty string error', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setError('');
    });

    expect(result.current.error).toBe('');
  });
});

describe('AppStore - Last Updated Management', () => {
  it('should set last updated timestamp', () => {
    const { result } = renderHook(() => useAppStore());
    const timestamp = '2024-01-01T12:00:00.000Z';

    act(() => {
      result.current.setLastUpdated(timestamp);
    });

    expect(result.current.lastUpdated).toBe(timestamp);
  });

  it('should update timestamp multiple times', () => {
    const { result } = renderHook(() => useAppStore());

    const timestamp1 = '2024-01-01T12:00:00.000Z';
    const timestamp2 = '2024-01-01T13:00:00.000Z';

    act(() => {
      result.current.setLastUpdated(timestamp1);
    });
    expect(result.current.lastUpdated).toBe(timestamp1);

    act(() => {
      result.current.setLastUpdated(timestamp2);
    });
    expect(result.current.lastUpdated).toBe(timestamp2);
  });

  it('should handle different timestamp formats', () => {
    const { result } = renderHook(() => useAppStore());

    const timestamps = [
      new Date().toISOString(),
      '2024-06-15T10:30:45.123Z',
      Date.now().toString(),
      '1640995200000', // Unix timestamp as string
    ];

    timestamps.forEach(timestamp => {
      act(() => {
        result.current.setLastUpdated(timestamp);
      });
      expect(result.current.lastUpdated).toBe(timestamp);
    });
  });
});

describe('AppStore - Complex State Interactions', () => {
  it('should handle loading and error states together', () => {
    const { result } = renderHook(() => useAppStore());

    // Simulate loading start
    act(() => {
      result.current.setLoading(true);
      result.current.clearError();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();

    // Simulate error during loading
    act(() => {
      result.current.setLoading(false);
      result.current.setError('Loading failed');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Loading failed');
  });

  it('should handle successful data load flow', () => {
    const { result } = renderHook(() => useAppStore());
    const timestamp = new Date().toISOString();

    // Start loading
    act(() => {
      result.current.setLoading(true);
      result.current.clearError();
    });

    // Complete successfully
    act(() => {
      result.current.setLoading(false);
      result.current.setLastUpdated(timestamp);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBe(timestamp);
  });

  it('should handle retry after error', () => {
    const { result } = renderHook(() => useAppStore());

    // Initial error
    act(() => {
      result.current.setError('First attempt failed');
    });

    // Retry - clear error and start loading
    act(() => {
      result.current.clearError();
      result.current.setLoading(true);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(true);

    // Successful retry
    act(() => {
      result.current.setLoading(false);
      result.current.setLastUpdated(new Date().toISOString());
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeTruthy();
  });
});

describe('AppStore - State Persistence', () => {
  it('should maintain state across multiple hook calls', () => {
    // First hook instance
    const { result: result1 } = renderHook(() => useAppStore());

    act(() => {
      result1.current.setLoading(true);
      result1.current.setError('Test error');
    });

    // Second hook instance should have same state
    const { result: result2 } = renderHook(() => useAppStore());

    expect(result2.current.isLoading).toBe(true);
    expect(result2.current.error).toBe('Test error');
  });

  it('should sync state changes across multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useAppStore());
    const { result: result2 } = renderHook(() => useAppStore());

    // Change state from first instance
    act(() => {
      result1.current.setLoading(true);
    });

    // Both instances should reflect the change
    expect(result1.current.isLoading).toBe(true);
    expect(result2.current.isLoading).toBe(true);

    // Change state from second instance
    act(() => {
      result2.current.setError('Sync test');
    });

    // Both instances should reflect the change
    expect(result1.current.error).toBe('Sync test');
    expect(result2.current.error).toBe('Sync test');
  });
});
