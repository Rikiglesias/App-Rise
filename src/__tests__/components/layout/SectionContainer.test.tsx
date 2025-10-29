import SectionContainer from '../../../components/layout/SectionContainer';

describe('SectionContainer', () => {
  it('should be exported as a module', () => {
    expect(SectionContainer).toBeDefined();
  });

  it('should be a valid component', () => {
    expect(SectionContainer).toBeTruthy();
  });

  it('should be valid React component', () => {
    expect(typeof SectionContainer).toBe('function');
  });
});
