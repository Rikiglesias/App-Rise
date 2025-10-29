import ProgressStat from '../../../components/ui/ProgressStat';

describe('ProgressStat', () => {
  it('should be exported as a module', () => {
    expect(ProgressStat).toBeDefined();
  });

  it('should be a valid component', () => {
    expect(ProgressStat).toBeTruthy();
  });

  it('should be valid React component', () => {
    expect(typeof ProgressStat).toBe('function');
  });
});
