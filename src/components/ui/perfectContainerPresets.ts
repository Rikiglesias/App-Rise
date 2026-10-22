// Preset di PerfectContainer, calcolati a runtime (evita valori scalati all'import).
import { scale, scaleSpacing } from '../../shared/constants/perfectScale';
import type { ShadowType } from '../../shared/constants/perfectShadow';

export type ContainerPresetName =
  | 'page'
  | 'card'
  | 'section'
  | 'modal'
  | 'header'
  | 'footer';

export type ContainerPreset = {
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  backgroundColor?: 'primary' | 'secondary' | 'card' | 'modal' | 'transparent';
  flex?: number;
  borderRadius?: number;
  shadow?: ShadowType | boolean;
  marginHorizontal?: number;
  marginVertical?: number;
};

export const getPresetRuntime = (
  preset: ContainerPresetName
): ContainerPreset => {
  switch (preset) {
    case 'page':
      return {
        padding: scaleSpacing(20),
        backgroundColor: 'primary' as const,
        flex: 1,
      };
    case 'card':
      return {
        padding: scaleSpacing(16),
        backgroundColor: 'card' as const,
        borderRadius: scale(12),
        shadow: 'light' as const,
      };
    case 'section':
      return {
        padding: scaleSpacing(16),
        marginVertical: scale(8),
        backgroundColor: 'transparent' as const,
      };
    case 'modal':
      return {
        padding: scaleSpacing(24),
        backgroundColor: 'modal' as const,
        borderRadius: scale(16),
        shadow: 'strong' as const,
        marginHorizontal: scaleSpacing(20),
      };
    case 'header':
      return {
        paddingHorizontal: scaleSpacing(20),
        paddingVertical: scaleSpacing(12),
        backgroundColor: 'primary' as const,
      };
    case 'footer':
      return {
        paddingHorizontal: scaleSpacing(20),
        paddingVertical: scaleSpacing(16),
        backgroundColor: 'secondary' as const,
      };
  }
};
