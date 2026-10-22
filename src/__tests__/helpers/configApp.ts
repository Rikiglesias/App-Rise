/**
 * La configurazione di Expo (`app.config.js`) letta dai test dei plugin. Il percorso è calcolato apposta:
 * quel file lo legge Expo, non l'app, e un import statico dai test lo farebbe comparire fra gli orfani di
 * madge (C29 del contratto android-play), che esclude i test da chi importa.
 */
import path from 'path';

type ConfigApp = { expo: { plugins: unknown[] } };

const FILE = path.resolve(__dirname, '../../../app.config.js');

export const configApp = (): ConfigApp =>
  (require(FILE) as { default: ConfigApp }).default;
