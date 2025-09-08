/**
 * CHINESE BRANDS DEVICES - Database dispositivi brand cinesi
 * Xiaomi, Huawei, Oppo, Vivo, Realme, OnePlus, Honor, Nothing
 */

import { DeviceSpecs, calculateMillimetricFontSize } from './types';

// 📱 XIAOMI DEVICES
export const XiaomiDevices: DeviceSpecs[] = [
  {
    brand: 'Xiaomi',
    model: 'Mi 14 Ultra',
    width: 384,
    height: 824,
    scaleFactor: 384 / 393,
    calculatedFontSize: calculateMillimetricFontSize(384),
    year: 2024,
    marketShare: 2.8,
  },
  {
    brand: 'Xiaomi',
    model: 'Mi 14',
    width: 360,
    height: 780,
    scaleFactor: 360 / 393,
    calculatedFontSize: calculateMillimetricFontSize(360),
    year: 2024,
    marketShare: 3.2,
  },
  {
    brand: 'Xiaomi',
    model: 'Redmi Note 13 Pro',
    width: 360,
    height: 800,
    scaleFactor: 360 / 393,
    calculatedFontSize: calculateMillimetricFontSize(360),
    year: 2024,
    marketShare: 2.1,
  },
  {
    brand: 'Xiaomi',
    model: 'Redmi 2',
    width: 720,
    height: 1280,
    scaleFactor: 720 / 393,
    calculatedFontSize: calculateMillimetricFontSize(720),
    year: 2015,
    marketShare: 0.9,
  },
];

// 📱 HUAWEI DEVICES
export const HuaweiDevices: DeviceSpecs[] = [
  {
    brand: 'Huawei',
    model: 'P60 Pro',
    width: 384,
    height: 824,
    scaleFactor: 384 / 393,
    calculatedFontSize: calculateMillimetricFontSize(384),
    year: 2024,
    marketShare: 1.8,
  },
  {
    brand: 'Huawei',
    model: 'Mate 60 Pro',
    width: 384,
    height: 824,
    scaleFactor: 384 / 393,
    calculatedFontSize: calculateMillimetricFontSize(384),
    year: 2024,
    marketShare: 2.1,
  },
  {
    brand: 'Huawei',
    model: 'Mate X5',
    width: 2224,
    height: 2496,
    scaleFactor: 2224 / 393,
    calculatedFontSize: calculateMillimetricFontSize(2224),
    year: 2024,
    marketShare: 0.9,
  },
  {
    brand: 'Huawei',
    model: 'Y6 (2017)',
    width: 720,
    height: 1280,
    scaleFactor: 720 / 393,
    calculatedFontSize: calculateMillimetricFontSize(720),
    year: 2017,
    marketShare: 0.8,
  },
];

// 📱 OPPO DEVICES
export const OppoDevices: DeviceSpecs[] = [
  {
    brand: 'Oppo',
    model: 'Find X7 Ultra',
    width: 384,
    height: 824,
    scaleFactor: 384 / 393,
    calculatedFontSize: calculateMillimetricFontSize(384),
    year: 2024,
    marketShare: 1.9,
  },
  {
    brand: 'Oppo',
    model: 'Reno 11 Pro',
    width: 360,
    height: 800,
    scaleFactor: 360 / 393,
    calculatedFontSize: calculateMillimetricFontSize(360),
    year: 2024,
    marketShare: 1.4,
  },
];

// 📱 VIVO DEVICES
export const VivoDevices: DeviceSpecs[] = [
  {
    brand: 'Vivo',
    model: 'X100 Pro',
    width: 384,
    height: 824,
    scaleFactor: 384 / 393,
    calculatedFontSize: calculateMillimetricFontSize(384),
    year: 2024,
    marketShare: 1.7,
  },
  {
    brand: 'Vivo',
    model: 'V30 Pro',
    width: 360,
    height: 800,
    scaleFactor: 360 / 393,
    calculatedFontSize: calculateMillimetricFontSize(360),
    year: 2024,
    marketShare: 1.2,
  },
];

// 📱 REALME DEVICES
export const RealmeDevices: DeviceSpecs[] = [
  {
    brand: 'Realme',
    model: 'GT 5 Pro',
    width: 384,
    height: 824,
    scaleFactor: 384 / 393,
    calculatedFontSize: calculateMillimetricFontSize(384),
    year: 2024,
    marketShare: 1.3,
  },
  {
    brand: 'Realme',
    model: '12 Pro+',
    width: 360,
    height: 800,
    scaleFactor: 360 / 393,
    calculatedFontSize: calculateMillimetricFontSize(360),
    year: 2024,
    marketShare: 1.1,
  },
];

// 📱 ONEPLUS DEVICES
export const OnePlusDevices: DeviceSpecs[] = [
  {
    brand: 'OnePlus',
    model: '12 Pro',
    width: 384,
    height: 824,
    scaleFactor: 384 / 393,
    calculatedFontSize: calculateMillimetricFontSize(384),
    year: 2024,
    marketShare: 1.8,
  },
  {
    brand: 'OnePlus',
    model: '12',
    width: 360,
    height: 780,
    scaleFactor: 360 / 393,
    calculatedFontSize: calculateMillimetricFontSize(360),
    year: 2024,
    marketShare: 2.1,
  },
  {
    brand: 'OnePlus',
    model: 'Open',
    width: 1440,
    height: 2268,
    scaleFactor: 1440 / 393,
    calculatedFontSize: calculateMillimetricFontSize(1440),
    year: 2024,
    marketShare: 0.4,
  },
];

// 📱 HONOR DEVICES
export const HonorDevices: DeviceSpecs[] = [
  {
    brand: 'Honor',
    model: 'Magic 6 Pro',
    width: 384,
    height: 824,
    scaleFactor: 384 / 393,
    calculatedFontSize: calculateMillimetricFontSize(384),
    year: 2024,
    marketShare: 1.4,
  },
  {
    brand: 'Honor',
    model: 'Magic V2',
    width: 1972,
    height: 2344,
    scaleFactor: 1972 / 393,
    calculatedFontSize: calculateMillimetricFontSize(1972),
    year: 2024,
    marketShare: 0.6,
  },
];

// 📱 NOTHING DEVICES
export const NothingDevices: DeviceSpecs[] = [
  {
    brand: 'Nothing',
    model: 'Phone (2a)',
    width: 360,
    height: 780,
    scaleFactor: 360 / 393,
    calculatedFontSize: calculateMillimetricFontSize(360),
    year: 2024,
    marketShare: 1.1,
  },
  {
    brand: 'Nothing',
    model: 'Phone (2)',
    width: 384,
    height: 824,
    scaleFactor: 384 / 393,
    calculatedFontSize: calculateMillimetricFontSize(384),
    year: 2023,
    marketShare: 0.8,
  },
];
