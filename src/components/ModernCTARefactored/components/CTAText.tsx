import React from 'react';
import { Text } from 'react-native';

import { CTADescriptionProps, CTASubtitleProps, CTATitleProps } from '../types';

// ===================================================================
// DESCRIPTION COMPONENT
// ===================================================================
export const CTADescription: React.FC<CTADescriptionProps> = ({
  description,
  variant,
  size,
  contentStyles,
  typographyStyles,
}) => (
  <Text
    style={[
      contentStyles.description,
      typographyStyles[`${size}Description` as keyof typeof typographyStyles],
      typographyStyles[
        `${variant}Description` as keyof typeof typographyStyles
      ],
    ]}
  >
    {description}
  </Text>
);

// ===================================================================
// TITLE COMPONENT
// ===================================================================
export const CTATitle: React.FC<CTATitleProps> = ({
  title,
  variant,
  size,
  contentStyles,
  typographyStyles,
}) => (
  <Text
    style={[
      contentStyles.title,
      typographyStyles[`${size}Title` as keyof typeof typographyStyles],
      typographyStyles[`${variant}Title` as keyof typeof typographyStyles],
    ]}
  >
    {title}
  </Text>
);

// ===================================================================
// SUBTITLE COMPONENT
// ===================================================================
export const CTASubtitle: React.FC<CTASubtitleProps> = ({
  subtitle,
  variant,
  size,
  contentStyles,
  typographyStyles,
}) => (
  <Text
    style={[
      contentStyles.subtitle,
      typographyStyles[`${size}Subtitle` as keyof typeof typographyStyles],
      typographyStyles[`${variant}Subtitle` as keyof typeof typographyStyles],
    ]}
  >
    {subtitle}
  </Text>
);
