import React from 'react';
import { Animated, View } from 'react-native';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';

import { contactSectionStyles } from '../styles';
import type { ContactSectionProps } from '../types';
import { AnimatedContact } from './AnimatedContact';

export const ContactSection: React.FC<ContactSectionProps> = ({
  animations,
  contacts,
}) => {
  return (
    <View style={contactSectionStyles.categoryContainer}>
      {/* HEADER IDENTICO SEZIONE "SCOPRI" - ORA CON ANIMAZIONI */}
      <Animated.View
        style={[
          contactSectionStyles.categoryHeader,
          {
            opacity: animations.fadeAnim,
            transform: [
              {
                translateY: animations.slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [20, 0],
                }),
              },
              {
                scale: animations.scaleAnim,
              },
            ],
          },
        ]}
      >
        <View style={contactSectionStyles.exploreHeaderContainer}>
          <ResponsiveText
            style={[{ fontSize: 30 }, contactSectionStyles.categoryTitle]}
          >
            I Nostri Contatti
          </ResponsiveText>
          <ResponsiveText style={contactSectionStyles.exploreSubtitleInline}>
            Sede di Bologna e recapiti ufficiali
          </ResponsiveText>
        </View>
      </Animated.View>
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
