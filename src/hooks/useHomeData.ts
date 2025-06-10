export const useHomeData = () => {
  const heroStories = [
    {
      id: '1',
      title: 'Scuola in Kenya ora ha 500 pasti al giorno',
      location: 'Nairobi, Kenya',
      impact: "12.000 bambini nutriti quest'anno",
      image: require('../../assets/images/hero-banner.png'),
      accessibilityLabel:
        'Bambini di una scuola in Kenya che ricevono pasti nutrienti grazie al programma Rise Against Hunger',
      color: '#FF6B35', // Orange per l'Africa
    },
    {
      id: '2',
      title: 'Comunità in Bangladesh supera la crisi alimentare',
      location: 'Dhaka, Bangladesh',
      impact: '8.500 famiglie supportate',
      image: require('../../assets/images/hero-banner.png'),
      accessibilityLabel:
        'Famiglie del Bangladesh che beneficiano dei programmi alimentari di Rise Against Hunger',
      color: '#2ECC71', // Verde per la speranza
    },
    {
      id: '3',
      title: 'Volontari italiani confezionano 50K pasti',
      location: 'Bologna, Italia',
      impact: 'Record mensile raggiunto',
      image: require('../../assets/images/hero-banner.png'),
      accessibilityLabel:
        'Volontari italiani di Rise Against Hunger che confezionano pasti per le comunità bisognose',
      color: '#3498DB', // Blu per l'Italia
    },
  ];

  const impactStats = {
    meals: {
      current: 3100000,
      target: 4000000,
      label: 'Pasti',
      sublabel: 'Obiettivo 4M entro 2025',
      accessibilityLabel:
        'Tre milioni e centomila pasti distribuiti su un obiettivo di quattro milioni',
    },
    volunteers: {
      current: 13000,
      target: 20000,
      label: 'Volontari',
      sublabel: 'Target 20K volontari',
      accessibilityLabel:
        'Tredicimila volontari attivi su un target di ventimila',
    },
    kits: {
      current: 16000,
      target: 25000,
      label: 'Kit Distribuiti',
      sublabel: 'Target 25K kit',
      accessibilityLabel:
        'Sedicimila kit alimentari distribuiti su un target di venticinquemila',
    },
  };

  return {
    heroStories,
    impactStats,
  };
};
