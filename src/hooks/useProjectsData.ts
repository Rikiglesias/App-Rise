interface Project {
  id: string;
  title: string;
  location: string;
  description: string;
  impact: string;
  status: 'active' | 'completed' | 'upcoming';
  progress?: number;
  category: 'nutrition' | 'education' | 'emergency' | 'infrastructure';
  startDate: string;
  endDate?: string;
  beneficiaries: number;
  imageUrl?: string;
}

export const useProjectsData = () => {
  const projects: Project[] = [
    {
      id: '1',
      title: 'Alimentazione Scolastica Kenya',
      location: 'Nairobi, Kenya',
      description:
        'Programma di alimentazione scolastica per fornire pasti nutritivi a 2.500 bambini delle scuole primarie nei quartieri più poveri di Nairobi.',
      impact: "12.000 bambini nutriti quest'anno",
      status: 'active',
      progress: 78,
      category: 'nutrition',
      startDate: '2024-01-15',
      endDate: '2025-12-31',
      beneficiaries: 2500,
    },
    {
      id: '2',
      title: 'Emergenza Bangladesh',
      location: 'Dhaka, Bangladesh',
      description:
        'Risposta di emergenza alle alluvioni che hanno colpito il Bangladesh, fornendo kit alimentari di emergenza alle famiglie sfollate.',
      impact: '8.500 famiglie supportate con kit di emergenza',
      status: 'completed',
      progress: 100,
      category: 'emergency',
      startDate: '2024-06-01',
      endDate: '2024-09-30',
      beneficiaries: 8500,
    },
    {
      id: '3',
      title: 'Centro Nutrizionale Guatemala',
      location: 'Ciudad de Guatemala, Guatemala',
      description:
        'Costruzione e gestione di un centro nutrizionale per madri e bambini malnutriti nelle comunità rurali del Guatemala.',
      impact: '1.200 bambini sotto i 5 anni seguiti',
      status: 'active',
      progress: 45,
      category: 'infrastructure',
      startDate: '2024-03-01',
      endDate: '2025-06-30',
      beneficiaries: 1200,
    },
    {
      id: '4',
      title: 'Educazione Nutrizionale India',
      location: 'Mumbai, India',
      description:
        'Programma educativo per insegnare alle comunità locali pratiche nutrizionali sostenibili e coltivazione di orti comunitari.',
      impact: '500 famiglie formate su nutrizione sostenibile',
      status: 'active',
      progress: 62,
      category: 'education',
      startDate: '2024-02-01',
      endDate: '2024-12-31',
      beneficiaries: 500,
    },
    {
      id: '5',
      title: 'Supporto Rifugiati Siria',
      location: 'Amman, Giordania',
      description:
        'Programma di assistenza alimentare per i rifugiati siriani nei campi profughi in Giordania, in collaborazione con UNHCR.',
      impact: '15.000 rifugiati assistiti quotidianamente',
      status: 'active',
      progress: 85,
      category: 'emergency',
      startDate: '2023-09-01',
      endDate: '2025-03-31',
      beneficiaries: 15000,
    },
    {
      id: '6',
      title: 'Agricoltura Sostenibile Etiopia',
      location: 'Addis Abeba, Etiopia',
      description:
        'Progetto pilota per introdurre tecniche di agricoltura sostenibile e resistente alla siccità nelle comunità rurali.',
      impact: 'Formazione di 800 agricoltori su tecniche sostenibili',
      status: 'upcoming',
      category: 'education',
      startDate: '2025-01-15',
      endDate: '2026-01-15',
      beneficiaries: 800,
    },
  ];

  const getProjectsByStatus = (status: Project['status']) => {
    return projects.filter(project => project.status === status);
  };

  const getProjectsByCategory = (category: Project['category']) => {
    return projects.filter(project => project.category === category);
  };

  const getActiveProjects = () => getProjectsByStatus('active');
  const getCompletedProjects = () => getProjectsByStatus('completed');
  const getUpcomingProjects = () => getProjectsByStatus('upcoming');

  const getTotalBeneficiaries = () => {
    return projects.reduce(
      (total, project) => total + project.beneficiaries,
      0
    );
  };

  const getProjectStats = () => {
    return {
      total: projects.length,
      active: getActiveProjects().length,
      completed: getCompletedProjects().length,
      upcoming: getUpcomingProjects().length,
      totalBeneficiaries: getTotalBeneficiaries(),
    };
  };

  return {
    projects,
    getProjectsByStatus,
    getProjectsByCategory,
    getActiveProjects,
    getCompletedProjects,
    getUpcomingProjects,
    getTotalBeneficiaries,
    getProjectStats,
  };
};
