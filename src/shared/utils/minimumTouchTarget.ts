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
