import React, { useMemo } from 'react';

import { createContactSectionStyles } from '../styles/contactStyles';
import type { ContactSectionProps } from '../types';
import { AnimatedContact } from './AnimatedContact';
import { PerfectText, PerfectContainer } from '@/components/ui';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { PerfectSpacing } from '@/shared/constants';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

export const ContactSection: React.FC<ContactSectionProps> = ({ contacts }) => {
  const { t } = useTranslation();
  const { isTablet } = useDeviceType();
  const colors = useThemeColors();
  const contactSectionStyles = useMemo(
    () => createContactSectionStyles(colors),
    [colors]
  );

  return (
    <PerfectContainer
      style={contactSectionStyles.categoryContainer} // marginBottom rimane qui (non prop disponibile)
    >
      {/* HEADER PULITO - Solo titolo per miglior flusso visivo */}
      <PerfectContainer
        style={[
          contactSectionStyles.categoryHeader,
          isTablet ? { paddingHorizontal: 0 } : {},
        ]}
      >
        <PerfectText
          size={28}
          lines={1}
          fontWeight="700"
          style={contactSectionStyles.categoryTitle}
        >
          {t('about.contactsTitle')}
        </PerfectText>
      </PerfectContainer>
      <PerfectContainer
        paddingHorizontal={isTablet ? 0 : PerfectSpacing.md}
        paddingVertical={PerfectSpacing.sm}
        style={contactSectionStyles.contactsGrid}
      >
        {contacts.map(contact => (
          <AnimatedContact key={contact.id} contact={contact} />
        ))}
      </PerfectContainer>
    </PerfectContainer>
  );
};
