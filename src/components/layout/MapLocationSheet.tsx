import React, { forwardRef, useCallback, useMemo } from 'react';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

import MapLocationSheetContent from './MapLocationSheetContent';
import { createStyles } from './MapLocationSheetStyles';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { MapModalData } from '@/features/impact/data/mapModalData';

interface MapLocationSheetProps {
  data: MapModalData | null;
  /** X in header → il parent chiude il sheet (ref.dismiss()). */
  onClose: () => void;
  /** Chiamato da @gorhom a chiusura completa → il parent azzera la selezione. */
  onDismiss: () => void;
}

const SNAP_POINTS = ['60%', '92%'];

/**
 * MapLocationSheet — dettaglio destinazione come bottom-sheet (@gorhom v5).
 * Presentato imperativamente dal parent via ref (.present()). Wrapper sottile: il
 * contenuto (scheda con stat + provenienza + TRACCIABILITÀ + programma/partner/
 * risultati) vive in MapLocationSheetContent. Drag-to-dismiss + backdrop + X.
 */
const MapLocationSheet = forwardRef<BottomSheetModal, MapLocationSheetProps>(
  ({ data, onClose, onDismiss }, ref) => {
    const colors = useThemeColors();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={SNAP_POINTS}
        onDismiss={onDismiss}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        {data ? (
          <MapLocationSheetContent data={data} onClose={onClose} />
        ) : null}
      </BottomSheetModal>
    );
  }
);
MapLocationSheet.displayName = 'MapLocationSheet';

export default MapLocationSheet;
