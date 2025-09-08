/**
 * SPECIAL CATEGORIES - Dispositivi per categorie speciali
 * Gaming, Foldables, Entry-Level, Altri brand
 */

import { DeviceSpecs, calculateMillimetricFontSize } from './types';

// 🎮 GAMING DEVICES
export const GamingDevices: DeviceSpecs[] = [
  {
    brand: 'ASUS',
    model: 'ROG Phone 8',
    width: 1080,
    height: 2448,
    scaleFactor: 1080 / 393,
    calculatedFontSize: calculateMillimetricFontSize(1080),
    year: 2024,
    marketShare: 0.3,
  },
  {
    brand: 'RedMagic',
    model: '9 Pro',
    width: 1116,
    height: 2480,
    scaleFactor: 1116 / 393,
    calculatedFontSize: calculateMillimetricFontSize(1116),
    year: 2024,
    marketShare: 0.2,
  },
  {
    brand: 'Black Shark',
    model: '5 Pro',
    width: 1080,
    height: 2400,
    scaleFactor: 1080 / 393,
    calculatedFontSize: calculateMillimetricFontSize(1080),
    year: 2024,
    marketShare: 0.1,
  },
];

// 📱 FOLDABLE DEVICES (non Samsung/Google)
export const FoldableDevices: DeviceSpecs[] = [
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
    brand: 'Honor',
    model: 'Magic V2',
    width: 1972,
    height: 2344,
    scaleFactor: 1972 / 393,
    calculatedFontSize: calculateMillimetricFontSize(1972),
    year: 2024,
    marketShare: 0.6,
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

// 📱 ENTRY LEVEL DEVICES (720×1280)
export const EntryLevelDevices: DeviceSpecs[] = [
  {
    brand: 'Samsung',
    model: 'Galaxy S4 mini',
    width: 720,
    height: 1280,
    scaleFactor: 720 / 393,
    calculatedFontSize: calculateMillimetricFontSize(720),
    year: 2013,
    marketShare: 0.8,
  },
  {
    brand: 'Samsung',
    model: 'Galaxy S5 mini',
    width: 720,
    height: 1280,
    scaleFactor: 720 / 393,
    calculatedFontSize: calculateMillimetricFontSize(720),
    year: 2014,
    marketShare: 0.7,
  },
  {
    brand: 'Samsung',
    model: 'Galaxy A3 (2016)',
    width: 720,
    height: 1280,
    scaleFactor: 720 / 393,
    calculatedFontSize: calculateMillimetricFontSize(720),
    year: 2016,
    marketShare: 1.2,
  },
  {
    brand: 'LG',
    model: 'G2 mini',
    width: 720,
    height: 1280,
    scaleFactor: 720 / 393,
    calculatedFontSize: calculateMillimetricFontSize(720),
    year: 2014,
    marketShare: 0.5,
  },
  {
    brand: 'HTC',
    model: 'One mini',
    width: 720,
    height: 1280,
    scaleFactor: 720 / 393,
    calculatedFontSize: calculateMillimetricFontSize(720),
    year: 2013,
    marketShare: 0.4,
  },
  {
    brand: 'Sony',
    model: 'Xperia Z1 Compact',
    width: 720,
    height: 1280,
    scaleFactor: 720 / 393,
    calculatedFontSize: calculateMillimetricFontSize(720),
    year: 2014,
    marketShare: 0.6,
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

// 📱 SONY DEVICES
export const SonyDevices: DeviceSpecs[] = [
  {
    brand: 'Sony',
    model: 'Xperia 1 VI',
    width: 384,
    height: 824,
    scaleFactor: 384 / 393,
    calculatedFontSize: calculateMillimetricFontSize(384),
    year: 2024,
    marketShare: 0.8,
  },
  {
    brand: 'Sony',
    model: 'Xperia 5 V',
    width: 360,
    height: 780,
    scaleFactor: 360 / 393,
    calculatedFontSize: calculateMillimetricFontSize(360),
    year: 2024,
    marketShare: 0.6,
  },
  {
    brand: 'Sony',
    model: 'Xperia Z1 Compact',
    width: 720,
    height: 1280,
    scaleFactor: 720 / 393,
    calculatedFontSize: calculateMillimetricFontSize(720),
    year: 2014,
    marketShare: 0.6,
  },
];

// 📱 MOTOROLA DEVICES
export const MotorolaDevices: DeviceSpecs[] = [
  {
    brand: 'Motorola',
    model: 'Edge 50 Ultra',
    width: 384,
    height: 824,
    scaleFactor: 384 / 393,
    calculatedFontSize: calculateMillimetricFontSize(384),
    year: 2024,
    marketShare: 1.1,
  },
  {
    brand: 'Motorola',
    model: 'G84',
    width: 360,
    height: 800,
    scaleFactor: 360 / 393,
    calculatedFontSize: calculateMillimetricFontSize(360),
    year: 2024,
    marketShare: 0.9,
  },
];

// 📱 NOKIA DEVICES
export const NokiaDevices: DeviceSpecs[] = [
  {
    brand: 'Nokia',
    model: 'X30 5G',
    width: 360,
    height: 780,
    scaleFactor: 360 / 393,
    calculatedFontSize: calculateMillimetricFontSize(360),
    year: 2024,
    marketShare: 0.7,
  },
  {
    brand: 'Nokia',
    model: 'G60 5G',
    width: 360,
    height: 800,
    scaleFactor: 360 / 393,
    calculatedFontSize: calculateMillimetricFontSize(360),
    year: 2024,
    marketShare: 0.5,
  },
];
