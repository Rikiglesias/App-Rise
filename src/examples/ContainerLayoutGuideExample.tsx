import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FormattedText } from '../components/ui/FormattedText';
import {
  ProfessionalContainer,
  TitleContainer,
  CardContainer,
} from '../components/ui/ProfessionalContainer';
import { PlatformTouchable } from '../components/ui/PlatformTouchable';

/**
 * 📱 CONTAINER LAYOUT GUIDE EXAMPLE
 *
 * Questo esempio mostra tutti i miglioramenti implementati secondo la guida professionale:
 *
 * ✅ 1. Larghezza costante (90% su phone, fisso su tablet)
 * ✅ 2. Padding interno costante in dp
 * ✅ 3. Safe area handling automatico
 * ✅ 4. RTL support integrato
 * ✅ 5. Dynamic Type controllato
 * ✅ 6. Baseline grid per line-height
 * ✅ 7. Breakpoint strategy automatica
 * ✅ 8. Librerie autosize fallback
 * ✅ 9. Testing automatico del container
 * ✅ 10. Checklist compliance completa
 */

const ContainerLayoutGuideExample: React.FC = () => {
  const [rtlEnabled, setRTLEnabled] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const toggleRTL = () => {
    setRTLEnabled(!rtlEnabled);
    Alert.alert(
      'RTL Support',
      `RTL ${rtlEnabled ? 'Disabled' : 'Enabled'} - Text alignment and layout direction changed`,
      [{ text: 'OK' }]
    );
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* HEADER SECTION */}
          <TitleContainer>
            <FormattedText
              fontSize={28}
              fontWeight="bold"
              color="#DC2626"
              fixed={true}
              fixedLines={2}
              enableRTL={rtlEnabled}
            >
              Container Layout Guide Professional Implementation
            </FormattedText>
          </TitleContainer>

          {/* CONTROLS */}
          <View style={styles.controlsContainer}>
            <PlatformTouchable style={styles.button} onPress={toggleRTL}>
              <FormattedText fontSize={14} color="#FFFFFF" fontWeight="medium">
                {rtlEnabled ? 'Disable RTL' : 'Enable RTL'}
              </FormattedText>
            </PlatformTouchable>

            <PlatformTouchable style={styles.button} onPress={toggleDetails}>
              <FormattedText fontSize={14} color="#FFFFFF" fontWeight="medium">
                {showDetails ? 'Hide Details' : 'Show Details'}
              </FormattedText>
            </PlatformTouchable>
          </View>

          {/* EXAMPLE 1: TITLE CONSISTENCY */}
          <CardContainer>
            <FormattedText fontSize={16} fontWeight="bold" color="#1F2937">
              ✅ 1. Width Consistency (90% on phone, fixed on tablet)
            </FormattedText>

            <View style={styles.exampleContainer}>
              <TitleContainer>
                <FormattedText
                  fontSize={75}
                  fontWeight="black"
                  color="#DC2626"
                  fixed={true}
                  fixedLines={2}
                  enableRTL={rtlEnabled}
                  testID="title-consistency"
                >
                  Rise Against Hunger Italia
                </FormattedText>
              </TitleContainer>

              {showDetails && (
                <View style={styles.detailsBox}>
                  <FormattedText fontSize={12} color="#6B7280">
                    • Always 2 lines on all devices{'\n'}• Font scales down
                    conservatively (max 15%){'\n'}• Width: 90% viewport (phone)
                    / 428dp (tablet){'\n'}• Zero text truncation guaranteed
                  </FormattedText>
                </View>
              )}
            </View>
          </CardContainer>

          {/* EXAMPLE 2: PADDING CONSISTENCY */}
          <CardContainer>
            <FormattedText fontSize={16} fontWeight="bold" color="#1F2937">
              ✅ 2. Padding Consistency (constant in dp)
            </FormattedText>

            <View style={styles.exampleContainer}>
              <ProfessionalContainer variant="text">
                <FormattedText
                  fontSize={18}
                  enableRTL={rtlEnabled}
                  color="#374151"
                >
                  This text has consistent padding across all devices. Padding
                  is scaled using the same scaleSize function, maintaining 4dp
                  grid alignment.
                </FormattedText>
              </ProfessionalContainer>

              {showDetails && (
                <View style={styles.detailsBox}>
                  <FormattedText fontSize={12} color="#6B7280">
                    • Padding scaled with scaleSize() function{'\n'}• Always
                    multiple of 4dp (baseline grid){'\n'}• Consistent across iOS
                    and Android{'\n'}• Safe area integration automatic
                  </FormattedText>
                </View>
              )}
            </View>
          </CardContainer>

          {/* EXAMPLE 3: RTL SUPPORT */}
          <CardContainer>
            <FormattedText fontSize={16} fontWeight="bold" color="#1F2937">
              ✅ 4. RTL Support (Arabic, Hebrew, etc.)
            </FormattedText>

            <View style={styles.exampleContainer}>
              <ProfessionalContainer variant="text" enableRTL={rtlEnabled}>
                <FormattedText
                  fontSize={16}
                  enableRTL={rtlEnabled}
                  color="#374151"
                >
                  {rtlEnabled
                    ? 'هذا النص يدعم اتجاه الكتابة من اليمين إلى اليسار'
                    : 'This text supports right-to-left writing direction'}
                </FormattedText>
              </ProfessionalContainer>

              {showDetails && (
                <View style={styles.detailsBox}>
                  <FormattedText fontSize={12} color="#6B7280">
                    • Automatic text alignment (start/end){'\n'}• Writing
                    direction support{'\n'}• RTL-aware line breaks{'\n'}• Layout
                    direction adjustments
                  </FormattedText>
                </View>
              )}
            </View>
          </CardContainer>

          {/* EXAMPLE 4: BASELINE GRID */}
          <CardContainer>
            <FormattedText fontSize={16} fontWeight="bold" color="#1F2937">
              ✅ 6. Baseline Grid & Line-Height
            </FormattedText>

            <View style={styles.exampleContainer}>
              <ProfessionalContainer variant="text">
                <FormattedText
                  fontSize={24}
                  enableRTL={rtlEnabled}
                  color="#DC2626"
                  fontWeight="bold"
                >
                  Large Title Text
                </FormattedText>
                <FormattedText
                  fontSize={16}
                  enableRTL={rtlEnabled}
                  color="#374151"
                  style={{ marginTop: 8 }}
                >
                  Regular body text follows the same baseline grid. Line-height
                  is calculated proportionally using the baseline grid function.
                </FormattedText>
                <FormattedText
                  fontSize={12}
                  enableRTL={rtlEnabled}
                  color="#6B7280"
                  style={{ marginTop: 8 }}
                >
                  Small caption text also maintains rhythm.
                </FormattedText>
              </ProfessionalContainer>

              {showDetails && (
                <View style={styles.detailsBox}>
                  <FormattedText fontSize={12} color="#6B7280">
                    • lineHeight = fontSize * 1.15 (proportional){'\n'}• 4dp
                    baseline grid maintained{'\n'}• Consistent rhythm across
                    sizes{'\n'}• Cross-platform identical
                  </FormattedText>
                </View>
              )}
            </View>
          </CardContainer>

          {/* EXAMPLE 5: BREAKPOINT STRATEGIES */}
          <CardContainer>
            <FormattedText fontSize={16} fontWeight="bold" color="#1F2937">
              ✅ 7. Breakpoint Strategies
            </FormattedText>

            <View style={styles.exampleContainer}>
              <ProfessionalContainer variant="text">
                <FormattedText
                  fontSize={14}
                  enableRTL={rtlEnabled}
                  color="#374151"
                >
                  • Phone (≤480dp): 90% viewport width{'\n'}• Tablet
                  (481-900dp): 428dp fixed width{'\n'}• Desktop ({'>'}900dp):
                  512dp fixed width{'\n'}• Landscape: considers orientation
                </FormattedText>
              </ProfessionalContainer>

              {showDetails && (
                <View style={styles.detailsBox}>
                  <FormattedText fontSize={12} color="#6B7280">
                    • Automatic breakpoint detection{'\n'}• Strategy changes
                    based on screen size{'\n'}• Optimal reading widths
                    maintained{'\n'}• Two-column layouts on large screens
                  </FormattedText>
                </View>
              )}
            </View>
          </CardContainer>

          {/* EXAMPLE 6: INTELLIGENT FIXED LINES */}
          <CardContainer>
            <FormattedText fontSize={16} fontWeight="bold" color="#1F2937">
              🚀 Intelligent Fixed Lines System
            </FormattedText>

            <View style={styles.exampleContainer}>
              <View style={styles.compareContainer}>
                <View style={styles.beforeAfter}>
                  <FormattedText
                    fontSize={14}
                    fontWeight="medium"
                    color="#DC2626"
                  >
                    Short Title
                  </FormattedText>
                  <FormattedText
                    fontSize={20}
                    fontWeight="bold"
                    color="#1F2937"
                    fixed={true}
                    fixedLines={2}
                    enableRTL={rtlEnabled}
                  >
                    Short Title
                  </FormattedText>
                </View>

                <View style={styles.beforeAfter}>
                  <FormattedText
                    fontSize={14}
                    fontWeight="medium"
                    color="#DC2626"
                  >
                    Long Title (Auto-resized)
                  </FormattedText>
                  <FormattedText
                    fontSize={20}
                    fontWeight="bold"
                    color="#1F2937"
                    fixed={true}
                    fixedLines={2}
                    enableRTL={rtlEnabled}
                  >
                    This is a Much Longer Title That Gets Automatically Resized
                  </FormattedText>
                </View>
              </View>

              {showDetails && (
                <View style={styles.detailsBox}>
                  <FormattedText fontSize={12} color="#6B7280">
                    • Short titles: keep original font size{'\n'}• Long titles:
                    resize conservatively (max 15%){'\n'}• Always exactly 2
                    lines{'\n'}• Never truncates text{'\n'}• Font weight
                    preserved
                  </FormattedText>
                </View>
              )}
            </View>
          </CardContainer>

          {/* PROFESSIONAL CHECKLIST */}
          <CardContainer>
            <FormattedText fontSize={16} fontWeight="bold" color="#1F2937">
              📐 Professional Guide Compliance
            </FormattedText>

            <View style={styles.exampleContainer}>
              <FormattedText
                fontSize={14}
                enableRTL={rtlEnabled}
                color="#059669"
                fontWeight="medium"
              >
                ✅ maxWidth consistent across devices{'\n'}✅ Padding constant
                in dp{'\n'}✅ Safe area handled automatically{'\n'}✅ RTL
                support integrated{'\n'}✅ Dynamic Type controlled{'\n'}✅
                Baseline grid implemented{'\n'}✅ Breakpoint strategies active
                {'\n'}✅ Autosize fallback ready{'\n'}✅ Testing suite complete
                {'\n'}✅ Cross-platform consistency
              </FormattedText>
            </View>
          </CardContainer>

          {/* DEVELOPMENT INFO */}
          <CardContainer>
            <FormattedText fontSize={16} fontWeight="bold" color="#1F2937">
              🔍 Development Information
            </FormattedText>

            <View style={styles.exampleContainer}>
              <FormattedText
                fontSize={12}
                enableRTL={rtlEnabled}
                color="#6B7280"
                fontWeight="medium"
              >
                Check console for layout debugging info.{'\n'}
                Test on different screen sizes to see responsive behavior.{'\n'}
                All measurements follow 4dp baseline grid.{'\n'}
                Font scaling is bi-directional (up and down).
              </FormattedText>
            </View>
          </CardContainer>
        </ScrollView>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  exampleContainer: {
    marginTop: 12,
  },
  detailsBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  compareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  beforeAfter: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});

export default ContainerLayoutGuideExample;
