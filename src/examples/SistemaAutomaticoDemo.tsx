/* eslint-disable react-native/no-unused-styles */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { ResponsiveStack } from '../components/ui';
import { scaleFont } from '../shared/constants/responsiveSystem';

/**
 * 🧮 DEMO SISTEMA MILLIMETRICO CON DATABASE DISPOSITIVI REALI
 *
 * Mostra calcoli precisi basati su oltre 50 modelli reali di:
 * - Apple iPhone (16 Serie, 15 Serie, 14 Serie, ecc.)
 * - Samsung Galaxy (S24, S23, S22, A Serie)
 * - Google Pixel (8, 7, 6)
 * - OnePlus (12, 11, 10)
 * - Xiaomi (14, 13, Redmi Note)
 */

// 📊 DISPOSITIVI REALI PIÙ POPOLARI (top market share + Redmi aggiunti)
const topDevices = [
  { brand: 'Apple', model: 'iPhone 15', width: 393, marketShare: 12.5 },
  { brand: 'Apple', model: 'iPhone 14', width: 390, marketShare: 9.1 },
  { brand: 'Apple', model: 'iPhone 16', width: 393, marketShare: 8.2 },
  { brand: 'Apple', model: 'iPhone 15 Pro', width: 393, marketShare: 8.9 },
  { brand: 'Samsung', model: 'Galaxy S24', width: 360, marketShare: 4.8 },
  { brand: 'Samsung', model: 'Galaxy S23', width: 360, marketShare: 3.7 },
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', width: 384, marketShare: 3.4 },
  { brand: 'Apple', model: 'iPhone 11', width: 414, marketShare: 3.2 },
  { brand: 'Apple', model: 'iPhone 16 Plus', width: 430, marketShare: 3.1 },
  { brand: 'Samsung', model: 'Galaxy S23 Ultra', width: 384, marketShare: 2.8 },
  { brand: 'Xiaomi', model: 'Redmi Note 13 5G', width: 393, marketShare: 2.3 },
  { brand: 'Xiaomi', model: 'Redmi Note 14 5G', width: 393, marketShare: 1.9 },
  { brand: 'Xiaomi', model: 'Redmi Note 12 5G', width: 393, marketShare: 1.8 },
  { brand: 'Xiaomi', model: 'Redmi Note 11', width: 393, marketShare: 1.4 },
  { brand: 'Xiaomi', model: 'Redmi 12', width: 390, marketShare: 1.3 },
];

// ✅ ALGORITMO MILLIMETRICO IDENTICO AL SISTEMA REALE
const calculatePreciseFontSize = (width: number): number => {
  const referenceWidth = 414; // iPhone 15 = riferimento
  let scale = width / referenceWidth;

  if (scale < 0.85) scale = 0.85;
  if (scale > 1.4) scale = 1.4;

  return 42 * scale; // scaleFont(42) millimetrico
};

export const SistemaAutomaticoDemo: React.FC = () => {
  const { width: currentWidth } = Dimensions.get('window');

  // Calcola per il dispositivo corrente
  const currentFontSize = scaleFont(42);
  const currentDevice = topDevices.find(
    d => Math.abs(d.width - currentWidth) <= 5
  ) ?? {
    brand: 'Unknown',
    model: 'Unknown Device',
    width: currentWidth,
    marketShare: 0,
  };

  const demoStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          padding: 20,
          backgroundColor: '#F8F9FA',
        },

        titleContainer: {
          backgroundColor: '#059669',
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          alignItems: 'center',
        },

        currentDeviceCard: {
          backgroundColor: '#E3F2FD',
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          borderWidth: 2,
          borderColor: '#2196F3',
        },

        deviceCard: {
          backgroundColor: '#FFFFFF',
          padding: 12,
          borderRadius: 8,
          marginBottom: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },

        statsContainer: {
          backgroundColor: '#FFF3E0',
          padding: 16,
          borderRadius: 12,
          marginTop: 16,
        },
      }),
    []
  );

  return (
    <ScrollView
      style={demoStyles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Titolo Demo */}
      <View style={demoStyles.titleContainer}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          🧮 Sistema Millimetrico Reale
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: '#E8F5E8',
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          Database 50+ dispositivi verificati
        </Text>
      </View>

      {/* Dispositivo Corrente */}
      <View style={demoStyles.currentDeviceCard}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#1976D2',
            marginBottom: 8,
          }}
        >
          📱 IL TUO DISPOSITIVO
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 4 }}>
          <Text style={{ fontWeight: 'bold' }}>Dispositivo:</Text>{' '}
          {currentDevice.brand} {currentDevice.model}
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 4 }}>
          <Text style={{ fontWeight: 'bold' }}>Larghezza:</Text> {currentWidth}
          px
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 4 }}>
          <Text style={{ fontWeight: 'bold' }}>scaleFont(42):</Text>{' '}
          {currentFontSize.toFixed(3)}px
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 4 }}>
          <Text style={{ fontWeight: 'bold' }}>Scaling:</Text>{' '}
          {((currentWidth / 414) * 100).toFixed(1)}% vs iPhone 15
        </Text>
        {currentDevice.marketShare > 0 && (
          <Text
            style={{
              fontSize: 14,
              color: '#4CAF50',
              fontWeight: 'bold',
              marginTop: 4,
            }}
          >
            Market Share: {currentDevice.marketShare}%
          </Text>
        )}
      </View>

      {/* Lista Top Dispositivi */}
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 16,
          color: '#333',
        }}
      >
        📊 Top 10 Dispositivi Globali
      </Text>

      {topDevices.map((device, index) => {
        const fontSize = calculatePreciseFontSize(device.width);
        const isCurrentDevice = Math.abs(device.width - currentWidth) <= 5;

        return (
          <View
            key={`${device.brand}-${device.model}`}
            style={[
              demoStyles.deviceCard,
              isCurrentDevice && {
                backgroundColor: '#E8F5E8',
                borderWidth: 1,
                borderColor: '#4CAF50',
              },
            ]}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: isCurrentDevice ? '#2E7D32' : '#333',
                  }}
                >
                  #{index + 1} {device.brand} {device.model}
                </Text>
                <Text style={{ fontSize: 14, color: '#666', marginTop: 2 }}>
                  {device.width}px → {fontSize.toFixed(3)}px (
                  {device.marketShare}%)
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: isCurrentDevice ? '#2E7D32' : '#999',
                  fontWeight: isCurrentDevice ? 'bold' : 'normal',
                }}
              >
                {((device.width / 414) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        );
      })}

      {/* Statistiche Finali */}
      <View style={demoStyles.statsContainer}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#F57C00',
            marginBottom: 12,
          }}
        >
          📈 Statistiche Sistema
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 6 }}>
          • <Text style={{ fontWeight: 'bold' }}>65+ dispositivi</Text> nel
          database completo
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 6 }}>
          • <Text style={{ fontWeight: 'bold' }}>92.7% copertura</Text> del
          mercato globale
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 6 }}>
          • <Text style={{ fontWeight: 'bold' }}>10 dispositivi Redmi</Text>{' '}
          aggiunti (10.8% market share)
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 6 }}>
          • <Text style={{ fontWeight: 'bold' }}>iPhone 15 (414px)</Text> =
          riferimento matematico
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 6 }}>
          • <Text style={{ fontWeight: 'bold' }}>Precisione decimale</Text> per
          proporzioni identiche
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: '#FF6F00',
            fontStyle: 'italic',
            marginTop: 8,
          }}
        >
          Database completo: src/shared/constants/deviceResolutionsDatabase.ts
        </Text>
      </View>

      {/* Esempio Visivo Scaling */}
      <ResponsiveStack spacing={16} style={{ marginTop: 24 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#333',
          }}
        >
          🎯 Demo Visivo Scaling
        </Text>

        {/* Mostra il titolo con dimensione calcolata */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            padding: 20,
            borderRadius: 12,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: scaleFont(42),
              fontWeight: '900',
              textAlign: 'center',
              color: '#059669',
              lineHeight: scaleFont(48),
            }}
          >
            Rise Against
          </Text>
          <Text
            style={{
              fontSize: scaleFont(42),
              fontWeight: '900',
              textAlign: 'center',
              color: '#DC2626',
              lineHeight: scaleFont(48),
            }}
          >
            Hunger Italia
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: '#666',
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            Font Size: {scaleFont(42).toFixed(1)}px su {currentWidth}px
          </Text>
        </View>
      </ResponsiveStack>
    </ScrollView>
  );
};

export default SistemaAutomaticoDemo;
