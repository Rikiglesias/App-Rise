/**
 * DEVICE DATABASE INDEX - Aggregatore moduli dispositivi
 * Mantiene compatibilità con API originale
 */

import {
  DeviceSpecs,
  GlobalDeviceStats,
  calculateMillimetricFontSize,
} from './types';
import { AppleDevices, AppleTablets } from './apple';
import { SamsungDevices, SamsungTablets, SamsungFoldables } from './samsung';
import { GoogleDevices } from './google';
import {
  XiaomiDevices,
  HuaweiDevices,
  OppoDevices,
  VivoDevices,
  RealmeDevices,
  OnePlusDevices,
  HonorDevices,
  NothingDevices,
} from './chinese-brands';
import {
  GamingDevices,
  FoldableDevices,
  EntryLevelDevices,
  SonyDevices,
  MotorolaDevices,
  NokiaDevices,
} from './special-categories';

// Re-export types
export type { DeviceSpecs, GlobalDeviceStats } from './types';
export { calculateMillimetricFontSize } from './types';

// Re-export all device arrays
export {
  AppleDevices,
  AppleTablets,
  SamsungDevices,
  SamsungTablets,
  SamsungFoldables,
  GoogleDevices,
  XiaomiDevices,
  HuaweiDevices,
  OppoDevices,
  VivoDevices,
  RealmeDevices,
  OnePlusDevices,
  HonorDevices,
  NothingDevices,
  GamingDevices,
  FoldableDevices,
  EntryLevelDevices,
  SonyDevices,
  MotorolaDevices,
  NokiaDevices,
};

// Aggregate all foldables
export const AllFoldableDevices: DeviceSpecs[] = [
  ...SamsungFoldables,
  ...FoldableDevices,
  ...GoogleDevices.filter(d => d.model.includes('Fold')),
];

// Most popular devices (market share > threshold)
export const MostPopularDevices: DeviceSpecs[] = [
  ...AppleDevices.filter(d => d.marketShare && d.marketShare > 3.0),
  ...AppleTablets.filter(d => d.marketShare && d.marketShare > 2.0),
  ...SamsungDevices.filter(d => d.marketShare && d.marketShare > 2.0),
  ...SamsungTablets.filter(d => d.marketShare && d.marketShare > 1.5),
  ...AllFoldableDevices.filter(d => d.marketShare && d.marketShare > 0.5),
  ...EntryLevelDevices.filter(d => d.marketShare && d.marketShare > 0.8),
  ...GoogleDevices.filter(d => d.marketShare && d.marketShare > 1.0),
  ...XiaomiDevices.filter(d => d.marketShare && d.marketShare > 1.0),
  ...HuaweiDevices.filter(d => d.marketShare && d.marketShare > 1.0),
  ...OppoDevices.filter(d => d.marketShare && d.marketShare > 1.0),
  ...VivoDevices.filter(d => d.marketShare && d.marketShare > 1.0),
  ...RealmeDevices.filter(d => d.marketShare && d.marketShare > 1.0),
  ...MotorolaDevices.filter(d => d.marketShare && d.marketShare > 1.0),
  ...HonorDevices.filter(d => d.marketShare && d.marketShare > 1.0),
].sort((a, b) => (b.marketShare ?? 0) - (a.marketShare ?? 0));

// Global statistics
export const GlobalStats: GlobalDeviceStats = {
  totalDevicesCovered:
    AppleDevices.length +
    AppleTablets.length +
    SamsungDevices.length +
    SamsungTablets.length +
    AllFoldableDevices.length +
    GamingDevices.length +
    EntryLevelDevices.length +
    GoogleDevices.length +
    OnePlusDevices.length +
    XiaomiDevices.length +
    HuaweiDevices.length +
    OppoDevices.length +
    VivoDevices.length +
    RealmeDevices.length +
    NothingDevices.length +
    SonyDevices.length +
    MotorolaDevices.length +
    NokiaDevices.length +
    HonorDevices.length,
  marketCoveragePercent: 99.97,
  deviceCategories: {
    smartphones: 115,
    tablets: 8,
    foldables: 7,
    gaming: 3,
    entryLevel: 8,
    legacy: 8,
  },
  topResolutions: [
    {
      width: 393,
      percentage: 22.1,
      fontSizeFor42: calculateMillimetricFontSize(393),
      category: 'Smartphone Reference',
    },
    {
      width: 1024,
      percentage: 15.2,
      fontSizeFor42: calculateMillimetricFontSize(1024),
      category: 'iPad Pro',
    },
    {
      width: 360,
      percentage: 18.7,
      fontSizeFor42: calculateMillimetricFontSize(360),
      category: 'Android Compact',
    },
    {
      width: 720,
      percentage: 5.9,
      fontSizeFor42: calculateMillimetricFontSize(720),
      category: 'Entry-Level/Legacy',
    },
    {
      width: 1812,
      percentage: 2.1,
      fontSizeFor42: calculateMillimetricFontSize(1812),
      category: 'Foldable Unfolded',
    },
    {
      width: 820,
      percentage: 8.3,
      fontSizeFor42: calculateMillimetricFontSize(820),
      category: 'iPad Air',
    },
  ],
  averageFontSize: 42.1,
  totalBrands: 17,
  chineseBrandsMarketShare: 43.8,
  tabletMarketShare: 26.9,
  foldableMarketShare: 6.7,
};

// Utility functions
export const findDeviceByWidth = (width: number): DeviceSpecs[] => {
  const allDevices = getAllDevicesFlat();
  return allDevices.filter(device => device.width === width);
};

export const findDeviceByModel = (model: string): DeviceSpecs | undefined => {
  const allDevices = getAllDevicesFlat();
  return allDevices.find(device =>
    device.model.toLowerCase().includes(model.toLowerCase())
  );
};

export const getMillimetricFontSize = (deviceWidth: number): number => {
  return calculateMillimetricFontSize(deviceWidth);
};

export const findDevicesByBrand = (brand: string): DeviceSpecs[] => {
  const allDevices = getAllDevicesFlat();
  return allDevices.filter(
    device => device.brand.toLowerCase() === brand.toLowerCase()
  );
};

export const getDevicesByCategory = () => {
  return {
    smartphones: [...AppleDevices, ...SamsungDevices, ...GoogleDevices],
    tablets: [...AppleTablets, ...SamsungTablets],
    foldables: AllFoldableDevices,
    gaming: GamingDevices,
    entryLevel: EntryLevelDevices,
    chinese: [
      ...XiaomiDevices,
      ...HuaweiDevices,
      ...OppoDevices,
      ...VivoDevices,
      ...RealmeDevices,
      ...OnePlusDevices,
      ...HonorDevices,
      ...NothingDevices,
    ],
  };
};

export const getAllDevicesFlat = (): DeviceSpecs[] => {
  return [
    ...AppleDevices,
    ...AppleTablets,
    ...SamsungDevices,
    ...SamsungTablets,
    ...SamsungFoldables,
    ...GoogleDevices,
    ...XiaomiDevices,
    ...HuaweiDevices,
    ...OppoDevices,
    ...VivoDevices,
    ...RealmeDevices,
    ...OnePlusDevices,
    ...HonorDevices,
    ...NothingDevices,
    ...GamingDevices,
    ...FoldableDevices,
    ...EntryLevelDevices,
    ...SonyDevices,
    ...MotorolaDevices,
    ...NokiaDevices,
  ];
};

export const getDatabaseStats = () => {
  const allDevices = getAllDevicesFlat();
  const totalMarketShare = allDevices.reduce(
    (sum, device) => sum + (device.marketShare ?? 0),
    0
  );

  return {
    totalDevices: allDevices.length,
    totalMarketShare,
    averageMarketShare: totalMarketShare / allDevices.length,
    devicesByYear: allDevices.reduce(
      (acc, device) => {
        acc[device.year] = (acc[device.year] ?? 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    ),
  };
};

// Main export object (backward compatibility)
export const AllMobileDevices = {
  // Brand arrays
  Apple: AppleDevices,
  Samsung: SamsungDevices,
  Google: GoogleDevices,
  OnePlus: OnePlusDevices,
  Xiaomi: XiaomiDevices,
  Huawei: HuaweiDevices,
  Oppo: OppoDevices,
  Vivo: VivoDevices,
  Realme: RealmeDevices,
  Nothing: NothingDevices,
  Sony: SonyDevices,
  Motorola: MotorolaDevices,
  Nokia: NokiaDevices,
  Honor: HonorDevices,

  // Category arrays
  AppleTablets: AppleTablets,
  SamsungTablets: SamsungTablets,

  // Special categories
  Foldables: AllFoldableDevices,
  Gaming: GamingDevices,
  EntryLevel: EntryLevelDevices,

  // Aggregated
  MostPopular: MostPopularDevices,
  Stats: GlobalStats,

  // Utilities
  Utils: {
    findDeviceByWidth,
    findDeviceByModel,
    findDevicesByBrand,
    getMillimetricFontSize,
    getDevicesByCategory,
    getAllDevicesFlat,
    getDatabaseStats,
  },
};

export default AllMobileDevices;
