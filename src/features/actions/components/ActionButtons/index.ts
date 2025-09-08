/**
 * ACTION BUTTONS REFACTORED - Export unificati
 * Sistema ActionButtons con separazione Business Logic / UI
 */

// Componente principale refactorizzato
export { default as ActionButtonsRefactored } from './ActionButtonsRefactored';
export { default } from './ActionButtonsRefactored';

// Hook per logica business (per riuso in altri contesti)
export { useActionButtonsData } from './useActionButtonsData';
export type { ActionButtonsData } from './useActionButtonsData';

// Componente UI puro (per testing e riuso)
export { ActionButtonsUI } from './ActionButtonsUI';
