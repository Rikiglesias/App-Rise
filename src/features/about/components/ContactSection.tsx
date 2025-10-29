import React from 'react';

import { PerfectText, PerfectContainer } from '@/components/ui';

import { contactSectionStyles } from '../styles/contactStyles';
import type { ContactSectionProps } from '../types';
import { AnimatedContact } from './AnimatedContact';

export const ContactSection: React.FC<ContactSectionProps> = ({
  contacts,
}) => {
  return (
    <PerfectContainer 
      style={contactSectionStyles.categoryContainer}  // marginBottom rimane qui (non prop disponibile)
    >
      {/* HEADER SENZA ANIMAZIONI */}
      <PerfectContainer 
        style={contactSectionStyles.categoryHeader}  // marginBottom rimane qui
      >
        <PerfectContainer 
          paddingVertical={8}  // ✅ Spacing[2] - SCALA!
          paddingHorizontal={12}  // ✅ Spacing[3] - SCALA!
          style={contactSectionStyles.exploreHeaderContainer}
        >
          <PerfectText
            size={30}
            lines={1}
            fontWeight="400"
            style={contactSectionStyles.categoryTitle}
          >
            I Nostri Contatti
          </PerfectText>
          <PerfectText
            size={15}
            lines={2}
            fontWeight="400"
            style={contactSectionStyles.exploreSubtitleInline}
          >
            Sede di Bologna e recapiti ufficiali
          </PerfectText>
        </PerfectContainer>
      </PerfectContainer>
      <PerfectContainer 
        paddingHorizontal={12}  // ✅ Spacing[3] - SCALA!
        paddingVertical={8}  // ✅ Spacing[2] - SCALA!
        style={contactSectionStyles.contactsGrid}
      >
        {contacts.map((contact) => (
          <AnimatedContact
            key={contact.id}
            contact={contact}
          />
        ))}
      </PerfectContainer>
    </PerfectContainer>
  );
};
