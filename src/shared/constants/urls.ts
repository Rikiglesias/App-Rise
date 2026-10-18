/**
 * URLS CENTRALIZED - Single source of truth per tutti i link esterni
 *
 * ORGANIZZAZIONE:
 * - Websites Rise Against Hunger
 * - Social Media links
 * - External platforms (shop, events, etc.)
 * - Image CDN URLs
 */

// ===================================================================
// RISE AGAINST HUNGER WEBSITES
// ===================================================================

export const RISE_CONTACTS = {
  phone: '051704070',
  phoneDisplay: '051 704070',
  email: 'info@riseagainsthunger.it',
  address: 'Via dei Fornaciai, 17, 40129 Bologna, BO, Italia',
  addressDisplay: 'Via dei Fornaciai, 17 - Bologna',
} as const;

export const RISE_URLS = {
  // Main websites
  italyMain: 'https://italy.riseagainsthunger.org',
  italyWebsite: 'https://italy.riseagainsthunger.org',

  // Actions (la donazione NON è qui: parte da Donorbox via usePartnerExit /
  // partnerUrls.DONORBOX_DONATION_URL, con rise_ref e prefill)
  tracciabilita: 'https://italy.riseagainsthunger.org/chi-siamo/tracciabilita/',

  // Legale
  privacyPolicy: 'https://italy.riseagainsthunger.org/privacy-policy/',

  // Let's Donation Platform (ex Welfare4Charity: 301 verso il dominio nuovo
  // verificato il 2026-07-23 — stesso path, cambia solo l'host)
  shop: 'https://riseagainsthunger.org.letsdonation.com/charity/ecommerce',
  giftCards: 'https://riseagainsthunger.org.letsdonation.com/charity/giftcards',
  events: 'https://riseagainsthunger.org.letsdonation.com/organization/events',
  projects: 'https://riseagainsthunger.org.letsdonation.com/org/projects',
  communityRegister:
    'https://riseagainsthunger.org.letsdonation.com/register?redirect=https%3A%2F%2Friseagainsthunger.org.letsdonation.com%2Fcharity%2Fecommerce',
} as const;

// ===================================================================
// SOCIAL MEDIA LINKS
// ===================================================================

export const SOCIAL_URLS = {
  facebook: 'https://www.facebook.com/RAHItalia/',
  instagram: 'https://www.instagram.com/riseagainsthunger_italia/',
  youtube: 'https://www.youtube.com/@RiseAgainstHungerItalia',
  linkedin: 'https://www.linkedin.com/company/rise-against-hunger-italia/',

  // Alternative formats (senza www)
  instagramShort: 'https://instagram.com/riseagainsthungeritalia',
  facebookShort: 'https://facebook.com/RiseAgainstHungerItalia',
  linkedinShort: 'https://linkedin.com/company/rise-against-hunger-italia',
} as const;

// ===================================================================
// TYPE EXPORTS
// ===================================================================

export type RiseUrl = keyof typeof RISE_URLS;
export type SocialUrl = keyof typeof SOCIAL_URLS;
