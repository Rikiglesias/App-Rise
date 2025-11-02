import React from 'react';

import { contactSectionStyles } from '../styles/contactStyles';
import type { ContactSectionProps } from '../types';
import { AnimatedContact } from './AnimatedContact';
import { PerfectText, PerfectContainer } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';

export const ContactSection: React.FC<ContactSectionProps> = ({ contacts }) => {
  return (
    <PerfectContainer
      style={contactSectionStyles.categoryContainer} // marginBottom rimane qui (non prop disponibile)
    >
      {/* HEADER SENZA CONTAINER */}
      <PerfectContainer style={contactSectionStyles.categoryHeader}>
        <PerfectText
          size={30}
          lines={1}
          fontWeight="700"
          style={contactSectionStyles.categoryTitle}
        >
          I Nostri Contatti
        </PerfectText>
        <PerfectText
          size={15}
          lines={2}
          fontWeight="500"
          style={contactSectionStyles.descriptionText}
        >
          Sede di Bologna e recapiti ufficiali
        </PerfectText>
      </PerfectContainer>
      <PerfectContainer
        paddingHorizontal={PerfectSpacing.md}
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
