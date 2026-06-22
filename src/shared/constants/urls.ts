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

export const RISE_URLS = {
  // Main websites
  italyMain: 'https://italy.riseagainsthunger.org',
  italyWebsite: 'https://italy.riseagainsthunger.org',

  // Donation & Actions
  donation: 'https://italy.riseagainsthunger.org/donaora/',
  tracciabilita: 'https://italy.riseagainsthunger.org/chi-siamo/tracciabilita/',

  // Legale
  privacyPolicy: 'https://italy.riseagainsthunger.org/privacy-policy/',

  // Welfare4Charity Platform
  shop: 'https://riseagainsthunger.org.welfare4charity.com/charity/ecommerce',
  giftCards:
    'https://riseagainsthunger.org.welfare4charity.com/charity/giftcards',
  events:
    'https://riseagainsthunger.org.welfare4charity.com/organization/events',
  projects: 'https://riseagainsthunger.org.welfare4charity.com/org/projects',
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
// IMAGE CDN URLS (Unsplash)
// ===================================================================

export const IMAGE_URLS = {
  // Africa / Zimbabwe
  zimbabwe:
    'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',

  // South Africa
  southAfrica:
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',

  // Italy
  italy:
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',

  // USA
  usa: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',

  // Ukraine
  ukraine:
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',

  // Food/Community
  foodCommunity:
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',

  // Volunteers
  volunteers:
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
} as const;

// ===================================================================
// TYPE EXPORTS
// ===================================================================

export type RiseUrl = keyof typeof RISE_URLS;
export type SocialUrl = keyof typeof SOCIAL_URLS;
export type ImageUrl = keyof typeof IMAGE_URLS;
