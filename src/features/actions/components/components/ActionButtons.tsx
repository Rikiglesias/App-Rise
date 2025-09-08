/**
 * DEPRECATED - ActionButtons Legacy Layer
 *
 * ⚠️  QUESTO FILE È DEPRECATO ⚠️
 *
 * Utilizzare invece: ActionButtonsRefactored da '../ActionButtons'
 *
 * Questo file mantiene la backward compatibility ma re-exporta
 * il nuovo sistema refactorizzato con separazione Business Logic / UI.
 *
 * MIGRAZIONE:
 * - Da: import ActionButtons from './components/ActionButtons'
 * - A:   import { ActionButtonsRefactored } from './ActionButtons'
 *
 * BENEFICI NUOVO SISTEMA:
 * - Separazione Business Logic / UI
 * - Testabilità migliorata
 * - Manutenibilità superiore
 * - Riusabilità hook
 */

import { ActionButtonsRefactored } from '../ActionButtons';
import type { NewActionButtonsSectionProps } from './ActionButtonTypes';

/**
 * Legacy compatibility layer - delegates to refactored component
 */
const NewActionButtonsSection: React.FC<
  NewActionButtonsSectionProps
> = props => {
  return <ActionButtonsRefactored {...props} />;
};

export default NewActionButtonsSection;
