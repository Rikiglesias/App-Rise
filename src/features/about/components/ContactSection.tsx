import React from 'react';
import { View } from 'react-native';

import { PerfectText } from '../../../components/ui/PerfectText';
import { contactSectionStyles } from '../styles';
import type { ContactSectionProps } from '../types';
import { AnimatedContact } from './AnimatedContact';

export const ContactSection: React.FC<ContactSectionProps> = ({
  animations,
  contacts,
}) => {
  return (
    <View style={contactSectionStyles.categoryContainer}>
      {/* HEADER SENZA ANIMAZIONI */}
      <View style={contactSectionStyles.categoryHeader}>
        <View style={contactSectionStyles.exploreHeaderContainer}>
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
        </View>
      </View>
      <View style={contactSectionStyles.contactsGrid}>
        {contacts.map((contact, index) => {
          const animationValue = animations.contactAnimations[index];
          if (!animationValue) return null;

          return (
            <AnimatedContact
              key={contact.id}
              contact={contact}
              animationValue={animationValue}
            />
          );
        })}
      </View>
    </View>
  );
};
