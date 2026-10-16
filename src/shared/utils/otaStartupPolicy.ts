interface OtaStartupState {
  navigationReady: boolean;
  elapsedSinceStartupMs: number;
}

/** Valutare all'inizio del download e conservare l'esito fino al pending. */
export const shouldReloadOtaAtStartup = ({
  navigationReady,
  elapsedSinceStartupMs,
}: OtaStartupState): boolean =>
  !navigationReady ||
  (Number.isFinite(elapsedSinceStartupMs) &&
    elapsedSinceStartupMs >= 0 &&
    elapsedSinceStartupMs <= 5000);
