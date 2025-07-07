import React from 'react';
import { FormattedText, FormattedTextProps } from '../FormattedText';

/**
 * Hook per utilizzare FormattedText con variant predefiniti
 */
export const useFormattedTextVariants = () => {
  return {
    // Display variants (grandi titoli)
    displayLarge: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="display-large" {...props} />
    ),
    displayMedium: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="display-medium" {...props} />
    ),
    displaySmall: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="display-small" {...props} />
    ),

    // Headline variants (titoli sezioni)
    headlineLarge: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="headline-large" {...props} />
    ),
    headlineMedium: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="headline-medium" {...props} />
    ),
    headlineSmall: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="headline-small" {...props} />
    ),

    // Title variants (titoli componenti)
    titleLarge: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="title-large" {...props} />
    ),
    titleMedium: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="title-medium" {...props} />
    ),
    titleSmall: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="title-small" {...props} />
    ),

    // Body variants (testo principale)
    bodyLarge: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="body-large" {...props} />
    ),
    bodyMedium: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="body-medium" {...props} />
    ),
    bodySmall: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="body-small" {...props} />
    ),

    // Label variants (etichette UI)
    labelLarge: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="label-large" {...props} />
    ),
    labelMedium: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="label-medium" {...props} />
    ),
    labelSmall: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="label-small" {...props} />
    ),
  };
};
