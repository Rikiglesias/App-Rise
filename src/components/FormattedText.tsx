import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';

import { Colors, Spacing, Typography } from '../constants/designTokens';

interface FormattedTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
}

const FormattedText: React.FC<FormattedTextProps> = ({ text, style }) => {
  const paragraphs = text.split('\n\n');

  return (
    <View>
      {paragraphs.map(paragraph => (
        <Text
          key={paragraph.substring(0, 50)}
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
