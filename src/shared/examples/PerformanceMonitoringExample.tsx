/**
 * Esempio di Implementazione Performance Monitoring
 * Dimostra come integrare il monitoraggio performance nei componenti
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  usePerformanceTracking,
  useAutoPerformanceTracking,
  getGlobalPerformanceMonitor,
} from '../hooks/usePerformanceTracking';

const buildItemKey = (value: number, idx: number) =>
  `${value.toFixed(6)}-${idx}`;

// Componente con tracking manuale completo
const ManualPerformanceComponent: React.FC = () => {
  const [data, setData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    trackRender,
    trackNetworkRequest,
    trackUserInteraction,
    trackMemoryUsage,
    isEnabled,
  } = usePerformanceTracking({
    componentName: 'ManualPerformanceComponent',
    enableMemoryTracking: true,
    enableRenderTracking: true,
  });

  // Track render manualmente
  useEffect(() => {
    if (!isEnabled) return;

    const stopTracking = trackRender();
    return stopTracking;
  });

  // Simula operazione pesante
  const handleHeavyOperation = () => {
    trackUserInteraction('heavy_operation_start');

    setIsLoading(true);

    // Simula operazione computazionale pesante
    setTimeout(() => {
      const newData = Array.from({ length: 1000 }, (_, i) => Math.random() * i);
      setData(newData);
      setIsLoading(false);

      trackUserInteraction('heavy_operation_complete', 1000);
      trackMemoryUsage(); // Controlla memoria dopo operazione pesante
    }, 1000);
  };

  // Simula network request
  const handleNetworkRequest = async () => {
    const endTracking = trackNetworkRequest(
      'https://api.example.com/data',
      'GET'
    );

    try {
      // Simula network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      endTracking(200, 1024); // Success con 1KB di dati

      trackUserInteraction('network_request_success');
    } catch (error) {
      endTracking(500); // Error
      trackUserInteraction('network_request_error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manual Performance Tracking</Text>
      <Text style={styles.subtitle}>
        Monitoring: {isEnabled ? 'Enabled' : 'Disabled'}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleHeavyOperation}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Processing...' : 'Heavy Operation'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleNetworkRequest}>
        <Text style={styles.buttonText}>Network Request</Text>
      </TouchableOpacity>

      <ScrollView style={styles.dataContainer}>
        {data.map((item, index) => (
          <Text key={buildItemKey(item, index)} style={styles.dataItem}>
            Item {index}: {item.toFixed(2)}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

// Componente con tracking automatico
const AutoPerformanceComponent: React.FC = () => {
  const [counter, setCounter] = useState(0);

  const { trackUserInteraction, isEnabled } = useAutoPerformanceTracking(
    'AutoPerformanceComponent'
  );

  const handleIncrement = () => {
    setCounter(prev => prev + 1);
    trackUserInteraction('counter_increment');
  };

  const handleDecrement = () => {
    setCounter(prev => prev - 1);
    trackUserInteraction('counter_decrement');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auto Performance Tracking</Text>
      <Text style={styles.subtitle}>
        Monitoring: {isEnabled ? 'Enabled' : 'Disabled'}
      </Text>

      <Text style={styles.counter}>Counter: {counter}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.smallButton} onPress={handleDecrement}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButton} onPress={handleIncrement}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Componente per visualizzare metriche performance
const PerformanceMetricsDisplay: React.FC = () => {
  const [metrics, setMetrics] = useState<string>('No metrics available');

  const refreshMetrics = () => {
    const monitor = getGlobalPerformanceMonitor();
    if (monitor) {
      const report = monitor.getPerformanceReport();
      setMetrics(JSON.stringify(report, null, 2));
    }
  };

  const clearMetrics = () => {
    const monitor = getGlobalPerformanceMonitor();
    if (monitor) {
      monitor.clearMetrics();
      setMetrics('Metrics cleared');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance Metrics</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.smallButton} onPress={refreshMetrics}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButton} onPress={clearMetrics}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.metricsContainer}>
        <Text style={styles.metricsText}>{metrics}</Text>
      </ScrollView>
    </View>
  );
};

// Componente principale di esempio
const PerformanceMonitoringExample: React.FC = () => {
  return (
    <ScrollView style={styles.mainContainer}>
      <Text style={styles.mainTitle}>Performance Monitoring Examples</Text>

      <ManualPerformanceComponent />
      <AutoPerformanceComponent />
      <PerformanceMetricsDisplay />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  container: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
    alignItems: 'center',
  },
  smallButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  counter: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  dataContainer: {
    maxHeight: 200,
    marginTop: 16,
  },
  dataItem: {
    padding: 4,
    fontSize: 12,
    color: '#666',
  },
  metricsContainer: {
    maxHeight: 300,
    marginTop: 16,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 4,
  },
  metricsText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#333',
  },
});

export default PerformanceMonitoringExample;
