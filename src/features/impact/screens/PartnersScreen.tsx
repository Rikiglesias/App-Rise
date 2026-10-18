import React from 'react';

import { ImpactDetailLayout } from '../components/ImpactDetailLayout';
import { IMPACT_DATA } from '../data/impactData';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { formatNumber } from '@/shared/utils/numberFormat';

/** Associazioni partner: il numero è la lunghezza dell'elenco del report (Annual Report di IMPACT_DATA.fonte, p. 7, 8, 17). */
const PartnersScreen: React.FC = () => {
  const { t, locale } = useTranslation();
  const year = IMPACT_DATA.resultsYear;

  return (
    <ImpactDetailLayout
      title={t('impact.details.partners.title')}
      paragraphs={[
        t('impact.details.partners.intro'),
        t('impact.details.partners.network'),
      ]}
      stats={[
        {
          key: 'partners',
          value: formatNumber(IMPACT_DATA.partnerAssociations.length, locale),
          label: t('impact.partnerAssociationsLabel'),
          subtitle: t('impact.partnerAssociationsSubtitle', { year }),
        },
      ]}
      listTitle={t('impact.details.partners.listTitle')}
      list={IMPACT_DATA.partnerAssociations}
    />
  );
};

export default PartnersScreen;
