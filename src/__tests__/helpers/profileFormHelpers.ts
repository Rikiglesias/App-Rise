import { fireEvent } from '@testing-library/react-native';

/**
 * Compila il form del profilo con valori validi.
 *
 * Vive qui perché lo usano DUE suite: quella della schermata di completamento e quella
 * del cancello del profilo. Una seconda copia si scoprirebbe divergente al primo campo
 * aggiunto al form — e la suite del cancello esiste proprio per accorgersi quando i
 * campi richiesti e i campi raccolti smettono di coincidere: un helper duplicato le
 * toglierebbe il senso.
 */
export const fillValidProfileForm = (
  getByLabelText: (t: string) => unknown,
  getByRole: (r: string) => unknown,
  getByTestId: (t: string) => unknown,
  // Sul COMPLETAMENTO di un profilo esistente la casella del consenso non viene
  // mostrata (fu dato alla nascita): premerla lì farebbe fallire la query, non il
  // comportamento. Chi testa quel ramo passa `false`.
  opts: { consent?: boolean } = {}
): void => {
  const set = (label: string, value: string): void =>
    fireEvent.changeText(getByLabelText(label) as never, value);
  set('Nome', 'Mario');
  set('Cognome', 'Rossi');
  set('Telefono', '3331234567');
  // Città via autocomplete: digita e seleziona il primo comune suggerito
  // (la selezione auto-compila la provincia, qui Roma → RM).
  set('Città', 'Roma');
  fireEvent.press(getByTestId('city-option-0') as never);
  // Data di nascita via date picker: apre il campo e conferma (mock → 1990-01-01).
  fireEvent.press(getByLabelText('Data di nascita') as never);
  fireEvent.press(getByTestId('date-picker') as never);
  if (opts.consent !== false) fireEvent.press(getByRole('checkbox') as never);
};
