import { render, screen } from '@testing-library/react-native';

import { ProjectCard } from '../../components/ProjectCard';
import type { ProjectCardProps } from '../../components/ProjectCard/types';
import { ThemeProvider } from '../../shared/hooks/useTheme';

const mockProject: ProjectCardProps = {
  title: 'Test Project',
  location: 'Test Location',
  description: 'Test description',
  impact: 'Test impact',
  status: 'active',
  progress: 75,
  onPress: jest.fn(),
};

const ProjectCardWithTheme = (props: ProjectCardProps) => (
  <ThemeProvider>
    <ProjectCard {...props} />
  </ThemeProvider>
);

describe('ProjectCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders project information correctly', () => {
    render(<ProjectCardWithTheme {...mockProject} />);

    expect(screen.getByText('Test Project')).toBeTruthy();
    expect(screen.getByText('Test Location')).toBeTruthy();
    expect(screen.getByText('Test description')).toBeTruthy();
    expect(screen.getByText('Test impact')).toBeTruthy();
  });

  it('shows progress when provided', () => {
    render(<ProjectCardWithTheme {...mockProject} />);

    expect(screen.getByText('Progresso: 75%')).toBeTruthy();
  });

  it('hides progress when not provided', () => {
    const projectWithoutProgress = { ...mockProject, progress: undefined };
    render(<ProjectCardWithTheme {...projectWithoutProgress} />);

    expect(screen.queryByText(/Progresso:/)).toBeNull();
  });

  it('shows correct status for active project', () => {
    render(<ProjectCardWithTheme {...mockProject} />);

    expect(screen.getByText('In Corso')).toBeTruthy();
  });

  it('shows correct status for completed project', () => {
    const completedProject = { ...mockProject, status: 'completed' as const };
    render(<ProjectCardWithTheme {...completedProject} />);

    expect(screen.getByText('Completato')).toBeTruthy();
  });

  it('shows correct status for upcoming project', () => {
    const upcomingProject = { ...mockProject, status: 'upcoming' as const };
    render(<ProjectCardWithTheme {...upcomingProject} />);

    expect(screen.getByText('Prossimo')).toBeTruthy();
  });
});
