/**
 * PERFECT SYSTEMS - INDEX EXPORT
 * 
 * Esporta tutti i 5 sistemi perfetti in un unico posto
 * per facilità d'uso e importazioni semplificate
 */

// 🧮 Sistema Millimetrico Universale
export { 
  universal,
  calculateMillimetricSize,
  universalFont,
  universalSpacing,
  universalWidth,
  universalHeight,
  getDeviceInfo
} from '../../shared/utils/UniversalMillimetricSystem';

// 📝 Sistema Testi Perfetto
export { 
  PerfectText,
  PerfectTitle,
  PerfectSubtitle,
  PerfectBody
} from '../ui/PerfectText';

// 🌙 Sistema Dark Mode
export { 
  UniversalThemeProvider,
  useUniversalTheme,
  getThemeColor,
  ThemeStatus
} from '../../shared/theme/UniversalTheme';

// 🖼️ Sistema Immagini Identiche
export { 
  PerfectImage,
  HeroImage,
  CardImage,
  ThumbnailImage,
  AvatarImage,
  BannerImage
} from '../ui/PerfectImage';

// 📦 Sistema Container Uguali
export { 
  PerfectContainer,
  PageContainer,
  CardContainer,
  SectionContainer,
  ModalContainer,
  HeaderContainer,
  FooterContainer
} from '../ui/PerfectContainer';

// 🎯 Esempio Completo
export { PerfectAppExample } from '../../examples/PerfectAppExample'; 