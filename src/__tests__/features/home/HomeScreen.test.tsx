import HomeScreen from '../../../features/home/screens/HomeScreen';

describe('HomeScreen', () => {
  it('should be exported as a module', () => {
    expect(HomeScreen).toBeDefined();
  });

  it('should be a valid React component type', () => {
    expect(HomeScreen).toBeTruthy();
    expect(typeof HomeScreen).toBe('object'); // React.memo returns object
  });

  it('should have the expected module structure', () => {
    expect(HomeScreen).not.toBeNull();
  });
});
