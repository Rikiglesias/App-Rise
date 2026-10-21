/**
 * Preferenza «Riduci animazioni» del telefono (C46 del contratto android-play).
 *
 * Android: Accessibilità → Rimuovi animazioni (o la scala delle transizioni a zero nelle
 * Opzioni sviluppatore); iOS: Riduci movimento. Le animazioni del sistema le spegne il
 * telefono da solo; quelle scritte con `Animated` e le transizioni dello stack JavaScript
 * no, perché girano col loro orologio: per loro decide questo hook.
 * Una sola lettura nativa e un solo ascolto, condivisi da tutti i componenti che lo usano.
 */
import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

import { logger } from '@/shared/utils/logger';

let reduceMotion = false;
let subscription: ReturnType<typeof AccessibilityInfo.addEventListener> | null =
  null;
const listeners = new Set<() => void>();

const update = (value: boolean): void => {
  if (value === reduceMotion) return;
  reduceMotion = value;
  listeners.forEach(listener => listener());
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  if (!subscription) {
    subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      update
    );
    AccessibilityInfo.isReduceMotionEnabled().then(update, (error: unknown) => {
      // Lettura fallita: restano le animazioni del disegno, come prima di C46.
      logger.warn(
        'Lettura di «Riduci animazioni» non riuscita',
        'useReduceMotion',
        error
      );
    });
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      subscription?.remove();
      subscription = null;
    }
  };
};

const getSnapshot = (): boolean => reduceMotion;

/** `true` quando la persona ha chiesto al telefono di togliere le animazioni. */
export const useReduceMotion = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot);

/** Durata di un'animazione: 0 con «Riduci animazioni», altrimenti quella del disegno. */
export const motionDuration = (durationMs: number, reduce: boolean): number =>
  reduce ? 0 : durationMs;
