/**
 * ESEMPIO COMPLETO - APP IDENTICA SU TUTTI I DISPOSITIVI
 * 
 * Dimostra come utilizzare tutti e 5 i sistemi insieme:
 * 1. Sistema Millimetrico Universale
 * 2. Sistema Testi Perfetto  
 * 3. Sistema Dark Mode
 * 4. Sistema Immagini Identiche
 * 5. Sistema Container Uguali
 * 
 * RISULTATO: App visivamente IDENTICA su iPhone SE, iPhone 15, iPad, Android
 */

import React from 'react';
import { ScrollView, TouchableOpacity, Alert } from 'react-native';

// 🎯 IMPORTA TUTTI I SISTEMI
import { universal } from '../shared/utils/UniversalMillimetricSystem';
import { PerfectText } from '../components/ui/PerfectText';
import { UniversalThemeProvider, useUniversalTheme } from '../shared/theme/UniversalTheme';
import { HeroImage, CardImage } from '../components/ui/PerfectImage';
import { PerfectContainer, PageContainer, CardContainer } from '../components/ui/PerfectContainer';

// 🎨 CONTENUTO DEMO
const DEMO_CONTENT = {
  title: "Rise Against Hunger Italia",
  subtitle: "Combatti la fame nel mondo con azioni concrete",
  description: "La nostra missione è eliminare la fame nel mondo attraverso progetti concreti, educazione alimentare e sostegno alle comunità più vulnerabili. Ogni donazione conta.",
  longText: "Dal 2005, Rise Against Hunger Italia lavora instancabilmente per combattere la fame e la malnutrizione nelle regioni più povere del mondo. I nostri progetti includono la distribuzione di pasti nutritivi, programmi educativi per l'agricoltura sostenibile, costruzione di pozzi d'acqua e supporto alle comunità locali per lo sviluppo di sistemi alimentari resilienti.",
  heroImage: { uri: 'https://picsum.photos/400/300' },
  cardImages: [
    { id: 1, uri: 'https://picsum.photos/300/200', title: 'Progetti Attivi' },
    { id: 2, uri: 'https://picsum.photos/300/201', title: 'Comunità Aiutate' },
    { id: 3, uri: 'https://picsum.photos/300/202', title: 'Volontari' }
  ]
};

// 🏠 COMPONENTE PRINCIPALE
const PerfectAppContent: React.FC = () => {
  const { colors, isDark, toggleTheme } = useUniversalTheme();

  return (
    <PageContainer backgroundColor="primary">
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* 🎯 HEADER SECTION */}
        <CardContainer 
          backgroundColor="card" 
          margin={universal.spacing(20)}
          borderRadius={16}
          shadow="medium"
        >
          {/* Hero Image - Sistema Immagini */}
          <HeroImage 
            source={DEMO_CONTENT.heroImage}
            width={350}
            aspectRatio={16/9}
          />
          
          {/* Titolo Principal - Sistema Testi */}
          <PerfectText
            fontSize={42}
            lines={1}
            fontWeight="bold"
            textAlign="center"
            color={colors.text}
            containerWidth={320}
          >
            {DEMO_CONTENT.title}
          </PerfectText>
          
          {/* Sottotitolo - Sistema Testi */}
          <PerfectText
            fontSize={18}
            lines={2}
            fontWeight="600"
            textAlign="center"
            color={colors.textSecondary}
            containerWidth={300}
          >
            {DEMO_CONTENT.subtitle}
          </PerfectText>
        </CardContainer>

        {/* 🎯 CONTENT SECTION */}
        <CardContainer 
          backgroundColor="card" 
          marginHorizontal={universal.spacing(20)}
          marginVertical={universal.spacing(10)}
          padding={universal.spacing(20)}
          borderRadius={12}
          shadow="light"
        >
          {/* Descrizione - Sistema Testi Lunghi */}
          <PerfectText
            fontSize={16}
            lines={4}
            color={colors.text}
          >
            {DEMO_CONTENT.description}
          </PerfectText>
        </CardContainer>

        {/* 🎯 IMAGES GRID - Sistema Immagini */}
        <PerfectContainer 
          flexDirection="row" 
          justifyContent="space-around"
          marginHorizontal={universal.spacing(20)}
          marginVertical={universal.spacing(10)}
          gap={universal.spacing(12)}
        >
          {DEMO_CONTENT.cardImages.map(item => (
            <CardContainer key={item.id} backgroundColor="card" padding={12} borderRadius={8}>
              <CardImage 
                source={item} 
                width={90}
                aspectRatio={4/3}
              />
              <PerfectText
                fontSize={12}
                lines={1}
                textAlign="center"
                color={colors.textSecondary}
                containerWidth={90}
              >
                {item.title}
              </PerfectText>
            </CardContainer>
          ))}
        </PerfectContainer>

        {/* 🎯 LONG TEXT SECTION */}
        <CardContainer 
          backgroundColor="secondary" 
          marginHorizontal={universal.spacing(20)}
          marginVertical={universal.spacing(10)}
          padding={universal.spacing(16)}
          borderRadius={12}
        >
          <PerfectText
            fontSize={14}
            lines={6}
            color={colors.text}
          >
            {DEMO_CONTENT.longText}
          </PerfectText>
        </CardContainer>

        {/* 🎯 CONTROLS SECTION */}
        <CardContainer 
          backgroundColor="card" 
          marginHorizontal={universal.spacing(20)}
          marginVertical={universal.spacing(20)}
          padding={universal.spacing(20)}
          borderRadius={12}
          shadow="medium"
        >
          <PerfectText
            fontSize={20}
            lines={1}
            fontWeight="bold"
            textAlign="center"
            color={colors.text}
          >
            Controlli Sistema
          </PerfectText>
          
          <TouchableOpacity
            onPress={toggleTheme}
            style={{
              backgroundColor: colors.accent,
              paddingVertical: universal.spacing(12),
              paddingHorizontal: universal.spacing(24),
              borderRadius: universal.spacing(8),
              marginTop: universal.spacing(16),
              alignItems: 'center'
            }}
          >
            <PerfectText
              fontSize={16}
              lines={1}
              color="#FFFFFF"
              fontWeight="600"
            >
              🌓 Toggle Dark Mode ({isDark ? 'Dark' : 'Light'})
            </PerfectText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              const info = universal.info();
              Alert.alert(
                'Info Dispositivo',
                `Dispositivo: ${info.width}x${info.height}px\n` +
                `Scala: ${info.scalePercentage}% di iPhone 15\n` +
                `Riferimento: ${info.reference.name} (${info.reference.width}px)`
              );
            }}
            style={{
              backgroundColor: colors.success,
              paddingVertical: universal.spacing(12),
              paddingHorizontal: universal.spacing(24),
              borderRadius: universal.spacing(8),
              marginTop: universal.spacing(12),
              alignItems: 'center'
            }}
          >
            <PerfectText
              fontSize={16}
              lines={1}
              color="#FFFFFF"
              fontWeight="600"
            >
              📱 Info Dispositivo
            </PerfectText>
          </TouchableOpacity>
        </CardContainer>

        {/* 🎯 FOOTER */}
        <PerfectContainer padding={universal.spacing(40)}>
          <PerfectText
            fontSize={12}
            lines={2}
            textAlign="center"
            color={colors.textMuted}
          >
            Sistema Responsive Perfetto{'\n'}
            Identico su iPhone SE, iPhone 15, iPad, Android
          </PerfectText>
        </PerfectContainer>

      </ScrollView>
    </PageContainer>
  );
};

// 🌍 APP WRAPPER CON THEME PROVIDER
export const PerfectAppExample: React.FC = () => {
  return (
    <UniversalThemeProvider initialTheme="system">
      <PerfectAppContent />
    </UniversalThemeProvider>
  );
}; 