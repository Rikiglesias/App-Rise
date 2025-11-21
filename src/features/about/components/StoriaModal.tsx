import React, { useCallback } from 'react';
import { Modal, ScrollView, View, StyleSheet } from 'react-native';

import type { StoriaModalProps } from '../types';
import { modalStyles } from '../styles/modalStyles';
import {
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
  PerfectIcon,
} from '@/components/ui';
import { Colors, PerfectSpacing } from '@/shared/constants';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';

export const StoriaModal: React.FC<StoriaModalProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  const { triggerHaptic } = useHapticFeedback();

  const handleClose = useCallback(async () => {
    await triggerHaptic('light');
    onClose();
  }, [onClose, triggerHaptic]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={modalStyles.overlay}>
        <PlatformTouchable
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
          activeOpacity={1}
        />
        <View 
          style={modalStyles.modalContainer}
          pointerEvents="box-none"
        >
          <View 
            style={modalStyles.modalCard}
            pointerEvents="auto"
          >
            {/* Close button fisso */}
            <PlatformTouchable
              onPress={handleClose}
              style={modalStyles.closeButton}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Chiudi modal"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              testID="storia-modal-close"
            >
              <PerfectIcon name="close" color={Colors.neutral[0]} />
            </PlatformTouchable>

            {/* Contenuto modal */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: PerfectSpacing['5xl'] }}
              showsVerticalScrollIndicator={true}
            >
        {/* Header */}
        <PerfectContainer style={modalStyles.modalHeader}>
          <PerfectText size={24} lines={1} style={modalStyles.modalTitle}>
            {t('about.ourStory')}
          </PerfectText>
        </PerfectContainer>

        {/* Story Content - senza ScrollView perché PerfectModal lo gestisce */}
        <PerfectContainer style={modalStyles.storyContainer}>
          <PerfectContainer style={modalStyles.introCard}>
            <PerfectText size={14} lines={0} style={modalStyles.introText}>
              {t('about.storyIntro')}
            </PerfectText>
          </PerfectContainer>

          <PerfectText size={15} lines={0} style={modalStyles.storyText}>
            {t('about.storyOrigin')}
          </PerfectText>

          <PerfectContainer style={modalStyles.sectionDivider} />

          <PerfectContainer style={modalStyles.italyCard}>
            <PerfectText size={18} lines={1} style={modalStyles.sectionTitle}>
              {t('about.inItaly')}
            </PerfectText>
            <PerfectText size={14} lines={0} style={modalStyles.cardText}>
              {t('about.italyText')}
            </PerfectText>
          </PerfectContainer>

          <PerfectContainer style={modalStyles.sectionDivider} />

          <PerfectText size={20} lines={1} style={modalStyles.mainSectionTitle}>
            {t('about.ourPillars')}
          </PerfectText>

          <PerfectContainer style={modalStyles.pillarsContainer}>
            <PerfectContainer style={modalStyles.pillarCard}>
              <PerfectText size={32} lines={1} style={modalStyles.pillarIcon}>
                🍽️
              </PerfectText>
              <PerfectText size={16} lines={0} style={modalStyles.pillarTitle}>
                {t('about.mealDistribution')}
              </PerfectText>
              <PerfectText size={13} lines={0} style={modalStyles.pillarText}>
                {t('about.mealDistributionText')}
              </PerfectText>
            </PerfectContainer>

            <PerfectContainer style={modalStyles.pillarCard}>
              <PerfectText size={32} lines={1} style={modalStyles.pillarIcon}>
                🤝
              </PerfectText>
              <PerfectText size={16} lines={0} style={modalStyles.pillarTitle}>
                {t('about.communityInvolvement')}
              </PerfectText>
              <PerfectText size={13} lines={0} style={modalStyles.pillarText}>
                {t('about.communityInvolvementText')}
              </PerfectText>
            </PerfectContainer>

            <PerfectContainer style={modalStyles.pillarCard}>
              <PerfectText size={32} lines={1} style={modalStyles.pillarIcon}>
                🌍
              </PerfectText>
              <PerfectText size={16} lines={0} style={modalStyles.pillarTitle}>
                {t('about.globalImpact')}
              </PerfectText>
              <PerfectText size={13} lines={0} style={modalStyles.pillarText}>
                {t('about.globalImpactText')}
              </PerfectText>
            </PerfectContainer>

            <PerfectContainer style={modalStyles.pillarCard}>
              <PerfectText size={32} lines={1} style={modalStyles.pillarIcon}>
                🎓
              </PerfectText>
              <PerfectText size={16} lines={0} style={modalStyles.pillarTitle}>
                {t('about.education')}
              </PerfectText>
              <PerfectText size={13} lines={0} style={modalStyles.pillarText}>
                {t('about.educationText')}
              </PerfectText>
            </PerfectContainer>
          </PerfectContainer>

          <PerfectContainer style={modalStyles.sectionDivider} />

          <PerfectContainer style={modalStyles.finalCard}>
            <PerfectText size={14} lines={0} style={modalStyles.finalMessage}>
              {t('about.finalMessage')}
            </PerfectText>
            <PerfectText size={15} lines={0} style={modalStyles.finalHighlight}>
              {t('about.joinUs')}
            </PerfectText>
          </PerfectContainer>
        </PerfectContainer>
      </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default StoriaModal;
