import { act, renderHook } from '@testing-library/react-native';

import { useProjectsStore } from '../../stores/projectsStore';

const createMockProject = (id: string, title?: string) => ({
  id,
  title: title ?? 'Test Project',
  location: 'Test Location',
  description: 'Test description',
  impact: 'Test impact',
  status: 'active' as const,
  progress: 50,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
});

const resetStore = () => {
  const { result } = renderHook(() => useProjectsStore());
  act(() => {
    result.current.setProjects([]);
    result.current.selectProject(null);
    result.current.clearError();
  });
};

describe('ProjectsStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('should initialize with empty projects', () => {
    const { result } = renderHook(() => useProjectsStore());

    expect(result.current.projects).toEqual([]);
    expect(result.current.selectedProject).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should add a project', () => {
    const { result } = renderHook(() => useProjectsStore());
    const newProject = createMockProject('1');

    act(() => {
      result.current.addProject(newProject);
    });

    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0]).toEqual(newProject);
  });

  it('should update a project', () => {
    const { result } = renderHook(() => useProjectsStore());
    const project = createMockProject('1', 'Original Title');

    act(() => {
      result.current.addProject(project);
      result.current.updateProject('1', {
        title: 'Updated Title',
        progress: 75,
      });
    });

    const updatedProject = result.current.projects[0];
    expect(updatedProject?.title).toBe('Updated Title');
    expect(updatedProject?.progress).toBe(75);
    expect(updatedProject?.updatedAt).not.toBe('2024-01-01');
  });

  it('should delete a project', () => {
    const { result } = renderHook(() => useProjectsStore());
    const project = createMockProject('1');

    act(() => {
      result.current.addProject(project);
      result.current.deleteProject('1');
    });

    expect(result.current.projects).toHaveLength(0);
  });

  it('should handle loading and error states', () => {
    const { result } = renderHook(() => useProjectsStore());
    const errorMessage = 'Test error';

    act(() => {
      result.current.setLoading(true);
      result.current.setError(errorMessage);
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(errorMessage);

    act(() => {
      result.current.setLoading(false);
      result.current.clearError();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
