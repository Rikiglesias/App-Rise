import React from 'react';

import { ImpactDetailLayout } from '../components/ImpactDetailLayout';
import { IMPACT_DATA } from '../data/impactData';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { formatNumber } from '@/shared/utils/numberFormat';

const PAESI = ['zimbabwe', 'southAfrica', 'ukraine'] as const;

/** Pasti prodotti e distribuiti nell'anno, per paese e dalla nascita (Annual Report di IMPACT_DATA.fonte, p. 8, 9, 16). */
const MealsScreen: React.FC = () => {
  const { t, locale } = useTranslation();
  const year = IMPACT_DATA.resultsYear;
  const numero = (valore: number) => formatNumber(valore, locale);

  return (
    <ImpactDetailLayout
      title={t('impact.details.meals.title')}
      paragraphs={[
        t('impact.details.meals.intro'),
        t('impact.details.meals.schools'),
      ]}
      stats={[
        {
          key: 'produced',
          value: numero(IMPACT_DATA.mealsProduced),
          label: t('impact.mealsPackagedLabel'),
          subtitle: t('impact.mealsPackagedSubtitle', { year }),
        },
        {
          key: 'distributed',
          value: numero(IMPACT_DATA.mealsDistributed),
          label: t('impact.details.meals.distributedLabel'),
          subtitle: t('impact.details.inYear', { year }),
        },
        ...PAESI.map(paese => ({
          key: paese,
          value: numero(IMPACT_DATA.mealsByCountry[paese]),
          label: t(`impact.details.meals.${paese}`),
          subtitle: t('impact.details.meals.byCountry', { year }),
        })),
        {
          key: 'lifetime',
          value: numero(IMPACT_DATA.mealsProducedLifetime),
          label: t('impact.totalMealsLabel'),
          subtitle: t('impact.details.sinceStart'),
        },
      ]}
    />
  );
};

export default MealsScreen;
