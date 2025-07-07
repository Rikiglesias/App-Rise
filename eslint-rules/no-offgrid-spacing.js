/**
 * ESLint Custom Rule: no-offgrid-spacing
 * 
 * Enforces that spacing values are multiples of 8dp (baseline grid)
 * 
 * Targets:
 * - StyleSheet properties: margin, padding, width, height, fontSize, lineHeight
 * - Direct style objects: same properties
 * - Numeric literals in spacing contexts
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce 8dp baseline grid spacing',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          baselineGrid: {
            type: 'number',
            default: 8,
          },
          allowedProperties: {
            type: 'array',
            items: {
              type: 'string',
            },
            default: [
              'margin',
              'marginTop',
              'marginRight',
              'marginBottom',
              'marginLeft',
              'marginVertical',
              'marginHorizontal',
              'padding',
              'paddingTop',
              'paddingRight',
              'paddingBottom',
              'paddingLeft',
              'paddingVertical',
              'paddingHorizontal',
              'width',
              'height',
              'fontSize',
              'lineHeight',
              'borderRadius',
              'borderWidth',
              'borderTopWidth',
              'borderRightWidth',
              'borderBottomWidth',
              'borderLeftWidth',
              'shadowOffset',
              'shadowRadius',
              'elevation',
              'gap',
              'rowGap',
              'columnGap',
            ],
          },
          tolerance: {
            type: 'number',
            default: 0,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      offGrid: 'Value "{{value}}" is not a multiple of {{baselineGrid}}dp baseline grid. Use {{suggestedValue}} instead.',
      offGridWithTolerance: 'Value "{{value}}" is not within tolerance of {{baselineGrid}}dp baseline grid. Use {{suggestedValue}} instead.',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const baselineGrid = options.baselineGrid || 8;
    const allowedProperties = options.allowedProperties || [
      'margin',
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft',
      'marginVertical',
      'marginHorizontal',
      'padding',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'paddingVertical',
      'paddingHorizontal',
      'width',
      'height',
      'fontSize',
      'lineHeight',
      'borderRadius',
      'borderWidth',
      'borderTopWidth',
      'borderRightWidth',
      'borderBottomWidth',
      'borderLeftWidth',
      'shadowOffset',
      'shadowRadius',
      'elevation',
      'gap',
      'rowGap',
      'columnGap',
    ];
    const tolerance = options.tolerance || 0;

    /**
     * Checks if a value is on the baseline grid
     */
    function isOnGrid(value) {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return true; // Skip non-numeric values
      }

      if (tolerance > 0) {
        // Check if value is within tolerance of any grid multiple
        const nearestMultiple = Math.round(value / baselineGrid) * baselineGrid;
        return Math.abs(value - nearestMultiple) <= tolerance;
      }

      return value % baselineGrid === 0;
    }

    /**
     * Gets the suggested value for a given off-grid value
     */
    function getSuggestedValue(value) {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return value;
      }

      const lowerMultiple = Math.floor(value / baselineGrid) * baselineGrid;
      const upperMultiple = Math.ceil(value / baselineGrid) * baselineGrid;
      
      // Choose the closer multiple
      const lowerDiff = Math.abs(value - lowerMultiple);
      const upperDiff = Math.abs(value - upperMultiple);
      
      return lowerDiff <= upperDiff ? lowerMultiple : upperMultiple;
    }

    /**
     * Reports an off-grid value
     */
    function reportOffGrid(node, value, property) {
      const suggestedValue = getSuggestedValue(value);
      
      context.report({
        node,
        messageId: tolerance > 0 ? 'offGridWithTolerance' : 'offGrid',
        data: {
          value: value.toString(),
          baselineGrid: baselineGrid.toString(),
          suggestedValue: suggestedValue.toString(),
          property,
        },
        fix(fixer) {
          return fixer.replaceText(node, suggestedValue.toString());
        },
      });
    }

    /**
     * Checks a property in a style object
     */
    function checkStyleProperty(node, property) {
      if (!allowedProperties.includes(property.key.name)) {
        return;
      }

      let value;
      if (property.value.type === 'Literal' && typeof property.value.value === 'number') {
        value = property.value.value;
      } else if (property.value.type === 'UnaryExpression' && 
                 property.value.operator === '-' && 
                 property.value.argument.type === 'Literal' && 
                 typeof property.value.argument.value === 'number') {
        value = -property.value.argument.value;
      } else {
        return; // Skip non-literal values
      }

      if (!isOnGrid(value)) {
        reportOffGrid(property.value, value, property.key.name);
      }
    }

    /**
     * Checks StyleSheet.create() calls
     */
    function checkStyleSheet(node) {
      if (node.type !== 'CallExpression' ||
          node.callee.type !== 'MemberExpression' ||
          node.callee.object.name !== 'StyleSheet' ||
          node.callee.property.name !== 'create') {
        return;
      }

      const stylesArg = node.arguments[0];
      if (!stylesArg || stylesArg.type !== 'ObjectExpression') {
        return;
      }

      // Check each style object
      stylesArg.properties.forEach((styleProperty) => {
        if (styleProperty.type === 'Property' && 
            styleProperty.value.type === 'ObjectExpression') {
          // Check each property in the style object
          styleProperty.value.properties.forEach((property) => {
            if (property.type === 'Property') {
              checkStyleProperty(styleProperty.value, property);
            }
          });
        }
      });
    }

    /**
     * Checks inline style objects
     */
    function checkInlineStyle(node) {
      if (node.type !== 'ObjectExpression') {
        return;
      }

      // Check if this is likely a style object
      const parent = node.parent;
      if (parent && parent.type === 'JSXExpressionContainer' && 
          parent.parent && parent.parent.type === 'JSXAttribute' &&
          parent.parent.name && parent.parent.name.name === 'style') {
        // This is a style prop
        node.properties.forEach((property) => {
          if (property.type === 'Property') {
            checkStyleProperty(node, property);
          }
        });
      }
    }

    return {
      CallExpression: checkStyleSheet,
      ObjectExpression: checkInlineStyle,
    };
  },
}; 