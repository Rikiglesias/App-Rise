#!/usr/bin/env node
// Genera le due immagini dell'icona adattiva Android da assets/icons/app/logo.png:
//   adaptive-foreground.png  — il simbolo dentro il cerchio sicuro (66 dp su 108 dp = raggio 313 px su 1024)
//   adaptive-monochrome.png  — maschera a un solo colore per le icone a tema di Android 13+
// Uso: node scripts/genera-icona-adattiva.mjs   (riscrive i due file; controllo: verifica-android-play C18)
import sharp from 'sharp';
import { join } from 'node:path';

const DIR = join(import.meta.dirname, '..', 'assets', 'icons', 'app');
const LATO = 1024;
const RAGGIO_VOLUTO = 300; // margine di 13 px dentro il cerchio sicuro

const sorgente = await sharp(join(DIR, 'logo.png'))
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

// Raggio massimo dei pixel visibili rispetto al centro della sorgente.
const { data, info } = sorgente;
let raggio = 0;
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] === 0) continue;
    raggio = Math.max(
      raggio,
      Math.hypot(x + 0.5 - info.width / 2, y + 0.5 - info.height / 2)
    );
  }
}
const lato = Math.floor((info.width * RAGGIO_VOLUTO) / raggio);
const bordo = Math.floor((LATO - lato) / 2);

const primoPiano = await sharp(join(DIR, 'logo.png'))
  .resize(lato, lato)
  .extend({
    top: bordo,
    bottom: LATO - lato - bordo,
    left: bordo,
    right: LATO - lato - bordo,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();
await sharp(primoPiano).toFile(join(DIR, 'adaptive-foreground.png'));

// Maschera: bianco pieno, opacità = quanto il pixel è scuro o colorato (il bianco del disegno resta vuoto).
const px = await sharp(primoPiano).raw().toBuffer({ resolveWithObject: true });
const mono = Buffer.alloc(px.data.length);
for (let i = 0; i < px.data.length; i += 4) {
  const scuro =
    (255 - Math.min(px.data[i], px.data[i + 1], px.data[i + 2])) / 255;
  const opacita = Math.min(1, scuro / 0.6) * (px.data[i + 3] / 255);
  mono.set([255, 255, 255, Math.round(opacita * 255)], i);
}
await sharp(mono, { raw: { width: LATO, height: LATO, channels: 4 } })
  .png()
  .toFile(join(DIR, 'adaptive-monochrome.png'));

console.log(
  `raggio sorgente ${raggio.toFixed(0)} px → simbolo ${lato} px, raggio finale ≈ ${((raggio * lato) / info.width).toFixed(0)} px`
);
