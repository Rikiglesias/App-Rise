/**
 * Preset leggeri per clamp delle icone.
 * Da usare solo per micro-elementi (badge/chevron/indicatori).
 */
export const IconClamps = {
  // Piccola icona informativa (es. "i")
  badge: {
    minSize: 14 as const,
    maxSize: 18 as const,
  },
  // Chevron/frecce di navigazione piccole
  chevron: {
    minSize: 18 as const,
    maxSize: 24 as const,
  },
  // Indicatore mappa piccolo nel badge cliccabile
  mapIndicator: {
    minSize: 24 as const,
    maxSize: 32 as const,
  },
} as const;

export type IconClampPreset = keyof typeof IconClamps;

