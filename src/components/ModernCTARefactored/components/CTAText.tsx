import React from 'react';
import { CTADescriptionProps, CTASubtitleProps, CTATitleProps } from '../types';
import { PerfectText } from '@/components/ui/PerfectText';


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
  <PerfectText
    size={16}
    lines={3}
    fontWeight="400"
    style={[
      contentStyles.description,
      typographyStyles[`${size}Description` as keyof typeof typographyStyles],
      typographyStyles[
        `${variant}Description` as keyof typeof typographyStyles
      ],
    ]}
  >
    {description}
  </PerfectText>
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
  <PerfectText
    size={24}
    lines={2}
    fontWeight="400"
    style={[
      contentStyles.title,
      typographyStyles[`${size}Title` as keyof typeof typographyStyles],
      typographyStyles[`${variant}Title` as keyof typeof typographyStyles],
    ]}
  >
    {title}
  </PerfectText>
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
  <PerfectText
    size={18}
    lines={2}
    fontWeight="400"
    style={[
      contentStyles.subtitle,
      typographyStyles[`${size}Subtitle` as keyof typeof typographyStyles],
      typographyStyles[`${variant}Subtitle` as keyof typeof typographyStyles],
    ]}
  >
    {subtitle}
  </PerfectText>
);
