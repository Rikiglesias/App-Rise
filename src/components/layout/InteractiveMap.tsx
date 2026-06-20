/**
 * InteractiveMap — alias pubblico storico della mappa interattiva.
 *
 * L'implementazione è la world map vettoriale `WorldMapSvg` (paesi-evento colorati
 * e cliccabili). Il nome è mantenuto per i consumer esistenti (barrel
 * `components/layout` + `MapModalScreen`); il contratto Props
 * (`locations`, `onMarkerPress`, `style?`, `isFullScreen?`) è identico.
 */
export { default } from './WorldMapSvg';
