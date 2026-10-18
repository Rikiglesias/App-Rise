/**
 * Traduzioni Italiano
 * Rise Against Hunger Italia
 */

export default {
  accessibility: {
    closeModal: 'Chiudi modale',
    openContact: 'Apri {{title}}',
    organizationStory: "Mostra la storia dell'organizzazione",
    closeDonationInfo: 'Chiudi informazioni donazioni',
    closeDatePicker: 'Chiudi selezione data',
    followSocial: 'Seguici su {{name}}: {{handle}}',
    project: 'Progetto {{title}} in {{location}}',
    projectStatusActive: 'In Corso',
    projectStatusCompleted: 'Completato',
    projectStatusUpcoming: 'Prossimo',
    impactScreen: 'Schermata Impatto',
    impactScroll: 'Scroll impatto e statistiche',
    organizationLogo: 'Logo Rise Against Hunger',
    heroImage: 'Immagine Rise Against Hunger',
    unnamedCategory: 'Categoria senza nome',
  },

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

  links: {
    errors: {
      default: 'Impossibile aprire il link. Riprova più tardi.',
      social: 'Impossibile aprire {{platform}}. Riprova più tardi.',
      website: 'Impossibile aprire il sito web. Riprova più tardi.',
      tracking:
        'Impossibile aprire la pagina di tracciamento. Riprova più tardi.',
      map: 'Impossibile aprire la mappa. Cerca questo indirizzo: {{address}}.',
      phone: 'Impossibile aprire il telefono. Chiama il numero {{phone}}.',
      email: "Impossibile aprire l'app email. Scrivi a {{email}}.",
      donation: 'Impossibile aprire il link di donazione. Riprova più tardi.',
      shop: 'Impossibile aprire il charity shop. Riprova più tardi.',
      giftCards: 'Impossibile aprire le gift card. Riprova più tardi.',
      projects: 'Impossibile aprire la pagina progetti. Riprova più tardi.',
      events: 'Impossibile aprire il calendario eventi. Riprova più tardi.',
      registration:
        'Impossibile aprire la pagina di registrazione. Riprova più tardi.',
    },
  },

  support: {
    reportProblem: 'Segnala un problema',
    reportSubject: 'App Rise: segnalazione di un problema',
    invitation: 'Descrivi il problema e cosa stavi facendo:',
    diagnostics: 'Diagnosi tecnica',
    version: 'Versione app',
    update: 'Aggiornamento',
    development: 'sviluppo',
    embedded: 'embedded',
    runtime: 'Runtime',
    channel: 'Canale',
    emergencyLaunch: 'Avvio di emergenza',
    yes: 'sì',
    no: 'no',
    platform: 'Piattaforma',
    systemVersion: 'Versione sistema',
    manufacturer: 'Produttore',
    model: 'Modello',
    release: 'Release sistema',
    language: 'Lingua',
    fontScale: 'Scala del testo',
    window: 'Finestra',
    errors:
      'Errori recenti (ora UTC · contesto · nome · codice · stato · chiave)',
    noErrors: 'nessun errore registrato',
    shareText: 'Condividi il testo',
    shareError: 'Impossibile condividere il testo. Riprova.',
  },

  mapDetails: {
    countryLabel: '{{country}}: tocca per i dettagli',
    countryEventsLabel: '{{country}}: {{count}} eventi, tocca per i dettagli',
    countriesLabel: 'Paesi dove operiamo',
    meals: 'Pasti',
    kits: 'Kit',
    schools: 'Scuole',
    program: 'PROGRAMMA',
    partner: 'PARTNER',
    achievements: 'RISULTATI',
    trackingLabel: 'Apri il tracciamento di {{location}}',
    followTracking: 'Segui il tracciamento',
  },

  errorBoundary: {
    title: 'Qualcosa è andato storto',
    subtitle: "L'app ha riscontrato un errore imprevisto",
    genericMessage: "Ricarica l'app e riprova.",
    technicalTitle: 'Errore Tecnico:',
    unknownError: 'Errore sconosciuto',
    stackTrace: 'Stack trace (solo sviluppo):',
    componentStack: 'Stack dei componenti:',
    reload: '🔄 Ricarica App',
    ignore: 'Ignora errore (solo sviluppo)',
    support: 'Se il problema persiste, scrivi a info@riseagainsthunger.it.',
    loadingTitle: 'Errore di caricamento',
    loadingMessage: 'Impossibile caricare la schermata. Riprova.',
  },

  navigation: {
    home: 'Home',
    impact: 'Impatto',
    actions: 'Azioni',
    about: 'Chi Siamo',
    profile: 'Profilo',
  },

  auth: {
    resend: {
      submit: 'Invia di nuovo la conferma',
      sent: 'Richiesta inviata. Controlla la tua casella email, anche nello spam.',
      wait: 'Puoi chiedere un nuovo invio tra {{seconds}} s.',
    },
    phoneField: {
      placeholder: 'Inserisci il numero di telefono',
      numberHint: 'Inserisci il numero senza il prefisso internazionale',
      choosePrefix: 'Scegli il prefisso internazionale',
      prefixHint: 'Apre la lista dei paesi e dei prefissi',
    },
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
    // Link dell'email aperto quando era già scaduto o usato: Supabase rientra
    // nell'app con un errore al posto dei token, e prima non succedeva nulla.
    linkExpired: {
      title: 'Link scaduto',
      reset:
        'Il link per reimpostare la password è scaduto o è già stato usato. Chiedine uno nuovo con «Password dimenticata?» nella schermata di accesso.',
      confirm:
        'Il link di conferma è scaduto o è già stato usato. Se hai già confermato l’email, accedi pure. Altrimenti apri Profilo e prova ad accedere: sotto l’avviso «Email non ancora confermata» puoi scegliere «Invia di nuovo la conferma».',
      emailChange:
        'Il link per cambiare email è scaduto o è già stato usato. Controlla il tuo indirizzo nel profilo e, se non è aggiornato, richiedi di nuovo il cambio email.',
    },
    linkFailed: {
      title: 'Link di accesso non riuscito',
      reset:
        'Non è stato possibile aprire il recupero password. Chiedi un nuovo link con «Password dimenticata?» e apri l’ultima email sullo stesso dispositivo da cui l’hai richiesto.',
    },
    emailConfirmed: {
      title: 'Email confermata',
      message: 'La tua email è stata confermata.',
      signIn: 'La tua email è stata confermata. Accedi con email e password.',
    },
    emailUpdated: {
      title: 'Email aggiornata',
      message: 'Il tuo indirizzo email è stato aggiornato.',
      signIn:
        'Il tuo indirizzo email è stato aggiornato. Accedi con il nuovo indirizzo e la tua password.',
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
      exportTitle: 'I miei dati — Rise Against Hunger',
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
      signOut: "Esci dall'account",
      title: 'Consensi',
      marketing: 'Comunicazioni e aggiornamenti',
      marketingHint: 'Puoi attivare o revocare in ogni momento.',
      reconsentTitle: 'Aggiornamento informativa',
      reconsentBody:
        'Abbiamo aggiornato l’informativa privacy. Leggila e accetta per continuare.',
      reconsentRead: 'Leggi l’informativa',
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
      network: 'Nessuna connessione. Controlla internet e riprova.',
      session_unreadable:
        'Impossibile leggere la sessione salvata. Accedi di nuovo.',
      same_password: 'Scegli una password diversa da quella attuale.',
      weak_password:
        'Questa password non è abbastanza sicura. Scegline una più forte.',
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
    volunteersInvolvedIn: 'Coinvolti nel {{year}}',
    partnerAssociationsLabel: 'Associazioni',
    partnerAssociationsSubtitle: 'Partner nel {{year}}',
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
    totalMealsSubtitle2: 'Prodotti dal 2012',
    mealsPackagedLabel: 'Pasti Confezionati',
    mealsPackagedSubtitle: 'Prodotti nel {{year}}',
    volunteersLabel: 'Volontari',
    volunteersDescription: 'Persone che hanno fatto la differenza',
    nutritionLabel: 'Nutrizione per comunità in difficoltà',
    // TotalMealsSection
    ourNumbers: 'I Nostri Numeri',
    numbersSubtitle: 'Dalla nascita di Rise Against Hunger Italia',
    totalKits: 'Kit Totali',
    totalKitsSubtitle: 'Prodotti dal 2020',
    // AnnualResultsSection
    resultsAchieved: 'Risultati del {{year}}',
    livesImpactedLabel: 'Vite Impattate',
    livesImpactedSubtitle: 'Con i pasti del {{year}}',
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
    donorboxDisclosureTitle: 'Stai per uscire dall’app',
    donorboxDisclosureBody:
      'Le donazioni sono gestite da Donorbox, il nostro partner. Per non farti riscrivere tutto, nell’indirizzo che stiamo per aprire mettiamo il tuo nome, il tuo cognome e la tua email, così il modulo risulta già compilato. Un indirizzo però resta nella cronologia del browser: se preferisci, puoi proseguire senza e compilare a mano.',
    donorboxContinueWithoutData: 'Continua senza i miei dati',
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
    visionText:
      'Ci guida la visione di un mondo senza fame, in cui cibo, salute e istruzione siano accessibili a tutti, in modo tale che chiunque possa nutrire con dignità le proprie aspirazioni.',
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
    logo: 'Logo Rise Against Hunger Italia',
    message: 'Stiamo aggiornando l’app',
    subMessage: 'Grazie della pazienza, ci vorranno solo pochi secondi',
    complete: 'Aggiornamento completato!',
    progressLabel: 'Avanzamento aggiornamento',
    progressPercent: '{{progress}}%',
    checking: 'Controllo aggiornamenti...',
    downloading: 'Scaricamento aggiornamento...',
    upToDate: 'App aggiornata',
    error: "Errore durante l'aggiornamento",
    improving: 'Stiamo migliorando la tua esperienza',
  },
};
