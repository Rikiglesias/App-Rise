import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getDatabaseDeviceInfo } from '../shared/utils/UniversalMillimetricSystem';
import ResponsiveSystem from '../shared/constants/responsiveSystem';
import {
  getAllDevicesFlat,
  getDatabaseStats,
} from '../shared/constants/deviceResolutionsDatabase';

const DatabaseConnectionTest = () => {
  const universalInfo = getDatabaseDeviceInfo();
  const responsiveInfo = ResponsiveSystem.getDatabaseDeviceInfo();
  const databaseStats = getDatabaseStats();
  const allDevices = getAllDevicesFlat();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 DATABASE CONNECTION TEST</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 UniversalMillimetricSystem</Text>
        <Text style={styles.info}>
          Current Width: {universalInfo.currentWidth}px
        </Text>
        <Text style={styles.info}>
          Reference Width: {universalInfo.referenceWidth}px
        </Text>
        <Text style={styles.info}>
          Connected: {universalInfo.isConnectedToDatabase ? '✅ YES' : '❌ NO'}
        </Text>
        <Text style={styles.info}>
          Matched Devices: {universalInfo.matchingDevices?.length || 0}
        </Text>
        {universalInfo.matchingDevices?.map(device => (
          <Text
            key={`${device.brand}-${device.model}-${device.width}`}
            style={styles.deviceInfo}
          >
            • {device.brand} {device.model} ({device.width}×{device.height})
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 ResponsiveSystem</Text>
        <Text style={styles.info}>
          Current Width: {responsiveInfo.currentWidth}px
        </Text>
        <Text style={styles.info}>
          Reference Width: {responsiveInfo.referenceWidth}px
        </Text>
        <Text style={styles.info}>
          Device Known: {responsiveInfo.isDeviceKnown ? '✅ YES' : '❌ NO'}
        </Text>
        <Text style={styles.info}>
          Matched Devices: {responsiveInfo.matchedDevices?.length || 0}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Database Statistics</Text>
        <Text style={styles.info}>
          Total Devices: {databaseStats.totalDevices}
        </Text>
        <Text style={styles.info}>
          Total Market Share: {databaseStats.totalMarketShare}%
        </Text>
        <Text style={styles.info}>Total Brands: {databaseStats.topBrands}</Text>

        <Text style={styles.subTitle}>Devices by Year:</Text>
        {Object.entries(databaseStats.devicesByYear).map(([year, count]) => (
          <Text key={year} style={styles.yearInfo}>
            {year}: {count} devices
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔢 Quick Numbers</Text>
        <Text style={styles.info}>
          Apple Devices: {allDevices.filter(d => d.brand === 'Apple').length}
        </Text>
        <Text style={styles.info}>
          Samsung Devices:{' '}
          {allDevices.filter(d => d.brand === 'Samsung').length}
        </Text>
        <Text style={styles.info}>
          Google Pixels: {allDevices.filter(d => d.brand === 'Google').length}
        </Text>
        <Text style={styles.info}>
          Foldable Devices: {allDevices.filter(d => d.width > 1500).length}
        </Text>
        <Text style={styles.info}>
          Entry-Level (720px): {allDevices.filter(d => d.width === 720).length}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ CONNECTION STATUS</Text>
        <Text
          style={[
            styles.status,
            universalInfo.isConnectedToDatabase
              ? styles.connected
              : styles.disconnected,
          ]}
        >
          {universalInfo.isConnectedToDatabase
            ? '🟢 SISTEMA COLLEGATO AL DATABASE'
            : '🔴 SISTEMA NON COLLEGATO'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2196F3',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#666',
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
    color: '#444',
  },
  deviceInfo: {
    fontSize: 12,
    marginLeft: 10,
    marginBottom: 3,
    color: '#666',
  },
  yearInfo: {
    fontSize: 12,
    marginLeft: 15,
    marginBottom: 2,
    color: '#777',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    borderRadius: 5,
  },
  connected: {
    backgroundColor: '#E8F5E8',
    color: '#2E7D32',
  },
  disconnected: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  },
});

export default DatabaseConnectionTest;
