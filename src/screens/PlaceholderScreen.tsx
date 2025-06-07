import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, keyof RootStackParamList>;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

const PlaceholderScreen: React.FC<Props> = ({
  navigation,
  title,
  subtitle,
  icon,
  color,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <Text style={styles.message}>
          Questa sezione sarà disponibile presto!
        </Text>

        <Text style={styles.description}>
          Stiamo lavorando per portarti nuove funzionalità che ti aiuteranno a
          supportare al meglio la nostra missione contro la fame nel mondo.
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: color }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>← Torna alla Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 40,
  },
  message: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PlaceholderScreen;
