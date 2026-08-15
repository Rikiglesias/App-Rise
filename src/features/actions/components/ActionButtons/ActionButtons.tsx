/**
 * REFACTORED ACTION BUTTONS - Architettura separata Business Logic / UI
 * Ridotto da 204 righe a ~50 righe con separazione delle responsabilità
 */

import React from 'react';

import DonationInfoModal from '../shared/DonationInfoModal';
import PartnerDisclosureModal from '../shared/PartnerDisclosureModal';
import type { NewActionButtonsSectionProps } from '../shared/ActionButtonTypes';
import { useActionButtonsData } from './useActionButtonsData';
import { ActionButtonsUI } from './ActionButtonsUI';

/**
 * Componente ActionButtons refactorizzato con architettura pulita:
 *
 * SEPARAZIONE RESPONSABILITÀ:
 * - useActionButtonsData: Tutta la logica business (204 → 50 righe)
 * - ActionButtonsUI: Solo rendering UI (puro)
 * - ActionButtonsRefactored: Orchestratore principale (minimo)
 *
 * BENEFICI:
 * - Testabilità: Logica e UI testabili separatamente
 * - Manutenibilità: Modifiche isolate per tipo
 * - Riusabilità: Hook riutilizzabile in altri contesti
 * - Single Responsibility: Ogni file ha un focus specifico
 */
const ActionButtonsRefactored: React.FC<NewActionButtonsSectionProps> = ({
  animations,
  navigation,
}) => {
  // Business Logic Hook - Gestisce tutti i dati e handlers
  const data = useActionButtonsData(navigation);

  return (
    <>
      {/* UI Component - Solo rendering */}
      <ActionButtonsUI animations={animations} data={data} />

      {/* Modal - Gestito dalla logica business */}
      <DonationInfoModal
        visible={data.showInfoModal}
        onClose={data.handleInfoModalClose}
      />

      {/* Schermata onesta pre-redirect verso Let's Donation (F1.7d) */}
      <PartnerDisclosureModal
        visible={data.disclosureVisible}
        onConfirm={data.confirmDisclosure}
        onCancel={data.cancelDisclosure}
      />

      {/* Avviso pre-donazione: l'indirizzo Donorbox porta nome, cognome ed email.
          È l'altro canale, con un altro testo e un'altra scelta — non lo stesso
          riquadro riusato: quello di sopra parla dell'account separato da creare,
          questo dei dati che partono. */}
      <PartnerDisclosureModal
        variant="donorbox"
        visible={data.donorboxDisclosureVisible}
        onConfirm={() => void data.confirmDonorboxDisclosure(true)}
        onConfirmWithoutData={() => void data.confirmDonorboxDisclosure(false)}
        onCancel={data.cancelDonorboxDisclosure}
      />
    </>
  );
};

export default ActionButtonsRefactored;
