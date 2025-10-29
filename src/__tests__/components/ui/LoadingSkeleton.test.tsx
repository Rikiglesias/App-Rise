import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('should be exported as a module', () => {
    expect(LoadingSkeleton).toBeDefined();
  });

  it('should be a valid component', () => {
    expect(LoadingSkeleton).toBeTruthy();
    expect(typeof LoadingSkeleton).toBe('object');
  });

  it('should have expected structure', () => {
    expect(LoadingSkeleton).not.toBeNull();
  });
});
