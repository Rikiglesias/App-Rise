import React, { useCallback } from 'react';

import type { StoriaModalProps } from '../types';
import { modalStyles } from '../styles/modalStyles';
import { PerfectModal } from '@/components/ui/PerfectModal';
import {
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
  PerfectIcon,
} from '@/components/ui';
import { Colors } from '@/shared/constants';
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
    <PerfectModal
      visible={visible}
      onRequestClose={handleClose}
      size="large"
      padding={0}
      // Lasciamo l'overlay del PerfectModal attivo (transparent interno gestito da PerfectModal)
      // Usiamo il container del PerfectModal come card per evitare glitch di layout
      containerStyle={{
        ...modalStyles.modalContainer,
        ...modalStyles.modalCard,
      }}
      statusBarTranslucent
      animationType="fade"
    >
      {/* Wrapper con close fisso */}
      <PerfectContainer style={modalStyles.modalContent}>
        <PlatformTouchable
          onPress={handleClose}
          style={modalStyles.closeButton}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Chiudi modal"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID="storia-modal-close"
        >
          <PerfectIcon name="close" size={24} color={Colors.neutral[0]} />
        </PlatformTouchable>

        {/* Contenuto modal */}
        <PerfectContainer style={modalStyles.modalContent}>
          {/* Header */}
          <PerfectContainer style={modalStyles.modalHeader}>
            <PerfectText size={24} lines={1} style={modalStyles.modalTitle}>
              {t('about.ourStory')}
            </PerfectText>
          </PerfectContainer>

          {/* Story Content - senza ScrollView perché PerfectModal lo gestisce */}
          <PerfectContainer style={modalStyles.storyContainer}>
            <PerfectContainer style={modalStyles.introCard}>
              <PerfectText size={14} lines={2} style={modalStyles.introText}>
                {t('about.storyIntro')}
              </PerfectText>
            </PerfectContainer>

            <PerfectText size={16} lines={8} style={modalStyles.storyText}>
              {t('about.storyOrigin')}
            </PerfectText>

            <PerfectContainer style={modalStyles.sectionDivider} />

            <PerfectContainer style={modalStyles.italyCard}>
              <PerfectText size={18} lines={1} style={modalStyles.sectionTitle}>
                {t('about.inItaly')}
              </PerfectText>
              <PerfectText size={15} lines={7} style={modalStyles.cardText}>
                {t('about.italyText')}
              </PerfectText>
            </PerfectContainer>

            <PerfectContainer style={modalStyles.sectionDivider} />

            <PerfectText
              size={20}
              lines={1}
              style={modalStyles.mainSectionTitle}
            >
              {t('about.ourPillars')}
            </PerfectText>

            <PerfectContainer style={modalStyles.pillarsContainer}>
              <PerfectContainer style={modalStyles.pillarCard}>
                <PerfectText size={32} lines={1} style={modalStyles.pillarIcon}>
                  🍽️
                </PerfectText>
                <PerfectText
                  size={16}
                  lines={2}
                  style={modalStyles.pillarTitle}
                >
                  {t('about.mealDistribution')}
                </PerfectText>
                <PerfectText size={14} lines={3} style={modalStyles.pillarText}>
                  {t('about.mealDistributionText')}
                </PerfectText>
              </PerfectContainer>

              <PerfectContainer style={modalStyles.pillarCard}>
                <PerfectText size={32} lines={1} style={modalStyles.pillarIcon}>
                  🤝
                </PerfectText>
                <PerfectText
                  size={16}
                  lines={2}
                  style={modalStyles.pillarTitle}
                >
                  {t('about.communityInvolvement')}
                </PerfectText>
                <PerfectText size={14} lines={2} style={modalStyles.pillarText}>
                  {t('about.communityInvolvementText')}
                </PerfectText>
              </PerfectContainer>

              <PerfectContainer style={modalStyles.pillarCard}>
                <PerfectText size={32} lines={1} style={modalStyles.pillarIcon}>
                  🌍
                </PerfectText>
                <PerfectText
                  size={16}
                  lines={1}
                  style={modalStyles.pillarTitle}
                >
                  {t('about.globalImpact')}
                </PerfectText>
                <PerfectText size={14} lines={3} style={modalStyles.pillarText}>
                  {t('about.globalImpactText')}
                </PerfectText>
              </PerfectContainer>

              <PerfectContainer style={modalStyles.pillarCard}>
                <PerfectText size={32} lines={1} style={modalStyles.pillarIcon}>
                  🎓
                </PerfectText>
                <PerfectText
                  size={16}
                  lines={1}
                  style={modalStyles.pillarTitle}
                >
                  {t('about.education')}
                </PerfectText>
                <PerfectText size={14} lines={2} style={modalStyles.pillarText}>
                  {t('about.educationText')}
                </PerfectText>
              </PerfectContainer>
            </PerfectContainer>

            <PerfectContainer style={modalStyles.sectionDivider} />

            <PerfectContainer style={modalStyles.finalCard}>
              <PerfectText size={15} lines={4} style={modalStyles.finalMessage}>
                {t('about.finalMessage')}
              </PerfectText>
              <PerfectText
                size={16}
                lines={2}
                style={modalStyles.finalHighlight}
              >
                {t('about.joinUs')}
              </PerfectText>
            </PerfectContainer>
          </PerfectContainer>
        </PerfectContainer>
      </PerfectContainer>
    </PerfectModal>
  );
};

export default StoriaModal;
