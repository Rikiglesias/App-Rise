#!/usr/bin/env node
// Genera la grafica della scheda Google Play in docs/store/google-play/grafica/:
//   icona-512.png          — 512×512 PNG RGBA opaco: il simbolo di logo.png su bianco, come l'icona del telefono.
//                            Quadrato pieno, senza angoli né ombre: maschera (raggio 30 %) e ombra le mette Play.
//   grafica-1024x500.png   — 1024×500 PNG RGB senza alfa: il marchio di app-icon.png su bianco, al centro.
// Uso: node scripts/genera-grafica-play.mjs   (riscrive i due file; controllo: verifica-android-play C16)
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const RADICE = join(import.meta.dirname, '..');
const ICONE = join(RADICE, 'assets', 'icons', 'app');
const USCITA = join(RADICE, 'docs', 'store', 'google-play', 'grafica');
const BIANCO = { r: 255, g: 255, b: 255, alpha: 1 };

/** Ritaglia i bordi vuoti (trasparenti o bianchi) e restituisce il PNG ridimensionato dentro w×h. */
const contenuto = async (file, w, h) => {
  const ritagliato = await sharp(join(ICONE, file))
    .flatten({ background: BIANCO })
    .trim({ background: '#ffffff', threshold: 10 })
    .toBuffer();
  return sharp(ritagliato)
    .resize(w, h, { fit: 'inside', background: BIANCO })
    .png()
    .toBuffer();
};

const alCentro = async (immagine, w, h) => {
  const { width, height } = await sharp(immagine).metadata();
  return {
    input: immagine,
    left: Math.round((w - width) / 2),
    top: Math.round((h - height) / 2),
  };
};

mkdirSync(USCITA, { recursive: true });

// Icona: simbolo alto il 72 % del lato (sotto la keyline di 384 px indicata da Google per il 75 %).
const simbolo = await contenuto('logo.png', 512, 368);
await sharp({
  create: { width: 512, height: 512, channels: 4, background: BIANCO },
})
  .composite([await alCentro(simbolo, 512, 512)])
  .png()
  .toFile(join(USCITA, 'icona-512.png'));

// Grafica in evidenza: marchio entro 640×300, lontano dai bordi che Play può ritagliare.
const marchio = await contenuto('app-icon.png', 640, 300);
await sharp({
  create: { width: 1024, height: 500, channels: 3, background: BIANCO },
})
  .composite([await alCentro(marchio, 1024, 500)])
  .removeAlpha()
  .png()
  .toFile(join(USCITA, 'grafica-1024x500.png'));

console.log(`grafica scritta in ${USCITA}`);
