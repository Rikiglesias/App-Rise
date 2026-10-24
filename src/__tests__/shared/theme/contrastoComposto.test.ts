import { contrasto } from '@/__tests__/helpers/contrasto';

// Guardia di C81: i contrasti corretti in F13 (D1-D3) sono misurati con l'alfa del testo composto sul
// fondo. Se l'helper tornasse a ignorare l'alfa, il nero al 50% conterebbe come nero pieno (21:1).
describe('helper del contrasto', () => {
  it('contrasto: testo trasparente composto sul fondo', () => {
    // #000000 con alfa 0x80 su bianco appare come il grigio 0x7F (255 × (1 − 128/255) = 127).
    const trasparente = contrasto('#00000080', '#FFFFFF');
    expect(trasparente).toBeCloseTo(contrasto('#7F7F7F', '#FFFFFF'), 2);
    expect(trasparente).toBeLessThan(4.5);
    expect(contrasto('rgba(0, 0, 0, 0.5)', '#FFFFFF')).toBeLessThan(4.5);
    expect(() => contrasto('#000000', '#FFFFFF80')).toThrow(
      /fondo trasparente/
    );
  });
});
