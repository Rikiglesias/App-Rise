/**
 * TypeScript Types per i18n
 * Garantisce type-safety nelle traduzioni
 */

import it from './it';

// Tipo per le chiavi delle traduzioni (type-safe)
export type TranslationKeys = typeof it;

// Lingue supportate (19 lingue europee)
export type SupportedLocale =
  | 'it' // 🇮🇹 Italiano
  | 'en' // 🇬🇧 Inglese
  | 'es' // 🇪🇸 Spagnolo
  | 'fr' // 🇫🇷 Francese
  | 'de' // 🇩🇪 Tedesco
  | 'pt' // 🇵🇹 Portoghese
  | 'nl' // 🇳🇱 Olandese
  | 'pl' // 🇵🇱 Polacco
  | 'ro' // 🇷🇴 Rumeno
  | 'el' // 🇬🇷 Greco
  | 'cs' // 🇨🇿 Ceco
  | 'sv' // 🇸🇪 Svedese
  | 'hu' // 🇭🇺 Ungherese
  | 'da' // 🇩🇰 Danese
  | 'fi' // 🇫🇮 Finlandese
  | 'no' // 🇳🇴 Norvegese
  | 'bg' // 🇧🇬 Bulgaro
  | 'sk' // 🇸🇰 Slovacco
  | 'hr'; // 🇭🇷 Croato
