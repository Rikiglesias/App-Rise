import React from 'react';
import { PerfectContainer } from '../../ui/PerfectContainer';

import { ContentProps } from '../types';
import { CTAAccentLine } from './CTAAccentLine';
import { CTADescription, CTASubtitle, CTATitle } from './CTAText';

// ===================================================================
// CONTENT COMPONENT
// ===================================================================
export const CTAContent: React.FC<ContentProps> = ({
  description,
  title,
  subtitle,
  variant,
  size,
  contentStyles,
  typographyStyles,
  shimmerValue,
}) => (
  <PerfectContainer style={contentStyles.content}>
    {description && (
      <CTADescription
        description={description}
        variant={variant}
        size={size}
        contentStyles={contentStyles}
        typographyStyles={typographyStyles}
      />
    )}

    <CTATitle
      title={title}
      variant={variant}
      size={size}
      contentStyles={contentStyles}
      typographyStyles={typographyStyles}
    />

    <CTAAccentLine
      variant={variant}
      contentStyles={contentStyles}
      shimmerValue={shimmerValue}
    />

    {subtitle && (
      <CTASubtitle
        subtitle={subtitle}
        variant={variant}
        size={size}
        contentStyles={contentStyles}
        typographyStyles={typographyStyles}
      />
    )}
  </PerfectContainer>
);
