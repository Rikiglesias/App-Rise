/**
 * Una parola sola (o un indirizzo email) non può andare a capo senza spezzarsi: Android la taglia a
 * metà («Welco / me», «info@riseagainsthu / nger.it»). Chi la mostra le dà una riga che si restringe
 * (`variant="fit"` di PerfectText) invece di lasciarla spezzare (F14-ponte).
 */
export const isSingleWord = (text: string): boolean => !/\s/.test(text.trim());
