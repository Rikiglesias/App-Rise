import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';

import {
  Colors,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';

interface FormattedTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
}

const FormattedText: React.FC<FormattedTextProps> = ({ text, style }) => {
  const paragraphs = text.split('\n\n');

  // Generate stable keys based on content hash
  const generateStableKey = (content: string, position: number): string => {
    const contentHash = content.split('').reduce((hash, char) => {
      return ((hash << 5) - hash + char.charCodeAt(0)) & 0xffffffff;
    }, 0);
    return `paragraph_${Math.abs(contentHash)}_${position}`;
  };

  return (
    <View>
      {paragraphs.map((paragraph, position) => (
        <Text
          key={generateStableKey(paragraph, position)}
          style={[
            styles.paragraph,
            style,
            {
              lineHeight:
                Typography.lineHeights.relaxed * Typography.sizes.base,
            },
          ]}
        >
          {paragraph}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  paragraph: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    marginBottom: Spacing[3],
  },
});

export default FormattedText;
