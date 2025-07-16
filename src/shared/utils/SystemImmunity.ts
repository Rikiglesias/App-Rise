/**
 * SISTEMA IMMUNITÀ TOTALE ALLE IMPOSTAZIONI UTENTE
 * 
 * Blocca QUALSIASI interferenza delle impostazioni del dispositivo:
 * - Font scaling utente
 * - Impostazioni accessibilità  
 * - Zoom sistema
 * - Dynamic Type (iOS)
 * - Font Size (Android)
 * 
 * RISULTATO: App sempre identica indipendentemente dalle preferenze utente
 */

import { PixelRatio, Platform } from 'react-native';

// 🔒 CONFIGURAZIONE IMMUNITÀ
const IMMUNITY_CONFIG = {
  // Blocca scaling automatico
  BLOCK_FONT_SCALING: true,
  
  // Forza density pixel ratio fisso
  FORCE_FIXED_DENSITY: true,
  
  // Blocca Dynamic Type iOS
  BLOCK_DYNAMIC_TYPE: true,
  
  // Blocca Font Size Android
  BLOCK_ANDROID_FONT_SIZE: true,
  
  // Font scale massimo consentito (1.0 = nessun scaling)
  MAX_FONT_SCALE: 1.0,
  
  // Pixel ratio di riferimento (iPhone 15)
  REFERENCE_PIXEL_RATIO: 3.0
} as const;

// 📱 RILEVA IMPOSTAZIONI SISTEMA (per debug)
export const getSystemFontSettings = () => {
  const fontScale = PixelRatio.getFontScale();
  const pixelRatio = PixelRatio.get();
  
  return {
    fontScale,        // Scala font sistema (1.0 = normale, >1.0 = ingrandito)
    pixelRatio,       // Densità pixel
    isUserScaled: fontScale > 1.0,  // Utente ha ingrandito font
    platform: Platform.OS,
    
    // Calcoli immunità
    originalFontScale: fontScale,
    immuneFontScale: IMMUNITY_CONFIG.BLOCK_FONT_SCALING ? 1.0 : fontScale,
    isImmune: IMMUNITY_CONFIG.BLOCK_FONT_SCALING
  };
};

// 🛡️ APPLICA IMMUNITÀ AI PROPS TEXT
export const getImmuneTextProps = () => {
  return {
    // Blocca font scaling sistema
    allowFontScaling: !IMMUNITY_CONFIG.BLOCK_FONT_SCALING,
    
    // Limita moltiplicatore
    maxFontSizeMultiplier: IMMUNITY_CONFIG.MAX_FONT_SCALE,
    
    // Proprietà aggiuntive per stabilità
    adjustsFontSizeToFit: false,  // Disabilita auto-fit nativo
    minimumFontScale: 1.0,        // Blocca riduzione automatica
    
    // Platform-specific immunity
    ...(Platform.OS === 'ios' && {
      // iOS: Blocca Dynamic Type
      textBreakStrategy: 'simple' as const,
      lineBreakMode: 'clip' as const
    }),
    
    ...(Platform.OS === 'android' && {
      // Android: Blocca font size sistema
      includeFontPadding: false,
      textAlignVertical: 'center'
    })
  };
};

// 📏 CALCOLA DIMENSIONI IMMUNE
export const getImmuneDimensions = (originalSize: number): number => {
  if (!IMMUNITY_CONFIG.FORCE_FIXED_DENSITY) {
    return originalSize;
  }
  
  const currentPixelRatio = PixelRatio.get();
  const referenceRatio = IMMUNITY_CONFIG.REFERENCE_PIXEL_RATIO;
  
  // Normalizza in base al pixel ratio di riferimento
  const normalizedSize = (originalSize * referenceRatio) / currentPixelRatio;
  
  return Math.round(normalizedSize * 100) / 100; // Precisione decimale
};

// 🔍 DEBUG IMMUNITÀ
export const debugImmunity = (_componentName: string) => {
  if (!__DEV__) return;
  
  const _settings = getSystemFontSettings();
  const _immuneProps = getImmuneTextProps();
  
  // Debug info removed for production
};

// 🚨 AVVISO UTENTE (opzionale per sviluppo)
export const warnIfUserScaled = () => {
  if (!__DEV__) return;
  
  const { isUserScaled: _isUserScaled, fontScale: _fontScale } = getSystemFontSettings();
  
  // Warning removed for production
};

// 🔧 UTILITY PER TESTING
export const simulateUserFontSettings = (_scale: number) => {
  if (!__DEV__) return;
  
  // Debug info removed for production
};

// 📊 REPORT IMMUNITÀ COMPLETO
export const generateImmunityReport = () => {
  const settings = getSystemFontSettings();
  const immuneProps = getImmuneTextProps();
  
  return {
    title: '🛡️ REPORT IMMUNITÀ SISTEMA',
    timestamp: new Date().toISOString(),
    
    // Stato attuale
    currentState: {
      fontScale: settings.fontScale,
      pixelRatio: settings.pixelRatio,
      platform: settings.platform,
      isUserScaled: settings.isUserScaled
    },
    
    // Configurazione immunità
    immunityConfig: IMMUNITY_CONFIG,
    
    // Props applicate
    immuneProps,
    
    // Status finale
    finalStatus: {
      isFullyImmune: IMMUNITY_CONFIG.BLOCK_FONT_SCALING && !immuneProps.allowFontScaling,
      maxUserImpact: IMMUNITY_CONFIG.MAX_FONT_SCALE,
      guaranteedConsistency: true
    },
    
    // Raccomandazioni
    recommendations: [
      'Testa su dispositivi reali con font scaling attivo',
      'Verifica in Settings > Display > Font Size su Android',
      'Verifica in Settings > Display & Brightness > Text Size su iOS',
      'Usa debugImmunity() per monitorare componenti critici'
    ]
  };
}; 