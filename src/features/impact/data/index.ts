// ===================================================================
// DATA - Central Export Hub
// ===================================================================

// Locations Data (Single Source of Truth)
export { LOCATIONS_DATA, type LocationData } from './locationsData';

// Impact Data
export {
  IMPACT_DATA,
  MAP_LOCATIONS, // Re-export di LOCATIONS_DATA
  formatNumber, // Re-export da shared/utils
} from './impactData';

// Map Modal Data
export {
  MAP_MODAL_DATA, // Generato da LOCATIONS_DATA
  getModalData,
  formatStat, // Re-export da shared/utils
  type MapModalData,
} from './mapModalData';

// Number Formatters (centralizzati)
export {
  formatNumber as formatNumberUtil,
  formatNumberCompact,
  formatStat as formatStatUtil,
} from '@/shared/utils/numberFormat';
