import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Animated,
  Image,
  ImageStyle,
  Modal,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { PlatformTouchable } from '../ui';
import { Text } from 'react-native-paper';
import { ResponsiveText } from '../ui/ResponsiveText';
import {
  Colors,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';
import {
  type HeaderImageSectionProps,
  type HeaderMissionSectionProps,
  type HeaderTextSectionProps,
} from '../../features/home/types/HomeHeaderTypes';

// ✨ TITLE STYLES ELEGANTI - MIGLIORAMENTO SOTTILE
const modernTitleStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[0], // AZZERA PADDING: da Spacing[2] a Spacing[0] - compattezza massima
    paddingTop: Platform.OS === 'android' ? Spacing[8] : Spacing[0], // ANDROID: padding extra container
  },

  // Titolo con design compatto - ANDROID SAFE AREA FIX
  titleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing[0], // AZZERA PADDING: da Spacing[1] a Spacing[0] - ulteriore compattezza
    paddingHorizontal: Spacing[4],
    paddingTop: Platform.OS === 'android' ? Spacing[16] : Spacing[6], // ANDROID: molto più spazio per evitare status bar
    position: 'relative',
  },

  // Typography pulita e moderna - RESPONSIVE
  titleText: {
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    textAlign: 'center',
    letterSpacing: -1.3,
    // Nessuna ombra per look pulito
    includeFontPadding: false,
    marginBottom: 0, // AZZERA MARGINE: da Spacing[1]/2 a 0 - immagine attaccata al titolo
  },

  // Stile per "Italia" in nero - RESPONSIVE
  titleTextItalia: {
    fontWeight: Typography.weights.black,
    color: '#1F2937', // Nero elegante
    textAlign: 'center',
    letterSpacing: -1.3,
    includeFontPadding: false,
  },

  // Separatore elegante con logo centrale
  titleSeparator: {
    alignItems: 'center',
    marginTop: Spacing[2], // ABBASSA LINEA: da 0 a Spacing[2] - separatore più in basso
    marginBottom: Spacing[1], // MINIMO: da Spacing[2] a Spacing[1] - immagine quasi attaccata al separatore
    justifyContent: 'center',
    flexDirection: 'row',
  },

  // Logo simbolico MOLTO PROMINENTE per il separatore
  separatorLogo: {
    width: 56, // ANCORA PIÙ GRANDE: da 48 a 56 per massima visibilità
    height: 56, // ANCORA PIÙ GRANDE: da 48 a 56 per massima visibilità
    marginHorizontal: Spacing[4], // SPAZIO MANTENUTO per equilibrio perfetto
    opacity: 1, // COMPLETAMENTE VISIBILE
    // tintColor: '#DC2626', // RIMOSSO: usiamo colori originali del logo
  },

  // Linee decorative BILANCIATE con logo 56px
  separatorLine: {
    height: 2, // EQUILIBRATA per non competere col logo
    width: 110, // AUMENTATA: da 100 a 110 per bilanciare logo 56px
    backgroundColor: 'rgba(220, 38, 38, 0.6)', // COORDINATA al logo rosso
    marginHorizontal: 0, // NESSUN MARGINE - gestito dal logo
    borderRadius: 1, // SOTTILE ed elegante
    shadowColor: '#DC2626', // OMBRA COORDINATA
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

// ✨ CLEAN & MODERN TITLE COMPONENT
const ModernSmartTitle: React.FC<{
  titleAnim: Animated.Value;
  titleOpacity: Animated.AnimatedNode;
  titleTransform: Animated.AnimatedNode;
}> = React.memo(({ titleAnim, titleOpacity, titleTransform }) => {
  // Animazione semplice e professionale
  const mainTitleDelay = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const titleAnimation = Animated.timing(mainTitleDelay, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    });

    titleAnimation.start();
  }, [mainTitleDelay]);

  return (
    <View style={modernTitleStyles.container}>
      <Animated.View
        style={{
          opacity: Animated.multiply(
            Animated.multiply(titleAnim, titleOpacity as Animated.Value),
            mainTitleDelay
          ),
          transform: [
            {
              translateY: Animated.add(
                titleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
                titleTransform as Animated.Value
              ),
            },
          ],
        }}
      >
        <View style={modernTitleStyles.titleContainer}>
          {/* Titolo con colori differenziati */}
          <View>
            <ResponsiveText
              style={modernTitleStyles.titleText}
              responsiveFontSize={46}
              debugMode={false}
            >
              Rise Against{'\n'}Hunger{' '}
              <ResponsiveText
                style={modernTitleStyles.titleTextItalia}
                responsiveFontSize={46}
                debugMode={false}
              >
                Italia
              </ResponsiveText>
            </ResponsiveText>
          </View>

          {/* Separatore elegante con logo simbolico centrale */}
          <View style={modernTitleStyles.titleSeparator}>
            <View style={modernTitleStyles.separatorLine} />
            <Image
              source={require('../../../assets/icons/app/logo.png')}
              style={modernTitleStyles.separatorLogo}
              resizeMode="contain"
            />
            <View style={modernTitleStyles.separatorLine} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
});

ModernSmartTitle.displayName = 'ModernSmartTitle';

// Sub-components for max-lines-per-function compliance
export const HeaderTextSection: React.FC<HeaderTextSectionProps> = React.memo(
  ({ colors, titleAnim, titleOpacity, titleTransform, styles }) => (
    <View style={styles.headerSection}>
      <LinearGradient
        colors={[colors.primary[100], colors.primary[50], colors.neutral[50]]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.textContainer}>
        <ModernSmartTitle
          titleAnim={titleAnim}
          titleOpacity={titleOpacity}
          titleTransform={titleTransform}
        />
      </View>
    </View>
  )
);

HeaderTextSection.displayName = 'HeaderTextSection';

export const HeaderImageSection: React.FC<HeaderImageSectionProps> = React.memo(
  ({
    imageAnim,
    imageParallax,
    imageScale,
    gradientOpacity,
    imageRotation,
    styles,
  }) => {
    // Android: Rendering completamente statico per evitare artefatti
    if (Platform.OS === 'android') {
      return (
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/images/hero-banner.png')}
              style={styles.image as ImageStyle}
              resizeMode="cover"
            />
          </View>
        </View>
      );
    }

    // iOS: Mantiene tutte le animazioni
    return (
      <View style={styles.imageSection}>
        <Animated.View
          style={[
            styles.imageContainer,
            {
              opacity: imageAnim,
              transform: [
                { translateY: imageParallax },
                { scale: imageScale },
                { rotate: imageRotation },
              ],
            },
          ]}
        >
          <Image
            source={require('../../../assets/images/hero-banner.png')}
            style={styles.image as ImageStyle}
            resizeMode="cover"
          />

          <Animated.View
            style={[styles.imageGradientOverlay, { opacity: gradientOpacity }]}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.1)']}
              style={styles.flexOne}
            />
          </Animated.View>
        </Animated.View>
      </View>
    );
  }
);

HeaderImageSection.displayName = 'HeaderImageSection';

// Stili per il modal dei pasti e sezione impatto
const baseMissionStyles = StyleSheet.create({
  // Gradient Container Pattern del Design System
  outerGradientContainer: {
    marginTop: Spacing[4],
    marginHorizontal: Spacing[4],
    borderRadius: 24,
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientBorder: {
    borderRadius: 24,
    padding: 3,
  },
  missionContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 21,
    padding: Spacing[5],
  },
  // Titolo principale "Il nostro impatto sul mondo" - ROSSO

  // 🎨 NUOVI STILI GRADIENT TITLE - DESIGN SYSTEM 2025
  titleGradientContainer: {
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  // CORREZIONE UX: Stile titolo NON cliccabile - Design System
  titleContent: {
    backgroundColor: 'transparent', // Sfondo trasparente per titoli
    borderRadius: 16,
    borderWidth: 1, // Bordo sottile per separazione
    borderColor: 'rgba(220, 38, 38, 0.2)', // Bordo rosso sottile
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2] + 2,
    alignItems: 'center',
    // Elevation bassa per titoli
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Ombra leggera
    shadowRadius: 4,
    elevation: 2, // Elevation bassa
  },
  // Underline decorativo per separazione - DESIGN SYSTEM
  titleUnderline: {
    marginTop: Spacing[2],
    height: 3,
    width: 80,
    backgroundColor: '#DC2626',
    borderRadius: 2,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  impactTitleGradient: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    textAlign: 'center',
    letterSpacing: -0.8,
    textShadowColor: 'rgba(220, 38, 38, 0.25)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  // Typography Smart per il testo descrittivo - MIGLIORATO
  missionText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: '#1F2937', // Grigio scuro più elegante
    textAlign: 'center',
    letterSpacing: 0.4,
    lineHeight: Typography.sizes.lg * 1.3,
    marginBottom: Spacing[5],
    textShadowColor: 'rgba(31, 41, 55, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  statsBox: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    borderRadius: 16,
    borderWidth: 2,
    padding: Spacing[3],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  mealsBox: {
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  volunteersBox: {
    borderColor: '#1F2937',
    shadowColor: '#1F2937',
  },
  statNumber: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.black,
    color: Colors.neutral[900],
    marginBottom: Spacing[1],
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[700],
    textAlign: 'center',
  },
  infoIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // Stili per il modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[4],
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 3,
  },
  modalContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 21,
    padding: Spacing[5],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
  },
  closeButton: {
    padding: Spacing[1],
  },
  breakdownContainer: {
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  breakdownBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  breakdownText: {
    flex: 1,
  },
  breakdownNumber: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
  },
  breakdownLabel: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    marginTop: 2,
  },
  breakdownDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
    marginTop: 1,
  },
  totalContainer: {
    paddingTop: Spacing[3],
  },
  totalLine: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginBottom: Spacing[3],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutral[700],
  },
  totalNumber: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.black,
    color: '#DC2626',
  },
});

export const HeaderMissionSection: React.FC<HeaderMissionSectionProps> = ({
  styles: _styles,
  scrollY: _scrollY,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleMealsPress = React.useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const missionText =
    'Combattiamo la fame nel mondo attraverso programmi alimentari concreti, coinvolgendo comunità locali e volontari per creare un impatto duraturo.';

  return (
    <>
      {/* Container con Gradient Pattern del Design System */}
      <View style={baseMissionStyles.outerGradientContainer}>
        <LinearGradient
          colors={['#1F2937', '#374151', '#111827']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={baseMissionStyles.gradientBorder}
        >
          <View style={baseMissionStyles.missionContainer}>
            {/* CORREZIONE UX: Titolo principale SENZA GRADIENT - NON CLICCABILE */}
            <View style={baseMissionStyles.titleGradientContainer}>
              <View style={baseMissionStyles.titleContent}>
                <Text style={baseMissionStyles.impactTitleGradient}>
                  Il nostro impatto sul mondo
                </Text>
                {/* Underline decorativo per separazione - DESIGN SYSTEM */}
                <View style={baseMissionStyles.titleUnderline} />
              </View>
            </View>

            {/* Testo descrittivo con Typography Smart */}
            <Text style={baseMissionStyles.missionText}>{missionText}</Text>

            {/* Statistiche container */}
            <View style={baseMissionStyles.statsContainer}>
              {/* Container pasti - CLICKABLE */}
              <PlatformTouchable
                style={[baseMissionStyles.statsBox, baseMissionStyles.mealsBox]}
                onPress={handleMealsPress}
                activeOpacity={0.8}
              >
                <ResponsiveText
                  style={[{ fontSize: 28 }, baseMissionStyles.statNumber]}
                >
                  3.14M
                </ResponsiveText>
                <Text style={baseMissionStyles.statLabel}>
                  Pasti distribuiti
                </Text>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={20}
                  color="#DC2626"
                  style={baseMissionStyles.infoIcon}
                />
              </PlatformTouchable>

              {/* Container volontari - STATICO */}
              <View
                style={[
                  baseMissionStyles.statsBox,
                  baseMissionStyles.volunteersBox,
                ]}
              >
                <Text style={baseMissionStyles.statNumber}>13K</Text>
                <Text style={baseMissionStyles.statLabel}>
                  Volontari attivi
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Modal per la breakdown dei pasti */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={baseMissionStyles.modalOverlay}>
          <View style={baseMissionStyles.modalContainer}>
            <LinearGradient
              colors={['#DC2626', '#B91C1C', '#991B1B']}
              style={baseMissionStyles.modalGradient}
            >
              <View style={baseMissionStyles.modalContent}>
                {/* Header del modal */}
                <View style={baseMissionStyles.modalHeader}>
                  <Text style={baseMissionStyles.modalTitle}>
                    Pasti Distribuiti
                  </Text>
                  <PlatformTouchable
                    onPress={closeModal}
                    style={baseMissionStyles.closeButton}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={24}
                      color={Colors.neutral[700]}
                    />
                  </PlatformTouchable>
                </View>

                {/* Breakdown dei pasti */}
                <View style={baseMissionStyles.breakdownContainer}>
                  <View style={baseMissionStyles.breakdownItem}>
                    <View style={baseMissionStyles.breakdownBadge}>
                      <MaterialCommunityIcons
                        name="rice"
                        size={20}
                        color="#DC2626"
                      />
                    </View>
                    <View style={baseMissionStyles.breakdownText}>
                      <Text style={baseMissionStyles.breakdownNumber}>
                        2.5M
                      </Text>
                      <Text style={baseMissionStyles.breakdownLabel}>
                        Pasti completi
                      </Text>
                      <Text style={baseMissionStyles.breakdownDescription}>
                        Programmi Africa
                      </Text>
                    </View>
                  </View>

                  <View style={baseMissionStyles.breakdownItem}>
                    <View style={baseMissionStyles.breakdownBadge}>
                      <MaterialCommunityIcons
                        name="package-variant"
                        size={20}
                        color="#DC2626"
                      />
                    </View>
                    <View style={baseMissionStyles.breakdownText}>
                      <Text style={baseMissionStyles.breakdownNumber}>
                        600K
                      </Text>
                      <Text style={baseMissionStyles.breakdownLabel}>
                        Kit di emergenza
                      </Text>
                      <Text style={baseMissionStyles.breakdownDescription}>
                        Situazioni di crisi
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Totale */}
                <View style={baseMissionStyles.totalContainer}>
                  <View style={baseMissionStyles.totalLine} />
                  <View style={baseMissionStyles.totalRow}>
                    <Text style={baseMissionStyles.totalLabel}>
                      Totale distribuito
                    </Text>
                    <ResponsiveText
                      style={[{ fontSize: 32 }, baseMissionStyles.totalNumber]}
                    >
                      3.14M
                    </ResponsiveText>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </>
  );
};

HeaderMissionSection.displayName = 'HeaderMissionSection';
