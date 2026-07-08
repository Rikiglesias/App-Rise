import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { ExpandableNote } from '@/features/auth/components/ExpandableNote';

const QUESTION = 'Perche mostrare questo?';
const BODY = 'Contenuto nascosto';

const renderNote = (props?: { defaultExpanded?: boolean }) =>
  render(
    <AllProviders>
      <ExpandableNote question={QUESTION} {...props}>
        <Text>{BODY}</Text>
      </ExpandableNote>
    </AllProviders>
  );

describe('ExpandableNote', () => {
  it('collassata di default: mostra la domanda, nasconde il corpo', () => {
    const { getByText, queryByText } = renderNote();
    expect(getByText(QUESTION)).toBeTruthy();
    expect(queryByText(BODY)).toBeNull();
  });

  it('tap sulla domanda: espande e rivela il corpo', () => {
    const { getByLabelText, queryByText } = renderNote();
    fireEvent.press(getByLabelText(QUESTION));
    expect(queryByText(BODY)).toBeTruthy();
  });

  it('secondo tap: richiude il corpo', () => {
    const { getByLabelText, queryByText } = renderNote();
    const header = getByLabelText(QUESTION);
    fireEvent.press(header);
    expect(queryByText(BODY)).toBeTruthy();
    fireEvent.press(header);
    expect(queryByText(BODY)).toBeNull();
  });

  it('defaultExpanded: parte già aperta', () => {
    const { queryByText } = renderNote({ defaultExpanded: true });
    expect(queryByText(BODY)).toBeTruthy();
  });
});
