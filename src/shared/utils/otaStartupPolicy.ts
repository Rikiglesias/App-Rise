interface OtaStartupState {
  navigationReady: boolean;
  elapsedSinceStartupMs: number;
  /**
   * Scaduto il tempo massimo della schermata d'attesa (C73): da lì niente ricarica,
   * il nuovo bundle vale dal prossimo avvio a freddo. Facoltativo, di default `false`.
   */
  attesaScaduta?: boolean;
}

/** Valutare all'inizio del download e conservare l'esito fino al pending. */
export const shouldReloadOtaAtStartup = ({
  navigationReady,
  elapsedSinceStartupMs,
  attesaScaduta = false,
}: OtaStartupState): boolean =>
  !attesaScaduta &&
  (!navigationReady ||
    (Number.isFinite(elapsedSinceStartupMs) &&
      elapsedSinceStartupMs >= 0 &&
      elapsedSinceStartupMs <= 5000));
