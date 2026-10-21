/** Lato minimo di un'area toccabile secondo le linee guida Android: 48 dp. */
export const MIN_TOUCH_TARGET_DP = 48;

/**
 * Area toccabile minima (C43): mai sotto 48 dp, anche se il contenuto è più
 * piccolo o la misura non è un numero. I dp sono già indipendenti dalla
 * densità: la finestra (360×640, 320×568) non cambia la soglia.
 */
export const minimumTouchTarget = (
  size = 0
): { minWidth: number; minHeight: number } => {
  const side =
    Number.isFinite(size) && size > MIN_TOUCH_TARGET_DP
      ? size
      : MIN_TOUCH_TARGET_DP;
  return { minWidth: side, minHeight: side };
};

const halfMissing = (size: number): number =>
  Math.max(0, MIN_TOUCH_TARGET_DP - (Number.isFinite(size) ? size : 0)) / 2;

/**
 * `hitSlop` per lato che porta a 48 dp un controllo di misura dichiarata (i
 * pulsanti tondi con lo sfondo) senza cambiarne l'aspetto. Va calcolato dalla
 * misura scalata, quella che il controllo ha davvero sulla finestra corrente.
 * Su Android il tocco fuori dai bordi arriva finché nessun antenato con
 * `overflow` hidden o scroll lo taglia (`TouchTargetHelper.kt`): attorno al
 * controllo serve quello spazio.
 */
export const touchTargetHitSlop = (
  width = 0,
  height = width
): { top: number; bottom: number; left: number; right: number } => {
  const vertical = halfMissing(height);
  const horizontal = halfMissing(width);
  return {
    top: vertical,
    bottom: vertical,
    left: horizontal,
    right: horizontal,
  };
};
