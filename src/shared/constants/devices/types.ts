/**
 * DEVICE TYPES - Tipi condivisi per database dispositivi
 * Modularizzazione del deviceResolutionsDatabase.ts
 */

export interface DeviceSpecs {
  brand: string;
  model: string;
  width: number;
  height: number;
  scaleFactor: number;
  calculatedFontSize: number;
  year: number;
  marketShare?: number;
}

export const calculateMillimetricFontSize = (width: number): number => {
  const referenceWidth = 393; // iPhone 15 reale
  let scale = width / referenceWidth;
  if (scale < 0.85) scale = 0.85;
  if (scale > 1.4) scale = 1.4;
  return 42 * scale;
};

export type DeviceCategory =
  | 'smartphones'
  | 'tablets'
  | 'foldables'
  | 'gaming'
  | 'entryLevel'
  | 'legacy';

export interface DeviceCategoryStats {
  smartphones: number;
  tablets: number;
  foldables: number;
  gaming: number;
  entryLevel: number;
  legacy: number;
}

export interface ResolutionStats {
  width: number;
  percentage: number;
  fontSizeFor42: number;
  category: string;
}

export interface GlobalDeviceStats {
  totalDevicesCovered: number;
  marketCoveragePercent: number;
  deviceCategories: DeviceCategoryStats;
  topResolutions: ResolutionStats[];
  averageFontSize: number;
  totalBrands: number;
  chineseBrandsMarketShare: number;
  tabletMarketShare: number;
  foldableMarketShare: number;
}
