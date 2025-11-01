# Migrazione Spacing → PerfectSpacing

## ✅ COMPLETATI
- [x] src/features/home/styles/HomeHeaderStyles.ts
- [x] src/features/home/components/ModernSmartTitle.tsx  
- [x] src/features/impact/styles/ImpactScreenStyles.ts

## 🔄 DA MIGRARE (44 file)

### Mapping Conversione Rapida

```typescript
// Import
import { Spacing } from '@/shared/constants';
→
import { PerfectSpacing } from '@/shared/constants';

// Valori
Spacing[0]  → PerfectSpacing.none
Spacing[1]  → PerfectSpacing.xs
Spacing[2]  → PerfectSpacing.sm
Spacing[3]  → PerfectSpacing.md
Spacing[4]  → PerfectSpacing.base
Spacing[5]  → scale(20)  // Usa scale() diretto
Spacing[6]  → PerfectSpacing.lg
Spacing[8]  → PerfectSpacing.xl
Spacing[10] → PerfectSpacing['2xl']
Spacing[12] → PerfectSpacing['3xl']
Spacing[16] → PerfectSpacing['4xl']
Spacing[20] → PerfectSpacing['5xl']
```

### Features da Migrare

**Impact (8 rimanenti)**:
- [ ] src/features/impact/components/TotalMealsSection.tsx
- [ ] src/features/impact/components/Results2024Section.tsx
- [ ] src/features/impact/components/MapSection.tsx
- [ ] src/features/impact/components/CommunitySection.tsx
- [ ] src/features/impact/components/ImpactHeader.tsx
- [ ] src/features/impact/components/ImpactStatComponents.tsx
- [ ] src/features/impact/screens/ImpactTabScreen.tsx
- [ ] src/features/impact/screens/Impatto2024Screen.tsx

**Actions (8 file)**:
- [ ] src/features/actions/components/shared/ActionButtonSections.tsx
- [ ] src/features/actions/components/shared/ActionButtonStyles.ts
- [ ] src/features/actions/components/shared/AnimatedButton.tsx
- [ ] src/features/actions/components/shared/ContributeHeader.tsx
- [ ] src/features/actions/components/shared/DonationInfoModal.tsx
- [ ] src/features/actions/components/shared/HeaderDivider.tsx

**Projects (5 file)**:
- [ ] src/features/projects/components/ProjectCard/index.tsx
- [ ] src/features/projects/components/ProjectCard/ProjectContent.tsx
- [ ] src/features/projects/components/ProjectCard/ProjectHeader.tsx
- [ ] src/features/projects/components/ProjectCard/ProjectProgress.tsx
- [ ] src/features/projects/styles/ProjectsScreenStyles.ts

**Altri componenti (23 file)**: Navigation, Social, About, UI components...

## 🚀 Procedura Rapida per File

Per ogni file:

1. **Sostituisci import**:
   ```
   Find: import { (.*,\s*)?Spacing(,\s*.*)? } from
   Replace: import { $1PerfectSpacing$2 } from
   ```

2. **Converti valori** (esempio):
   ```
   Find: Spacing\[6\]
   Replace: PerfectSpacing.lg
   ```

3. **Verifica TypeScript**:
   ```bash
   npx tsc --noEmit
   ```
