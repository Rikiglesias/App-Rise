/**
 * Traduzioni Italiano
 * Rise Against Hunger Italia
 */

export default {
  common: {
    appName: 'Rise Against Hunger Italia',
    loading: 'Caricamento...',
    error: 'Errore',
    retry: 'Riprova',
    close: 'Chiudi',
    cancel: 'Annulla',
    confirm: 'Conferma',
    save: 'Salva',
    delete: 'Elimina',
    edit: 'Modifica',
    back: 'Indietro',
    next: 'Avanti',
    finish: 'Termina',
    skip: 'Salta',
  },

  navigation: {
    home: 'Home',
    impact: 'Impatto',
    actions: 'Azioni',
    about: 'Chi Siamo',
    profile: 'Profilo',
  },

  auth: {
    a11y: {
      showPassword: 'Mostra password',
      hidePassword: 'Nascondi password',
    },
    login: {
      title: 'Area Donatori',
      email: 'Email',
      password: 'Password',
      submit: 'Accedi',
      welcome: 'Benvenuto',
      forgotPassword: 'Password dimenticata?',
      createAccount: 'Non hai un account? Creane uno',
    },
    signup: {
      title: 'Crea account',
      sections: {
        personal: 'Dati personali',
        account: 'Accesso',
        contacts: 'Contatti',
        consents: 'Consensi',
      },
      firstName: 'Nome',
      lastName: 'Cognome',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Conferma password',
      phone: 'Telefono',
      country: 'Paese',
      city: 'Città',
      cityPlaceholder: 'Cerca il comune',
      cityForeignPlaceholder: 'La tua città',
      province: 'Provincia',
      provincePlaceholder: 'Auto-compilata dalla città',
      birthDate: 'Data di nascita',
      birthDatePlaceholder: 'Seleziona la data',
      nickname: 'Nickname (facoltativo)',
      nicknamePlaceholder: 'Come farti chiamare sui siti dei nostri partner',
      // Riscontro sotto il campo mentre si scrive (migration 0018). «Non verificabile»
      // è un terzo caso, non un errore: se la rete manca si va avanti lo stesso, e
      // dirlo è più onesto che lasciare il campo muto o fingere che sia libero.
      nicknameChecking: 'Controllo…',
      nicknameFree: 'Libero',
      nicknameUnknown:
        'Non siamo riusciti a controllare: puoi comunque proseguire',
      privacyConsent: 'Accetto la',
      privacyConsentLink: 'privacy policy',
      marketingConsent: 'Voglio ricevere aggiornamenti (facoltativo)',
      submit: 'Registrati',
      hasAccount: 'Hai già un account? Accedi',
      checkEmail:
        'Ti abbiamo inviato un’email di verifica. Confermala per accedere.',
    },
    forgot: {
      title: 'Recupera password',
      email: 'Email',
      submit: 'Invia link di reset',
      sent: 'Se l’email esiste, riceverai un link per reimpostare la password.',
      error: 'Invio non riuscito. Riprova tra poco.',
      backToLogin: 'Torna al Login',
    },
    reset: {
      title: 'Imposta nuova password',
      newPassword: 'Nuova password',
      confirmPassword: 'Conferma password',
      submit: 'Salva password',
      success: 'Password aggiornata. Ora puoi accedere con la nuova password.',
      continue: 'Continua',
    },
    profile: {
      title: 'Il mio profilo',
      logout: 'Esci',
      // Detto solo quando l'uscita NON è riuscita: su un telefono condiviso
      // «sono uscito» non può restare un'affermazione falsa e silenziosa.
      logoutError: 'Non sei uscito: controlla la connessione e riprova.',
      phone: 'Telefono',
      location: 'Località',
      country: 'Paese',
      birthDate: 'Data di nascita',
      completeCta: 'Completa il tuo profilo',
      // Campo del profilo mai valorizzato (profilo minimo): meglio dire che manca
      // che lasciare una riga vuota, che sembrerebbe un difetto dell'app.
      toComplete: 'Da completare',
    },
    completeProfile: {
      title: 'Completa il profilo',
      subtitle: 'Mancano alcuni dati per completare la registrazione',
      submit: 'Salva e continua',
      contactEmail: 'Email di contatto',
      contactEmailPlaceholder: 'Dove riceverai ricevute e comunicazioni',
      contactEmailPlaceholderRelay:
        'Scrivi la tua email vera: quella di Apple è nascosta',
      // Testi che compaiono SOLO quando questa schermata è il passaggio obbligato dopo
      // l'accesso. Dicono tre cose: che è una volta sola, che finisce appena si salva,
      // e come uscire — chi non trova una via d'uscita disinstalla l'app.
      gateNotice:
        'Prima di continuare ci mancano alcuni tuoi dati. Li chiediamo una volta sola: appena li salvi torni all’app.',
      gateExitHint: 'Preferisci farlo più tardi?',
    },
    edit: {
      title: 'Modifica profilo',
      subtitle: 'Aggiorna i tuoi dati personali',
      email: 'Email',
      save: 'Salva modifiche',
      success: 'Profilo aggiornato.',
      emailNotice:
        'Per cambiare email, conferma il link inviato a entrambe le caselle (vecchia e nuova).',
      emailPending:
        'Cambio email in attesa di conferma: {{email}}. Conferma il link inviato a entrambe le caselle per completarlo.',
      error: 'Aggiornamento non riuscito. Riprova.',
      // Il salvataggio è UNO solo per tutti i campi: se l'indice respinge il nickname,
      // cade anche il resto. Dirlo evita che si esca da qui credendo il contrario.
      nothingSaved:
        'Nessuna modifica è stata salvata: cambia il nickname e salva di nuovo.',
    },
    privacy: {
      title: 'Privacy e dati',
      exportCta: 'Esporta i miei dati',
      exportError: 'Esportazione non riuscita. Riprova.',
      deleteCta: 'Elimina account',
    },
    delete: {
      title: 'Elimina account',
      warning:
        'Questa azione è irreversibile: i tuoi dati personali verranno eliminati definitivamente.',
      now: 'Elimina subito',
      scheduled: 'Elimina tra 30 giorni',
      // «Disattivato» era falso: nessuna regola sospende l'account nei 30 giorni,
      // che restano un periodo di ripensamento in cui tutto continua a funzionare.
      scheduledHint:
        'Hai 30 giorni per ripensarci: l’account resta utilizzabile e puoi annullare quando vuoi. Passati i 30 giorni viene eliminato definitivamente.',
      confirmNow:
        'L’account e tutti i dati saranno eliminati subito. Confermi?',
      confirmScheduled:
        'L’account sarà eliminato tra 30 giorni. Potrai annullare accedendo di nuovo. Confermi?',
      confirm: 'Sì, procedi',
      cancel: 'Annulla',
      banner: 'Eliminazione programmata il',
      bannerCancel: 'Annulla eliminazione',
      error: 'Operazione non riuscita. Riprova.',
      // I dati sono stati cancellati davvero: qui manca solo l'uscita sul telefono,
      // quindi il testo NON deve far credere che la cancellazione sia fallita.
      sessionResidua:
        'Account eliminato. Non siamo riusciti a chiudere la sessione su questo telefono: esci a mano dal profilo.',
    },
    consents: {
      title: 'Consensi',
      marketing: 'Comunicazioni e aggiornamenti',
      marketingHint: 'Puoi attivare o revocare in ogni momento.',
      reconsentTitle: 'Aggiornamento informativa',
      reconsentBody:
        'Abbiamo aggiornato l’informativa privacy. Leggila e accetta per continuare.',
      reconsentAccept: 'Accetto',
      error: 'Operazione non riuscita. Riprova.',
    },
    errors: {
      required: 'Campo obbligatorio',
      email_invalid: 'Email non valida',
      contact_email_relay:
        'Inserisci un’email reale, non un indirizzo Apple nascosto',
      password_weak: 'Min 8 caratteri, una maiuscola e un carattere speciale',
      phone_invalid: 'Telefono non valido (es. +39...)',
      // La soglia è 14 anni (migration 0019 + `MIN_AGE_YEARS`), non la maggiore età.
      // Il numero è ripetuto qui perché l'i18n non interpola: a tenerlo allineato alla
      // costante è un test, non la buona volontà.
      under_min_age: 'Devi avere almeno 14 anni',
      // La forma è quella del CHECK `nickname_forma` (migration 0017). Il messaggio
      // dice il limite in cifre: «non valido» lascerebbe la persona a indovinare.
      nickname_length: 'Il nickname deve avere da 2 a 30 caratteri',
      // Migration 0018. Non dice CHI lo ha preso — sarebbe un dato di un'altra persona.
      nickname_taken:
        'Questo nickname è già di qualcun altro: scegline un altro',
      // La corsa persa: due registrazioni con lo stesso nickname nello stesso istante.
      // Rarissimo, ma senza questo messaggio l'esito era il silenzio — il difetto che
      // la fase F-NICKNAME-UX esiste per togliere.
      nickname_taken_race:
        'Qualcuno ha scelto questo nickname un attimo prima di te: provane un altro',
      date_invalid: 'Data non valida',
      password_mismatch: 'Le password non coincidono',
      invalid_credentials: 'Email o password non corretti',
      email_not_confirmed: 'Email non ancora confermata. Controlla la posta.',
      already_registered: 'Questa email è già registrata',
      rate_limited: 'Troppi tentativi. Riprova tra poco.',
      // Salvataggio che non basterebbe a completare il profilo: si mostra PRIMA di
      // scrivere, perché il contrario significherebbe salvare e ritrovarsi di nuovo la
      // stessa schermata senza sapere perché.
      profileStillIncomplete:
        'Manca ancora: {{fields}}. Senza questi dati il profilo resta da completare.',
      generic: 'Si è verificato un errore. Riprova.',
    },
  },

  home: {
    welcome: 'Benvenuto',
    subtitle: 'Insieme contro la fame',
    heroTitle: 'Volontari e partner uniti nella\nmissione #famezero',
    ctaButton: 'Scopri come aiutare',
    featuredTitle: 'In Evidenza',
    newsTitle: 'Ultime Notizie',
    // Home Screen - Sezione Azione
    actionTitle: '⚡ Entra in Azione',
    actionMainText: 'Unisciti a noi nella lotta \ncontro la fame nel mondo',
    actionSubText: 'Ogni azione conta per\ncambiare vite',
    // CTA Buttons
    ctaImpactLabel: 'Scopri il nostro impatto',
    ctaImpactHint: 'Apre la sezione Impatto',
    ctaImpactButton: 'Scopri\nImpatto',
    ctaImpactSub: 'Risultati',
    ctaDonateLabel: 'Dona e aiuta',
    ctaDonateHint: 'Apre la sezione Azioni',
    ctaDonateButton: 'Dona e\nAiuta',
    ctaDonateSub: 'Supporta',
    screenLabel: 'Schermata Home',
  },

  impact: {
    title: 'Il Nostro Impatto',
    description: 'I numeri che raccontano il nostro impegno annuale',
    mealsPackaged: 'Pasti Confezionati',
    volunteersInvolved: 'Volontari Coinvolti',
    countriesReached: 'Paesi Raggiunti',
    eventsOrganized: 'Eventi Organizzati',
    communityTitle: 'La Nostra Community',
    communitySubtitle: 'Volontari e partner uniti nella\nmissione #famezero',
    volunteers2024: 'Volontari 2024',
    volunteersActive: "Attivi quest'anno",
    partnersActive: 'Partner Attivi',
    partnersCollaboration: 'Collaborazioni attive',
    totalMeals: 'Pasti Totali',
    totalMealsSubtitle: 'Confezionati dal 2010',
    results2024: 'Risultati 2024',
    viewMap: 'Visualizza Mappa',
    mapTitle: 'La Nostra Presenza nel Mondo',
    // Map Modal
    loadingMap: 'Caricamento mappa...',
    interactiveMap: 'Mappa Interattiva',
    tapPins: 'Tocca i pin per maggiori dettagli',
    closeMap: 'Chiudi la mappa',
    allYears: 'Tutti',
    // Header
    impactTitle1: 'Il Nostro',
    impactTitle2: 'Impatto',
    impactAccessibility: 'Il Nostro Impatto',
    // Stats labels
    totalMealsLabel: 'Pasti Totali',
    totalMealsSubtitle2: 'Dal 2012 - Meals',
    mealsPackagedLabel: 'Pasti Confezionati',
    mealsPackagedSubtitle: 'Prodotti nel 2024',
    volunteersLabel: 'Volontari',
    volunteersDescription: 'Persone che hanno fatto la differenza',
    nutritionLabel: 'Nutrizione per comunità in difficoltà',
    // Impatto 2024 Screen
    impactTitle: 'Un Anno di Impatto',
    impactSubtitle: 'I numeri che raccontano il nostro impegno',
    mealsPackagedStat: 'Pasti Confezionati',
    mealsPackagedDesc: 'Nutrizione per comunità in difficoltà',
    productKitsStat: 'Kit Prodotti',
    productKitsDesc: 'Kit completi per emergenze',
    volunteersStat: 'Volontari',
    volunteersStatDesc: 'Persone che hanno fatto la differenza',
    whereHelpArrives: 'Dove Arrivano i Nostri Aiuti',
    subsaharanAfrica: 'Africa Subsahariana',
    schoolPrograms: 'Programmi scolastici',
    humanitarianEmergencies: 'Emergenze umanitarie',
    italianCommunities: 'Comunità italiane',
    goal2025: 'Obiettivo 2025',
    goal2025Description: 'Superare i 4 milioni di pasti confezionati',
    // TotalMealsSection
    ourNumbers: 'I Nostri Numeri',
    numbersSubtitle: 'Dal 2012 - Meals',
    totalKits: 'Kit Totali',
    totalKitsSubtitle: 'Dal 2020 - Kits',
    // Results2024Section
    resultsAchieved: 'Risultati Raggiunti',
    kitsPackaged: 'Kit Confezionati',
    kitsPackagedSubtitle: 'Creati nel 2024',
    // MapSection
    whereWeOperate: 'Dove Operiamo',
    ourOperationsWorld: 'Le nostre operazioni nel mondo',
    tapToExplore: 'Tocca per esplorare',
  },

  actions: {
    title: 'Cosa Puoi Fare',
    headerTitle: 'Fai la Differenza',
    headerTitle1: 'Fai la',
    headerTitle2: 'Differenza',
    headerSubtitle: 'Ogni azione conta nella lotta contro la fame',
    headerAccessibility: 'Fai la differenza',
    donate: 'Dona',
    donateNow: 'Dona Ora',
    volunteer: 'Diventa Volontario',
    organize: 'Organizza un Evento',
    share: 'Condividi la Missione',
    donateDescription:
      'Il tuo contributo aiuta a preparare pasti per chi ne ha bisogno',
    volunteerDescription: 'Unisciti al nostro team di volontari',
    organizeDescription:
      'Organizza un evento di confezionamento nella tua comunità',
    shareDescription: 'Aiutaci a diffondere la nostra missione',
    donationInfoTitle: 'Come Donare',
    donationMonetary: '💶 Donazioni monetarie:',
    donationMonetaryText:
      'Se vuoi fare una donazione monetaria diretta, clicca su "Dona Ora" per contribuire immediatamente alla nostra missione contro la fame.',
    donationShopping: '🛍️ Acquisti solidali:',
    donationShoppingText:
      'Attraverso il nostro Charity Shop, ogni acquisto dai nostri partner dona automaticamente una percentuale per i nostri programmi. Tu spendi lo stesso prezzo, ma aiuti a combattere la fame!',
    donationGiftCard: '🎁 Gift Cards:',
    donationGiftCardText:
      'Funzionano come gli acquisti: compri una Gift Card a prezzo normale (per te o come regalo), ma una percentuale viene automaticamente donata per la distribuzione di pasti. Aiuti senza costi extra!',
    donationEvents: 'Il modo più semplice è partecipare ai nostri eventi!',
    donateSubtitle: 'Supporta la lotta contro la fame',
    exploreSubtitle: 'Progetti e iniziative umanitarie',
    communitySubtitle: 'Unisciti alla nostra comunità',
    donateTitle: 'Contribuisci',
    exploreTitle: 'Esplora',
    communityTitle: 'Community',
    donateAccessibilityLabel: 'Contribuisci',
    donateInfoAccessibilityLabel: 'Informazioni su Contribuisci',
    communityAccessibilityLabel: 'Community',
    charityShop: 'Charity Shop',
    giftCards: 'Gift Cards',
    projects: 'Progetti',
    tracking: 'Tracciabilità',
    events: 'Eventi',
    follow: 'Seguici',
    aboutUs: 'Chi Siamo',
  },

  partner: {
    disclosureTitle: 'Stai per uscire dall’app',
    disclosureBody:
      'Shop, gift card, eventi, progetti e registrazione alla community sono gestiti da Let’s Donation, il nostro partner. Su quella piattaforma ti verrà chiesto di creare un account separato da quello dell’app: è normale, sono due servizi distinti. Proseguendo verrai reindirizzato.',
    disclosureContinue: 'Continua',
    disclosureCancel: 'Annulla',
  },

  projects: {
    title: 'I Nostri Progetti',
    subtitle:
      'Scopri dove stiamo facendo la differenza nel mondo\nnella lotta alla fame',
    statsTitle: 'Progetti in Numeri',
    totalProjects: 'Progetti\nTotali',
    activeProjects: 'In Corso\nAttualmente',
    peopleHelped: 'Persone\nAiutate',
    emptyState: 'Nessun progetto trovato per questa categoria',
    progress: 'Progresso',
    impact: 'Impatto',
  },

  social: {
    title: 'Seguici sui social',
    subtitle:
      'Resta aggiornato sulle nostre iniziative e unisciti al cambiamento',
    websiteName: 'Sito Web',
    websiteDescription: 'Scopri tutte le nostre iniziative',
    instagramName: 'Instagram',
    instagramDescription: 'Foto e storie delle missioni',
    facebookName: 'Facebook',
    facebookDescription: 'Community e eventi locali',
    linkedinName: 'LinkedIn',
    linkedinDescription: 'Opportunità e partnership',
  },

  development: {
    title: '🚧 In Fase di Sviluppo',
    subtitle: 'Questa sezione sarà presto disponibile',
    whatWeArePreparing: 'Cosa stiamo preparando',
    description:
      "Il nostro team sta lavorando duramente per portarti nuove funzionalità innovative e un'esperienza utente ancora migliore.",
    improvedDesign: 'Design migliorato',
    newFeatures: 'Nuove funzionalità',
    optimizedPerformance: 'Performance ottimizzate',
  },

  about: {
    title: 'Chi Siamo',
    description: 'Organizzazione contro la fame nel mondo',
    accessibilityLabel: 'Apri informazioni su Chi Siamo',
    mission: 'La Nostra Missione',
    missionText:
      'Rise Against Hunger Italia lavora per eliminare la fame nel mondo attraverso il confezionamento e la distribuzione di pasti, sostenendo progetti di sviluppo sostenibile.',
    vision: 'La Nostra Visione',
    visionText: 'Un mondo senza fame entro il 2030.',
    values: 'I Nostri Valori',
    transparency: 'Trasparenza',
    impact: 'Impatto',
    sustainability: 'Sostenibilità',
    locationTitle: 'Sede',
    phoneTitle: 'Telefono',
    emailTitle: 'Email',
    contactsTitle: 'I Nostri Contatti',
    contactsSubtitle: 'Sede di Bologna e recapiti ufficiali',
    ourStory: 'La Nostra Storia',
    ourPillars: 'I Nostri Pilastri',
    globalImpact: 'Impatto Globale',
    storyIntro: 'Dal 1998, un movimento globale contro la fame',
    storyOrigin:
      'Rise Against Hunger nasce nel 1998 negli Stati Uniti con una missione chiara: combattere la fame nel mondo attraverso la distribuzione di pasti nutrienti e lo sviluppo di programmi sostenibili.',
    inItaly: '🇮🇹 In Italia',
    italyText:
      "L'organizzazione arriva in Italia con l'obiettivo di coinvolgere le comunità locali nella lotta contro la fame globale. La nostra sede di Bologna è il cuore operativo e la sede centrale per tutta Europa, coordinando le attività sul territorio nazionale ed europeo.",
    mealDistribution: 'Distribuzione Pasti',
    mealDistributionText:
      'Organizziamo eventi di confezionamento pasti che coinvolgono volontari di ogni età',
    communityInvolvement: 'Coinvolgimento Comunitario',
    communityInvolvementText:
      'Uniamo scuole, aziende e organizzazioni in un impegno condiviso',
    globalImpactText:
      'I pasti confezionati raggiungono comunità vulnerabili in tutto il mondo',
    education: 'Educazione',
    educationText:
      'Sensibilizziamo sul tema della fame e promuoviamo la solidarietà',
    finalMessage:
      'Ogni pasto che confezioniamo insieme è un gesto di amore che attraversa i confini e raggiunge chi ne ha più bisogno.',
    joinUs: 'Unisciti a noi in questa missione! 💙',
  },

  errors: {
    generic: 'Si è verificato un errore',
    network: 'Errore di connessione. Verifica la tua connessione internet.',
    notFound: 'Contenuto non trovato',
    unauthorized: 'Accesso non autorizzato',
    serverError: 'Errore del server. Riprova più tardi.',
  },

  updates: {
    checking: 'Controllo aggiornamenti...',
    downloading: 'Scaricamento aggiornamento...',
    upToDate: 'App aggiornata',
    error: "Errore durante l'aggiornamento",
    improving: 'Stiamo migliorando la tua esperienza',
  },
};
