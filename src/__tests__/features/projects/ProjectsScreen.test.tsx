import ProjectsScreen from '../../../features/projects/screens/ProjectsScreen';

describe('ProjectsScreen', () => {
  it('should be exported as a module', () => {
    expect(ProjectsScreen).toBeDefined();
  });

  it('should be a valid React component type', () => {
    expect(ProjectsScreen).toBeTruthy();
    expect(typeof ProjectsScreen).toBe('object'); // React.memo returns object
  });

  it('should have the expected module structure', () => {
    expect(ProjectsScreen).not.toBeNull();
  });
});
