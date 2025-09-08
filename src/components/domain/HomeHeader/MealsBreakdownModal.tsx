/**
 * MEALS BREAKDOWN MODAL - Componente modulare
 * Modal per la breakdown dettagliata dei pasti distribuiti
 */

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, View } from 'react-native';

import { PlatformTouchable, PerfectText } from '../../ui';
import { Colors } from '../../../shared/constants/designTokens';
import { HomeHeaderDesignTokens } from '../design-tokens/HomeHeaderTokens';
import { baseMissionStyles } from '../styles/HeaderMissionStyles';

interface MealsBreakdownModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const MealsBreakdownModal: React.FC<MealsBreakdownModalProps> =
  React.memo(({ isVisible, onClose }) => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={baseMissionStyles.modalOverlay}>
        <View style={baseMissionStyles.modalContainer}>
          <LinearGradient
            colors={HomeHeaderDesignTokens.gradients.primary}
            style={baseMissionStyles.modalGradient}
          >
            <View style={baseMissionStyles.modalContent}>
              {/* Header del modal */}
              <View style={baseMissionStyles.modalHeader}>
                <PerfectText
                  size={24}
                  lines={1}
                  immunity={true}
                  style={baseMissionStyles.modalTitle}
                >
                  Pasti Distribuiti
                </PerfectText>
                <PlatformTouchable
                  onPress={onClose}
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
                      color={HomeHeaderDesignTokens.colors.primary}
                    />
                  </View>
                  <View style={baseMissionStyles.breakdownText}>
                    <PerfectText
                      size={18}
                      lines={1}
                      immunity={true}
                      style={baseMissionStyles.breakdownNumber}
                    >
                      2.5M
                    </PerfectText>
                    <PerfectText
                      size={14}
                      lines={1}
                      immunity={true}
                      style={baseMissionStyles.breakdownLabel}
                    >
                      Pasti completi
                    </PerfectText>
                    <PerfectText
                      size={12}
                      lines={1}
                      immunity={true}
                      style={baseMissionStyles.breakdownDescription}
                    >
                      Programmi Africa
                    </PerfectText>
                  </View>
                </View>

                <View style={baseMissionStyles.breakdownItem}>
                  <View style={baseMissionStyles.breakdownBadge}>
                    <MaterialCommunityIcons
                      name="package-variant"
                      size={20}
                      color={HomeHeaderDesignTokens.colors.primary}
                    />
                  </View>
                  <View style={baseMissionStyles.breakdownText}>
                    <PerfectText
                      size={18}
                      lines={1}
                      immunity={true}
                      style={baseMissionStyles.breakdownNumber}
                    >
                      600K
                    </PerfectText>
                    <PerfectText
                      size={14}
                      lines={1}
                      immunity={true}
                      style={baseMissionStyles.breakdownLabel}
                    >
                      Kit di emergenza
                    </PerfectText>
                    <PerfectText
                      size={12}
                      lines={1}
                      immunity={true}
                      style={baseMissionStyles.breakdownDescription}
                    >
                      Situazioni di crisi
                    </PerfectText>
                  </View>
                </View>
              </View>

              {/* Totale */}
              <View style={baseMissionStyles.totalContainer}>
                <View style={baseMissionStyles.totalLine} />
                <View style={baseMissionStyles.totalRow}>
                  <PerfectText
                    size={14}
                    lines={1}
                    immunity={true}
                    style={baseMissionStyles.totalLabel}
                  >
                    Totale distribuito
                  </PerfectText>
                  <PerfectText
                    size={24}
                    lines={1}
                    immunity={true}
                    style={baseMissionStyles.totalNumber}
                  >
                    3.14M
                  </PerfectText>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  ));

MealsBreakdownModal.displayName = 'MealsBreakdownModal';
