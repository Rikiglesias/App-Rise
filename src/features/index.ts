//===================================================================
// FEATURES - Central Export Hub
//===================================================================

// Home Feature
export { HomeScreen, HomeScreenDefault } from './home';
export { EntraInAzione } from './home';

// Impact Feature
export {
  ImpactHeader,
  TotalMealsSection,
  Results2024Section,
  CommunitySection,
  MapSection,
} from './impact';
export { useImpactAnimations, convertToMapLocations } from './impact';

// Actions Feature
export { ContributeTabScreen } from './actions';

// Social Feature
export { SeguiciScreen } from './social';

// About Feature
export { ChiSiamoScreen } from './about';
export {
  AnimatedContact,
  ChiSiamoSection,
  ContactSection,
  StoriaModal,
} from './about';

// Projects Feature
export { ProjectsScreen, useProjectsScreenLogic } from './projects';
export type {
  Project,
  ProjectsScreenProps,
  ProjectsScreenLogicReturn,
  ProjectTab,
  ProjectStats,
} from './projects';
