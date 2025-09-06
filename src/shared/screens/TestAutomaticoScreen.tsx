import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scaleFont } from '../constants/responsiveSystem';

/**
 * 🔍 SCHERMO DEBUG FONT SIZE
 *
 * Mostra esattamente che dimensioni vengono calcolate
 * per il titolo su questo specifico dispositivo Android
 */

export const TestAutomaticoScreen: React.FC = () => {
  // iPhone 15 reference dimensions - Perfect System will handle scaling
  const screenWidth = 393;
  const screenHeight = 852;

  // 🎯 CALCOLI IDENTICI AL MODERNSMARTITLE
  const baseFontSize = 42;
  const scaledFontSize = scaleFont(baseFontSize);
  const scaleFactor = scaledFontSize / baseFontSize;

  // Calcola spacing identico al componente reale
  const containerPadding = Math.round(32 * scaleFactor);
  const stackSpacing = Math.round(8 * scaleFactor);

  // 📊 Determina categoria dispositivo
  let deviceCategory = '';
  let expectedScale = 0;

  if (screenWidth <= 375) {
    deviceCategory = 'Android Piccolo (iPhone SE size)';
    expectedScale = 0.9;
  } else if (screenWidth <= 393) {
    deviceCategory = 'Android Standard (iPhone 15 size)';
    expectedScale = 1.0;
  } else if (screenWidth <= 480) {
    deviceCategory = 'Android Grande (iPhone Plus size)';
    expectedScale = 1.15;
  } else if (screenWidth <= 600) {
    deviceCategory = 'Android Foldable/Mini Tablet';
    expectedScale = 1.25;
  } else {
    deviceCategory = 'Tablet Android (iPad size)';
    expectedScale = 1.3;
  }

  return (
    <View style={styles.container}>
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>
          🔍 DEBUG DIMENSIONI FONT - IL TUO ANDROID
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>📱 Dispositivo:</Text>
          <Text style={styles.value}>{deviceCategory}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>📏 Larghezza schermo:</Text>
          <Text style={styles.value}>{screenWidth}px</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>📐 Altezza schermo:</Text>
          <Text style={styles.value}>{screenHeight}px</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>🎯 Font base (iPhone 15):</Text>
          <Text style={styles.value}>{baseFontSize}px</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>📊 Scale factor atteso:</Text>
          <Text style={styles.value}>{expectedScale}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>📊 Scale factor reale:</Text>
          <Text style={styles.value}>{scaleFactor.toFixed(3)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>🔤 FONT TITOLO FINALE:</Text>
          <Text style={[styles.value, styles.highlight]}>
            {scaledFontSize}px
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>📏 Padding laterale:</Text>
          <Text style={styles.value}>{containerPadding}px</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>📏 Spazio tra righe:</Text>
          <Text style={styles.value}>{stackSpacing}px</Text>
        </View>
      </View>

      {/* ANTEPRIMA TITOLO REALE */}
      <View
        style={[styles.titlePreview, { paddingHorizontal: containerPadding }]}
      >
        <Text style={styles.previewLabel}>
          👀 ANTEPRIMA TITOLO (dimensioni reali):
        </Text>

        <View style={{ marginTop: stackSpacing }}>
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.8}
            style={{
              fontSize: scaledFontSize,
              lineHeight: scaleFont(48),
              fontWeight: '900',
              textAlign: 'center',
              color: '#1F2937',
            }}
          >
            Rise Against
          </Text>

          <Text
            allowFontScaling={false}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.8}
            style={{
              fontSize: scaledFontSize,
              lineHeight: scaleFont(48),
              fontWeight: '900',
              textAlign: 'center',
              color: '#DC2626',
              marginTop: stackSpacing,
            }}
          >
            <Text style={{ color: '#DC2626' }}>Hunger </Text>
            <Text style={{ color: '#1F2937' }}>Italia</Text>
          </Text>
        </View>
      </View>

      {/* COMPARAZIONE DIMENSIONI */}
      <View style={styles.comparisonContainer}>
        <Text style={styles.comparisonTitle}>
          📊 COMPARAZIONE CROSS-PLATFORM:
        </Text>

        <Text style={styles.comparisonText}>
          • iPhone SE (375px): 42px → 38px (-9%)
        </Text>
        <Text style={styles.comparisonText}>
          • iPhone 15 (393px): 42px → 42px (0%)
        </Text>
        <Text style={[styles.comparisonText, styles.currentDevice]}>
          • Il tuo Android ({screenWidth}px): 42px → {scaledFontSize}px (
          {(((scaledFontSize - 42) / 42) * 100).toFixed(0)}%)
        </Text>
        <Text style={styles.comparisonText}>
          • iPad (768px): 42px → 55px (+31%)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },

  debugContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  debugTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },

  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
    textAlign: 'right',
  },

  highlight: {
    fontSize: 16,
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },

  titlePreview: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#059669',
  },

  previewLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
    textAlign: 'center',
  },

  comparisonContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FECACA',
  },

  comparisonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 12,
  },

  comparisonText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
    paddingLeft: 8,
  },

  currentDevice: {
    fontWeight: 'bold',
    color: '#DC2626',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginVertical: 2,
  },
});

export default TestAutomaticoScreen;
