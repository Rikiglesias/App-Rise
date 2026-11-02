import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

/** Dice se la tastiera è aperta adesso: su Android cambia a fine animazione. */
export const useTastieraAperta = (): boolean => {
  const [aperta, setAperta] = useState(() => Keyboard.isVisible());

  useEffect(() => {
    const mostrata = Keyboard.addListener('keyboardDidShow', () =>
      setAperta(true)
    );
    const nascosta = Keyboard.addListener('keyboardDidHide', () =>
      setAperta(false)
    );
    return () => {
      mostrata.remove();
      nascosta.remove();
    };
  }, []);

  return aperta;
};
