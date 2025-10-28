const devices = [
  { name: 'iPhone SE', width: 375 },
  { name: 'iPhone 15', width: 393 },
  { name: 'iPhone 15 Plus', width: 430 },
  { name: 'Samsung S24', width: 360 },
  { name: 'Samsung S24+', width: 384 },
  { name: 'iPad', width: 810 },
  { name: 'Galaxy Tab S9', width: 1600 }
];

const referenceWidth = 393;
const testFontSize = 32;

console.log('🔍 VERIFICA CALCOLI SCALING SYSTEM');
console.log('=====================================');
console.log('Riferimento: iPhone 15 (393px)');
console.log('Font test: 32px');
console.log('=====================================');

devices.forEach(device => {
  let scale = device.width / referenceWidth;
  if (scale < 0.85) scale = 0.85;
  if (scale > 1.4) scale = 1.4;
  
  const scaledFont = testFontSize * scale;
  const percentage = (scale * 100).toFixed(1);
  
  console.log(`${device.name.padEnd(15)} | ${device.width}px | ${scale.toFixed(3)}x | ${scaledFont.toFixed(1)}px | ${percentage}%`);
});

console.log('\n🎯 VERIFICA LIMITI SCALING:');
console.log('Min scale: 0.85 (27.2px per font 32px)');
console.log('Max scale: 1.4 (44.8px per font 32px)');
console.log('Range: 27.2px - 44.8px (rapporto 1:1.65)');