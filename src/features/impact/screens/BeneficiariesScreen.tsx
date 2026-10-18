import React from 'react';

import { ImpactDetailLayout } from '../components/ImpactDetailLayout';
import { IMPACT_DATA } from '../data/impactData';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { formatNumber } from '@/shared/utils/numberFormat';

/** Vite impattate dai pasti e dai kit dell'anno e dalla nascita (Annual Report di IMPACT_DATA.fonte, p. 7, 10, 16). */
const BeneficiariesScreen: React.FC = () => {
  const { t, locale } = useTranslation();
  const year = IMPACT_DATA.resultsYear;
  const numero = (valore: number) => formatNumber(valore, locale);

  return (
    <ImpactDetailLayout
      title={t('impact.details.beneficiaries.title')}
      paragraphs={[t('impact.details.beneficiaries.intro')]}
      stats={[
        {
          key: 'meals',
          value: numero(IMPACT_DATA.livesImpactedMeals),
          label: t('impact.livesImpactedLabel'),
          subtitle: t('impact.livesImpactedSubtitle', { year }),
        },
        {
          key: 'kits',
          value: numero(IMPACT_DATA.livesImpactedKits),
          label: t('impact.livesImpactedLabel'),
          subtitle: t('impact.details.kits.livesSubtitle', { year }),
        },
        {
          key: 'lifetime',
          value: numero(IMPACT_DATA.livesImpactedLifetime),
          label: t('impact.livesImpactedLabel'),
          subtitle: t('impact.details.sinceStart'),
        },
      ]}
    />
  );
};

export default BeneficiariesScreen;
