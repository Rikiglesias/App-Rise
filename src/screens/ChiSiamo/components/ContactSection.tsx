import React from 'react';
import { Animated, Text, View } from 'react-native';

import { contactSectionStyles } from '../styles';
import type { ContactSectionProps } from '../types';
import { AnimatedContact } from './AnimatedContact';

export const ContactSection: React.FC<ContactSectionProps> = ({
  animations,
  contacts,
}) => {
  return (
    <View style={contactSectionStyles.categoryContainer}>
      <Text style={contactSectionStyles.categoryTitle}>Contatti</Text>
      {/* Separatore decorativo */}
      <View style={contactSectionStyles.titleSeparator}>
        <View style={contactSectionStyles.separatorLine} />
        <Text style={contactSectionStyles.separatorIcon}>•</Text>
        <View style={contactSectionStyles.separatorLine} />
      </View>
      <Text style={contactSectionStyles.categorySubtitle}>
        Contattaci rapidamente
      </Text>
      <View style={contactSectionStyles.categoryDivider} />
      <View style={contactSectionStyles.contactsGrid}>
        {contacts.map((contact, index) => {
          const animationValue = animations.contactAnimations[index];
          if (!animationValue) return null;

          return (
            <Animated.View
              key={contact.id}
              style={[
                {
                  opacity: animationValue,
                  transform: [
                    {
                      translateY: animationValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                    {
                      scale: animationValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <AnimatedContact
                contact={contact}
                animationValue={animationValue}
              />
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};
