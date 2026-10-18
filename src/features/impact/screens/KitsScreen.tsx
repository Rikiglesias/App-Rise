import React from 'react';

import { ImpactDetailLayout } from '../components/ImpactDetailLayout';
import { IMPACT_DATA } from '../data/impactData';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { formatNumber } from '@/shared/utils/numberFormat';

const AREE = ['italy', 'ukraine', 'europe'] as const;

/** Kit prodotti e distribuiti, pasti che garantiscono, aree e totali (Annual Report di IMPACT_DATA.fonte, p. 10, 11, 14, 16). */
const KitsScreen: React.FC = () => {
  const { t, locale } = useTranslation();
  const year = IMPACT_DATA.resultsYear;
  const numero = (valore: number) => formatNumber(valore, locale);

  return (
    <ImpactDetailLayout
      title={t('impact.details.kits.title')}
      paragraphs={[
        t('impact.details.kits.intro'),
        t('impact.details.kits.content', {
          meals: numero(IMPACT_DATA.mealsPerKit),
        }),
      ]}
      stats={[
        {
          key: 'produced',
          value: numero(IMPACT_DATA.kitsProduced),
          label: t('impact.details.kits.producedLabel'),
          subtitle: t('impact.details.inYear', { year }),
        },
        {
          key: 'distributed',
          value: numero(IMPACT_DATA.kitsDistributed),
          label: t('impact.details.kits.distributedLabel'),
          subtitle: t('impact.details.inYear', { year }),
        },
        {
          key: 'guaranteed',
          value: numero(IMPACT_DATA.mealsGuaranteedByKits),
          label: t('impact.details.kits.guaranteedLabel'),
          subtitle: t('impact.details.kits.guaranteedSubtitle', { year }),
        },
        ...AREE.map(area => ({
          key: area,
          value: numero(IMPACT_DATA.kitsByArea[area]),
          label: t(`impact.details.kits.${area}`),
          subtitle: t('impact.details.kits.byArea', { year }),
        })),
        {
          key: 'lifetime',
          value: numero(IMPACT_DATA.kitsProducedLifetime),
          label: t('impact.totalKits'),
          subtitle: t('impact.details.sinceStart'),
        },
        {
          key: 'guaranteedLifetime',
          value: numero(IMPACT_DATA.mealsGuaranteedByKitsLifetime),
          label: t('impact.details.kits.guaranteedLabel'),
          subtitle: t('impact.details.sinceStart'),
        },
      ]}
    />
  );
};

export default KitsScreen;
