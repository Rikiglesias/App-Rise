import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import * as Updates from 'expo-updates';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { changeLanguage, getCurrentLocale } from '@/locales';

const Crash = (): React.ReactNode => {
  throw new Error('Crash di prova');
};

const locale = getCurrentLocale();
beforeEach(() => {
  changeLanguage('it');
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
  changeLanguage(locale);
});

it('riavvio: un tocco solo', async () => {
  let resolve!: () => void;
  const pending = new Promise<void>(done => {
    resolve = done;
  });
  const reload = jest.mocked(Updates.reloadAsync);
  reload.mockReset().mockReturnValue(pending);
  const ui = render(
    <ErrorBoundary>
      <Crash />
    </ErrorBoundary>
  );
  try {
    const button = ui.getByText('🔄 Ricarica App');
    act(() => {
      fireEvent.press(button);
      fireEvent.press(button);
    });
    expect(reload).toHaveBeenCalledTimes(1);
  } finally {
    await act(async () => {
      resolve();
      await pending;
    });
    ui.unmount();
  }
});

it('riavvio: dopo il rifiuto si può riprovare', async () => {
  let reject!: (reason: Error) => void;
  const pending = new Promise<void>((_resolve, fail) => {
    reject = fail;
  });
  const reload = jest.mocked(Updates.reloadAsync);
  reload.mockReset().mockReturnValueOnce(pending).mockResolvedValue(undefined);
  const ui = render(
    <ErrorBoundary>
      <Crash />
    </ErrorBoundary>
  );
  fireEvent.press(ui.getByText('🔄 Ricarica App'));
  await act(async () => {
    reject(new Error('Riavvio fallito'));
    await Promise.allSettled([pending]);
  });
  fireEvent.press(ui.getByText('🔄 Ricarica App'));
  expect(reload).toHaveBeenCalledTimes(2);
});

it('riavvio: senza Updates il ripristino resta riutilizzabile', () => {
  const descriptor = Object.getOwnPropertyDescriptor(Updates, 'reloadAsync');
  if (!descriptor) throw new Error('reloadAsync non esportato');
  Object.defineProperty(Updates, 'reloadAsync', { value: undefined });
  let shouldCrash = true;
  const Child = (): React.ReactElement => {
    if (shouldCrash) throw new Error('Crash di prova');
    return <Text>Ripristinato</Text>;
  };
  const tree = (
    <ErrorBoundary>
      <Child />
    </ErrorBoundary>
  );
  const ui = render(tree);
  try {
    shouldCrash = false;
    fireEvent.press(ui.getByText('🔄 Ricarica App'));
    expect(ui.getByText('Ripristinato')).toBeTruthy();
    shouldCrash = true;
    ui.rerender(
      <ErrorBoundary>
        <Child />
      </ErrorBoundary>
    );
    shouldCrash = false;
    fireEvent.press(ui.getByText('🔄 Ricarica App'));
    expect(ui.getByText('Ripristinato')).toBeTruthy();
  } finally {
    Object.defineProperty(Updates, 'reloadAsync', descriptor);
    ui.unmount();
  }
});
