import React from 'react';

import { contactSectionStyles } from '../styles/contactStyles';
import type { ContactSectionProps } from '../types';
import { AnimatedContact } from './AnimatedContact';
import { PerfectText, PerfectContainer } from '@/components/ui';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { PerfectSpacing } from '@/shared/constants';
import { useDeviceType } from '@/shared/hooks/useDeviceType';

export const ContactSection: React.FC<ContactSectionProps> = ({ contacts }) => {
  const { t } = useTranslation();
  const { isTablet } = useDeviceType();

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
