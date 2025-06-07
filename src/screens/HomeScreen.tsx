import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const menuItems = [
    {
      title: 'Progetti',
      subtitle: 'Scopri i nostri progetti attivi',
      icon: '🏗️',
      onPress: () => navigation.navigate('Progetti'),
      color: '#FF6B35',
    },
    {
      title: 'Charity Shop',
      subtitle: 'Acquista prodotti solidali',
      icon: '🛍️',
      onPress: () => navigation.navigate('CharityShop'),
      color: '#4ECDC4',
    },
    {
      title: 'Charity Gift Card',
      subtitle: 'Regala solidarietà',
      icon: '🎁',
      onPress: () => navigation.navigate('CharityGiftCard'),
      color: '#45B7D1',
    },
    {
      title: 'Calendario',
      subtitle: 'Eventi e appuntamenti',
      icon: '📅',
      onPress: () => navigation.navigate('Calendario'),
      color: '#96CEB4',
    },
    {
      title: 'Seguici',
      subtitle: 'Social media e aggiornamenti',
      icon: '📱',
      onPress: () => navigation.navigate('Seguici'),
      color: '#FCEA2B',
    },
    {
      title: 'Tracciabilità',
      subtitle: "Segui l'impatto delle donazioni",
      icon: '📊',
      onPress: () => navigation.navigate('Tracciabilita'),
      color: '#FF8B94',
    },
    {
      title: 'Chi Siamo',
      subtitle: 'La nostra mission e storia',
      icon: '👥',
      onPress: () => navigation.navigate('ChiSiamo'),
      color: '#B565A7',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🍽️</Text>
          </View>
          <Text style={styles.title}>Rise Against Hunger</Text>
          <Text style={styles.subtitle}>Italia</Text>
          <Text style={styles.tagline}>
            Unisciti a noi nella lotta contro la fame nel mondo
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderLeftColor: item.color }]}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>{item.icon}</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Insieme possiamo fare la differenza
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  menuContainer: {
    paddingHorizontal: 15,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 5,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  arrow: {
    fontSize: 24,
    color: '#BDC3C7',
    fontWeight: '300',
  },
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default HomeScreen;
