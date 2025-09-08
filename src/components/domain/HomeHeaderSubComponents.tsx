/**
 * HOME HEADER SUB COMPONENTS - MODULARIZED
 *
 * ⚠️  DEPRECATION NOTICE: This file is now a compatibility layer.
 * The actual components have been modularized into separate files:
 * - src/components/domain/HomeHeader/HeaderTextSection.tsx
 * - src/components/domain/HomeHeader/HeaderImageSection.tsx
 * - src/components/domain/HomeHeader/HeaderMissionSection.tsx
 * - src/components/domain/HomeHeader/MissionStatsSection.tsx
 * - src/components/domain/HomeHeader/MealsBreakdownModal.tsx
 *
 * Please import from 'src/components/domain/HomeHeader' instead.
 */

// Re-export everything from the modular system for backward compatibility
export {
  HeaderTextSection,
  HeaderImageSection,
  HeaderMissionSection,
  MissionStatsSection,
  MealsBreakdownModal,
} from './HomeHeader';
