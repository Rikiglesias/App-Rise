/**
 * DEVICE RESOLUTIONS DATABASE - MODULARIZED
 *
 * ⚠️  DEPRECATION NOTICE: This file is now a compatibility layer.
 * The actual device database has been modularized into separate files:
 * - src/shared/constants/devices/apple.ts
 * - src/shared/constants/devices/samsung.ts
 * - src/shared/constants/devices/google.ts
 * - src/shared/constants/devices/chinese-brands.ts
 * - src/shared/constants/devices/special-categories.ts
 *
 * Please import from 'src/shared/constants/devices' instead.
 */

// Import and re-export everything for backward compatibility
import AllMobileDevicesDefault, {
  DeviceSpecs,
  AppleDevices,
  AppleTablets,
  SamsungDevices,
  SamsungTablets,
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
  AllFoldableDevices,
  EntryLevelDevices,
  SonyDevices,
  MotorolaDevices,
  NokiaDevices,
  MostPopularDevices,
  GlobalStats,
  calculateMillimetricFontSize,
  findDeviceByWidth,
  findDeviceByModel,
  findDevicesByBrand,
  getMillimetricFontSize,
  getDevicesByCategory,
  getAllDevicesFlat,
  getDatabaseStats,
} from './devices';

// Re-export all items
export {
  DeviceSpecs,
  AppleDevices,
  AppleTablets,
  SamsungDevices,
  SamsungTablets,
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
  EntryLevelDevices,
  SonyDevices,
  MotorolaDevices,
  NokiaDevices,
  MostPopularDevices,
  GlobalStats,
  calculateMillimetricFontSize,
  findDeviceByWidth,
  findDeviceByModel,
  findDevicesByBrand,
  getMillimetricFontSize,
  getDevicesByCategory,
  getAllDevicesFlat,
  getDatabaseStats,
};

// Legacy alias exports
export { AllFoldableDevices as FoldableDevices };
export { AllMobileDevicesDefault as AllMobileDevices };

// Default export for backward compatibility
export default AllMobileDevicesDefault;
