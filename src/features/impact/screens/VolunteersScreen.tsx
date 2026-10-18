import React from 'react';

import { ImpactDetailLayout } from '../components/ImpactDetailLayout';
import { IMPACT_DATA } from '../data/impactData';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { formatNumber } from '@/shared/utils/numberFormat';

/** Volontari coinvolti nell'anno (Annual Report di IMPACT_DATA.fonte, p. 7, 14, 16). */
const VolunteersScreen: React.FC = () => {
  const { t, locale } = useTranslation();
  const year = IMPACT_DATA.resultsYear;

  return (
    <ImpactDetailLayout
      title={t('impact.details.volunteers.title')}
      paragraphs={[
        t('impact.details.volunteers.intro'),
        t('impact.details.volunteers.together'),
      ]}
      stats={[
        {
          key: 'volunteers',
          value: formatNumber(IMPACT_DATA.volunteers, locale),
          label: t('impact.volunteersLabel'),
          subtitle: t('impact.volunteersInvolvedIn', { year }),
        },
      ]}
    />
  );
};

export default VolunteersScreen;
