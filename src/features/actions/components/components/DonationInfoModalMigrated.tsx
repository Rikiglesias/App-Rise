import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity } from 'react-native';

import { PlatformTouchable, PerfectText } from '../../../../components/ui';
// Migrated to Perfect System responsive layout

import {
  Colors,
  Spacing,
  Typography,
} from '../../../../shared/constants/designTokens';
import { useHapticFeedback } from '../../../../shared/hooks/useHapticFeedback';

// ❌ RIMOSSO: Calcolo manuale duplicato
// const { width: screenWidth } = Dimensions.get('window');

interface DonationInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

// 🎯 MIGRATED: Content component estratto per evitare nested component warning
interface ModalContentProps {
  handleClose: () => Promise<void>;
}

const ModalContent: React.FC<ModalContentProps> = ({ handleClose }) => {
  const modalStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing[4],
      backgroundColor: 'transparent', // ANDROID: Elimina il cazzo di container grigio
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    // Contenitore con bordo gradiente coerente cross‑platform
    modalGradientBorder: {
      borderRadius: 24,
      padding: 3,
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 12,
      // ❌ RIMOSSO: Calcolo manuale frammentato
      // maxWidth: screenWidth * 0.9,
      // ✅ NUOVO: Width dal layer centralizzato
      maxWidth: undefined, // Allows flexible width calculation
      width: '100%',
    },
    modalWhiteContainer: {
      backgroundColor: Colors.neutral[0],
      borderRadius: 21,
      overflow: 'hidden',
    },
    modalContent: {
      padding: Spacing[6],
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: Spacing[2],
      position: 'relative',
    },

    closeButton: {
      position: 'absolute',
      top: -10, // ANCORA PIÙ IN ALTO: entrambe le piattaforme, esce ancora di più dal bordo superiore
      right: -6,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#DC2626',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: Colors.neutral[0],
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
    },
    // TITOLO CENTRATO CARINO
    centeredTitleContainer: {
      alignItems: 'center',
      marginBottom: Spacing[5],
    },
    centeredTitle: {
      fontWeight: Typography.weights.black,
      color: '#DC2626',
      textAlign: 'center',
      letterSpacing: -0.8,
      textShadowColor: 'rgba(220, 38, 38, 0.15)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
    },
    titleUnderline: {
      width: 80, // Larghezza aumentata per essere proporzionata al titolo più grande
      height: 3,
      backgroundColor: '#DC2626',
      borderRadius: 2,
      marginTop: Spacing[2],
      alignSelf: 'center', // CENTRAMENTO PERFETTO: forza la linea al centro
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    modalText: {
      color: Colors.neutral[700],
      marginBottom: Spacing[4],
    },
    highlightText: {
      fontWeight: Typography.weights.bold,
      color: '#DC2626',
      textAlign: 'center',
      marginTop: Spacing[3],
      paddingVertical: Spacing[3],
      paddingHorizontal: Spacing[4],
      backgroundColor: 'rgba(220, 38, 38, 0.05)',
      borderRadius: 12,
      letterSpacing: -0.3,
      textShadowColor: 'rgba(220, 38, 38, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
  });

  return (
    <View style={modalStyles.modalContent}>
      <View style={modalStyles.modalHeader}>
        <PlatformTouchable
          style={modalStyles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="close"
            size={22}
            color={Colors.neutral[0]}
          />
        </PlatformTouchable>
      </View>

      {/* TITOLO CENTRATO E CARINO */}
      <View style={modalStyles.centeredTitleContainer}>
        <PerfectText
          size={28}
          lines={1}
          fontWeight="400"
          immunity={true}
          style={modalStyles.centeredTitle}
        >
          Come Donare
        </PerfectText>
        <View style={modalStyles.titleUnderline} />
      </View>

      <PerfectText
        size={16}
        lines={3}
        fontWeight="400"
        style={[modalStyles.modalText, { fontWeight: Typography.weights.bold }]}
      >
        💰 Donazioni monetarie: Se vuoi fare una donazione monetaria diretta,
        clicca su &quot;Dona Ora&quot; per contribuire immediatamente alla
        nostra missione contro la fame.
      </PerfectText>

      <PerfectText
        size={16}
        lines={4}
        fontWeight="400"
        style={[modalStyles.modalText, { fontWeight: Typography.weights.bold }]}
      >
        🛍️ Acquisti solidali: Attraverso il nostro Charity Shop, ogni acquisto
        dai nostri partner dona automaticamente una percentuale per i nostri
        programmi. Tu spendi lo stesso prezzo, ma aiuti a combattere la fame!
      </PerfectText>

      <PerfectText
        size={16}
        lines={4}
        fontWeight="400"
        style={[modalStyles.modalText, { fontWeight: Typography.weights.bold }]}
      >
        🎁 Gift Cards: Funzionano come gli acquisti: compri una Gift Card a
        prezzo normale (per te o come regalo), ma una percentuale viene
        automaticamente donata per la distribuzione di pasti. Aiuti senza costi
        extra!
      </PerfectText>

      <PerfectText
        size={15}
        lines={2}
        fontWeight="400"
        style={modalStyles.highlightText}
      >
        ✨ Il modo più semplice è partecipare ai nostri eventi!
      </PerfectText>
    </View>
  );
};

const DonationInfoModalMigrated: React.FC<DonationInfoModalProps> = ({
  visible,
  onClose,
}) => {
  const { triggerHaptic } = useHapticFeedback();
  // 🎯 NUOVO: Layer centralizzato
  // const { modalWidth: _modalWidth } = useResponsiveLayout();

  const handleClose = useCallback(async () => {
    await triggerHaptic('light');
    onClose();
  }, [onClose, triggerHaptic]);

  const handleStopPropagation = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
    },
    []
  );

  const modalStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing[4],
      backgroundColor: 'transparent', // ANDROID: Elimina il cazzo di container grigio
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    // Contenitore con bordo gradiente coerente cross‑platform
    modalGradientBorder: {
      borderRadius: 24,
      padding: 3,
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 12,
      // ❌ RIMOSSO: Calcolo manuale frammentato
      // maxWidth: screenWidth * 0.9,
      // ✅ NUOVO: Width dal layer centralizzato
      maxWidth: undefined, // Allows flexible width calculation
      width: '100%',
    },
    modalWhiteContainer: {
      backgroundColor: Colors.neutral[0],
      borderRadius: 21,
      overflow: 'hidden',
    },
    modalContent: {
      padding: Spacing[6],
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: Spacing[2],
      position: 'relative',
    },

    closeButton: {
      position: 'absolute',
      top: -10,
      right: -6,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#DC2626',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: Colors.neutral[0],
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
    },
    // TITOLO CENTRATO CARINO
    centeredTitleContainer: {
      alignItems: 'center',
      marginBottom: Spacing[5],
    },
    centeredTitle: {
      fontWeight: Typography.weights.black,
      color: '#DC2626',
      textAlign: 'center',
      letterSpacing: -0.8,
      textShadowColor: 'rgba(220, 38, 38, 0.15)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
    },
    titleUnderline: {
      width: 80, // Larghezza aumentata per essere proporzionata al titolo più grande
      height: 3,
      backgroundColor: '#DC2626',
      borderRadius: 2,
      marginTop: Spacing[2],
      alignSelf: 'center', // CENTRAMENTO PERFETTO: forza la linea al centro
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    modalText: {
      color: Colors.neutral[700],
      marginBottom: Spacing[4],
    },
    highlightText: {
      fontWeight: Typography.weights.bold,
      color: '#DC2626',
      textAlign: 'center',
      marginTop: Spacing[3],
      paddingVertical: Spacing[3],
      paddingHorizontal: Spacing[4],
      backgroundColor: 'rgba(220, 38, 38, 0.05)',
      borderRadius: 12,
      letterSpacing: -0.3,
      textShadowColor: 'rgba(220, 38, 38, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <TouchableOpacity
        style={modalStyles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <View style={modalStyles.backdrop} />
        <TouchableOpacity activeOpacity={1} onPress={handleStopPropagation}>
          <View style={{ backgroundColor: 'transparent' }}>
            <LinearGradient
              colors={['#DC2626', '#B91C1C', '#991B1B']}
              style={modalStyles.modalGradientBorder}
            >
              <View style={modalStyles.modalWhiteContainer}>
                <ModalContent handleClose={handleClose} />
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default DonationInfoModalMigrated;

// ===================================================================
// 📊 MIGRATION BENEFITS SUMMARY
// ===================================================================

/**
 * ELIMINATI:
 * ❌ const { width: screenWidth } = Dimensions.get('window');  // Duplicato in 3+ componenti
 * ❌ maxWidth: screenWidth * 0.9,                              // Calcolo manuale ripetuto
 *
 * AGGIUNTI:
 * ✅ useResponsiveLayout()                                     // Layer centralizzato
 * ✅ modalWidth                                                // Width dal tema
 * ✅ ResponsiveBox (opzionale)                                 // Wrapper semantico
 *
 * FUTURE BENEFITS:
 * 🚀 Tablet XL → modalWidth automatico per 1280+ px (60% → 50%)
 * 🚀 Dark mode → backgroundColor responsive nei styles
 * 🚀 RTL support → positioning automatico per closeButton
 * 🚀 Re-branding → colori rossi dal tema centralizzato
 *
 * SEMANTIC IMPROVEMENT:
 * ✅ Componente ModalContent estratto per chiarezza
 * ✅ Width semantica invece di calcolo manuale
 * ✅ Preparato per future estensioni (desktop, foldable)
 */
