/**
 * Utility functions per ActionButtons
 * Centralizza logica di colori e helpers
 */

/**
 * Determina il colore dell'icona per i bottoni Esplora
 * @param index Indice del bottone nella sezione
 * @returns Codice colore hex
 */
export const getExploreIconColor = (index: number): string => {
  if (index === 0) return '#0F766E'; // Teal per Progetti
  if (index === 1) return '#1565C0'; // Blu per Tracciabilità
  return '#7C3AED'; // Viola per Eventi
};

/**
 * Determina il colore dell'icona per i bottoni Community
 * @param index Indice del bottone nella sezione
 * @returns Codice colore hex
 */
export const getCommunityIconColor = (index: number): string => {
  if (index === 0) return '#1F2937'; // Nero per Seguici
  return '#1F2937'; // Grigio scuro per Chi Siamo
};

/**
 * Mapping dei nomi delle icone per type safety
 */
export type ActionButtonIconName =
  | 'heart'
  | 'charity'
  | 'shopping'
  | 'gift'
  | 'calendar'
  | 'share-variant'
  | 'map-marker-path'
  | 'information';
