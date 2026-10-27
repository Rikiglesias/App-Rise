/**
 * English Translations
 * Rise Against Hunger Italy
 */

export default {
  accessibility: {
    closeModal: 'Close dialog',
    openContact: 'Open {{title}}',
    organizationStory: "Show the organization's history",
    closeDonationInfo: 'Close donation information',
    closeDatePicker: 'Close date picker',
    followSocial: 'Follow us on {{name}}: {{handle}}',
    project: 'Project {{title}} in {{location}}',
    projectStatusActive: 'In Progress',
    projectStatusCompleted: 'Completed',
    projectStatusUpcoming: 'Upcoming',
    impactScreen: 'Impact screen',
    impactScroll: 'Scroll impact and statistics',
    organizationLogo: 'Rise Against Hunger logo',
    heroImage: 'Rise Against Hunger image',
    unnamedCategory: 'Unnamed category',
  },

  common: {
    appName: 'Rise Against Hunger Italy',
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    finish: 'Finish',
    skip: 'Skip',
  },

  links: {
    errors: {
      default: 'Unable to open the link. Please try again later.',
      social: 'Unable to open {{platform}}. Please try again later.',
      website: 'Unable to open the website. Please try again later.',
      tracking: 'Unable to open the tracking page. Please try again later.',
      map: 'Unable to open the map. Search for this address: {{address}}.',
      phone: 'Unable to open the phone app. Call {{phone}}.',
      email: 'Unable to open the email app. Write to {{email}}.',
      donation: 'Unable to open the donation link. Please try again later.',
      shop: 'Unable to open the charity shop. Please try again later.',
      giftCards: 'Unable to open gift cards. Please try again later.',
      projects: 'Unable to open the projects page. Please try again later.',
      events: 'Unable to open the events calendar. Please try again later.',
      registration:
        'Unable to open the registration page. Please try again later.',
    },
  },

  support: {
    reportProblem: 'Report a problem',
    reportSubject: 'App Rise: problem report',
    invitation: 'Describe the problem and what you were doing:',
    diagnostics: 'Technical diagnostics',
    version: 'App version',
    update: 'Update',
    development: 'development',
    embedded: 'embedded',
    runtime: 'Runtime',
    channel: 'Channel',
    emergencyLaunch: 'Emergency launch',
    yes: 'yes',
    no: 'no',
    platform: 'Platform',
    systemVersion: 'System version',
    manufacturer: 'Manufacturer',
    model: 'Model',
    release: 'System release',
    language: 'Language',
    fontScale: 'Text scale',
    window: 'Window',
    errors: 'Recent errors (UTC time · context · name · code · status · key)',
    noErrors: 'no recorded errors',
    shareText: 'Share the text',
    shareError: "Couldn't share the text. Please try again.",
  },

  mapDetails: {
    countryLabel: '{{country}}: tap for details',
    countryEventsLabel: '{{country}}: {{count}} events, tap for details',
    countriesLabel: 'Countries where we work',
    meals: 'Meals',
    kits: 'Kits',
    schools: 'Schools',
    program: 'PROGRAM',
    partner: 'PARTNER',
    achievements: 'RESULTS',
    trackingLabel: 'Open tracking for {{location}}',
    followTracking: 'Track deliveries',
  },

  errorBoundary: {
    title: 'Something went wrong',
    subtitle: 'The app encountered an unexpected error',
    genericMessage: 'Please reload the app and try again.',
    technicalTitle: 'Technical error:',
    unknownError: 'Unknown error',
    stackTrace: 'Stack trace (development only):',
    componentStack: 'Component stack:',
    reload: '🔄 Reload app',
    ignore: 'Ignore error (development only)',
    support: 'If the problem persists, write to info@riseagainsthunger.it.',
    loadingTitle: 'Loading error',
    loadingMessage: 'Unable to load this screen. Please try again.',
  },

  navigation: {
    home: 'Home',
    impact: 'Impact',
    actions: 'Actions',
    about: 'About Us',
  },

  auth: {
    resend: {
      submit: 'Resend confirmation',
      sent: 'Request sent. Check your email inbox, including spam.',
      wait: 'You can request another email in {{seconds}} s.',
    },
    phoneField: {
      placeholder: 'Enter your phone number',
      numberHint: 'Enter the number without the international calling code',
      choosePrefix: 'Choose the international calling code',
      prefixHint: 'Opens the list of countries and calling codes',
    },
    a11y: {
      showPassword: 'Show password',
      hidePassword: 'Hide password',
    },
    login: {
      title: 'Donor Area',
      email: 'Email',
      password: 'Password',
      submit: 'Sign in',
      welcome: 'Welcome',
      forgotPassword: 'Forgot password?',
      createAccount: "Don't have an account? Create one",
    },
    signup: {
      title: 'Create account',
      sections: {
        personal: 'Personal details',
        account: 'Account',
        contacts: 'Contacts',
        consents: 'Consents',
      },
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      phone: 'Phone',
      country: 'Country',
      city: 'City',
      cityPlaceholder: 'Search your town',
      cityForeignPlaceholder: 'Your city',
      province: 'Province',
      provincePlaceholder: 'Auto-filled from the city',
      birthDate: 'Date of birth',
      birthDatePlaceholder: 'Select date',
      nickname: 'Nickname (optional)',
      nicknamePlaceholder: 'How partner sites should call you',
      nicknameChecking: 'Checking…',
      nicknameFree: 'Available',
      nicknameUnknown: "We couldn't check right now: you can carry on",
      privacyConsent: 'I accept the',
      privacyConsentLink: 'privacy policy',
      marketingConsent: 'I want to receive updates (optional)',
      submit: 'Sign up',
      hasAccount: 'Already have an account? Sign in',
      checkEmail: 'We sent you a verification email. Confirm it to sign in.',
    },
    forgot: {
      title: 'Reset password',
      email: 'Email',
      submit: 'Send reset link',
      sent: 'If the email exists, you will receive a link to reset your password.',
      error: 'Could not send. Please try again shortly.',
      backToLogin: 'Back to login',
    },
    reset: {
      title: 'Set new password',
      newPassword: 'New password',
      confirmPassword: 'Confirm password',
      submit: 'Save password',
      success: 'Password updated. You can now sign in with your new password.',
      continue: 'Continue',
    },
    // Email link opened after it expired or was already used: Supabase returns
    // to the app with an error instead of tokens, and nothing used to happen.
    linkExpired: {
      title: 'Link expired',
      reset:
        'This password reset link has expired or was already used. Request a new one with “Forgot password?” on the sign-in screen.',
      confirm:
        'This confirmation link has expired or was already used. If you already confirmed your email, just sign in. Otherwise open Profile and try signing in: below the “Email not confirmed yet” message, choose “Resend confirmation”.',
      emailChange:
        'This email change link has expired or was already used. Check your address in your profile and, if it has not changed, request the email change again.',
    },
    linkFailed: {
      title: 'Sign-in link failed',
      reset:
        'Password recovery could not be opened. Request a new link with “Forgot password?” and open the latest email on the same device you requested it from.',
    },
    emailConfirmed: {
      title: 'Email confirmed',
      message: 'Your email has been confirmed.',
      signIn:
        'Your email has been confirmed. Sign in with your email and password.',
    },
    emailUpdated: {
      title: 'Email updated',
      message: 'Your email address has been updated.',
      signIn:
        'Your email address has been updated. Sign in with your new address and password.',
    },
    profile: {
      title: 'My profile',
      logout: 'Sign out',
      // Shown only when signing out did NOT succeed: on a shared phone
      // "I signed out" must never stay a silent falsehood.
      logoutError:
        "You're still signed in: check your connection and try again.",
      phone: 'Phone',
      location: 'Location',
      country: 'Country',
      birthDate: 'Date of birth',
      completeCta: 'Complete your profile',
      toComplete: 'To be completed',
    },
    completeProfile: {
      title: 'Complete your profile',
      subtitle: 'A few details are missing to complete your registration',
      submit: 'Save and continue',
      contactEmail: 'Contact email',
      contactEmailPlaceholder: 'Where you will receive receipts and updates',
      contactEmailPlaceholderRelay:
        'Enter your real email: your Apple one is hidden',
      gateNotice:
        'Before you continue, a few of your details are missing. We ask only once: as soon as you save them you are back in the app.',
      gateExitHint: 'Would you rather do it later?',
    },
    edit: {
      title: 'Edit profile',
      subtitle: 'Update your personal details',
      email: 'Email',
      save: 'Save changes',
      success: 'Profile updated.',
      emailNotice:
        'To change your email, confirm the link sent to both inboxes (old and new).',
      emailPending:
        'Email change pending confirmation: {{email}}. Confirm the link sent to both inboxes to complete it.',
      error: 'Update failed. Please try again.',
      partialSave:
        'Your profile details were saved, but your email address has not changed. Try changing your email again.',
      partialSaveReason:
        'Your profile details were saved, but your email address has not changed. {{reason}}',
      nothingSaved: 'Nothing was saved: change the nickname and save again.',
    },
    privacy: {
      title: 'Privacy and data',
      exportCta: 'Export my data',
      exportTitle: 'My data — Rise Against Hunger Italia ETS',
      exportError: 'Export failed. Please try again.',
      deleteCta: 'Delete account',
    },
    delete: {
      title: 'Delete account',
      warning:
        'This action is irreversible: the data of your app account will be permanently deleted. Data you left on Let’s Donation and Donorbox stays there: to delete it, write to them or to us.',
      now: 'Delete now',
      scheduled: 'Delete in 30 days',
      // "Disabled" was untrue: nothing suspends the account during the 30 days,
      // which are a change-your-mind window in which everything keeps working.
      scheduledHint:
        'You have 30 days to change your mind: your account stays usable and you can cancel at any time. After 30 days it is permanently deleted.',
      confirmNow:
        'Your app account and its data will be deleted now; data on Let’s Donation and Donorbox stays. Confirm?',
      confirmScheduled:
        'Your account will be deleted in 30 days. You can cancel by signing in again. Confirm?',
      confirm: 'Yes, proceed',
      cancel: 'Cancel',
      banner: 'Deletion scheduled for',
      bannerCancel: 'Cancel deletion',
      error: 'Operation failed. Please try again.',
      // Shown as a guest, even when the sign-out on this phone failed: the app leaves
      // the account on its own (AuthContext), so the text asks nothing more of anyone.
      done: 'Account deleted: your app account data has been erased.',
      // The call failed and the server could not tell either whether the account
      // still exists: say how to find out, without promising either outcome.
      esitoIncerto:
        'We could not find out whether your account was deleted. When you are back online, open Account: if you are still signed in, tap “Delete account” again and we will confirm it. If you are signed out, the account may have been deleted or the session may have expired: to know for sure, write to info@riseagainsthunger.it.',
    },
    consents: {
      signOut: 'Sign out of your account',
      title: 'Consents',
      marketing: 'Communications and updates',
      marketingHint: 'You can enable or withdraw at any time.',
      reconsentTitle: 'Privacy policy update',
      reconsentBody:
        'We have updated our privacy policy. Please read and accept to continue.',
      reconsentRead: 'Read the privacy notice',
      reconsentAccept: 'Accept',
      error: 'Operation failed. Please try again.',
    },
    errors: {
      required: 'Required field',
      email_invalid: 'Invalid email',
      contact_email_relay: 'Enter a real email, not a hidden Apple address',
      password_weak:
        'Min 8 characters, one uppercase and one special character',
      phone_invalid: 'Invalid phone (e.g. +39...)',
      under_min_age: 'You must be at least 14 years old',
      nickname_length: 'The nickname must be 2 to 30 characters long',
      nickname_taken:
        'That nickname already belongs to someone else: pick another',
      nickname_taken_race:
        'Someone picked that nickname a moment before you: try another',
      date_invalid: 'Invalid date',
      password_mismatch: 'Passwords do not match',
      invalid_credentials: 'Incorrect email or password',
      email_not_confirmed: 'Email not confirmed yet. Check your inbox.',
      already_registered: 'This email is already registered',
      rate_limited: 'Too many attempts. Please try again shortly.',
      network: 'No connection. Check your internet and try again.',
      session_unreadable: 'Unable to read the saved session. Sign in again.',
      same_password: 'Choose a password different from your current one.',
      weak_password:
        'This password is not secure enough. Choose a stronger one.',
      profileStillIncomplete:
        'Still missing: {{fields}}. Without these details your profile stays incomplete.',
      generic: 'An error occurred. Please try again.',
    },
  },

  home: {
    welcome: 'Welcome',
    subtitle: 'Together against hunger',
    heroTitle: 'Volunteers and partners united in the\nmission #zerohunger',
    ctaButton: 'Discover how to help',
    featuredTitle: 'Featured',
    newsTitle: 'Latest News',
    // Home Screen - Action Section
    actionTitle: '⚡ Take Action',
    actionMainText: 'Join us in the fight \nagainst world hunger',
    actionSubText: 'Every action counts to\nchange lives',
    // CTA Buttons
    ctaImpactLabel: 'Discover our impact',
    ctaImpactHint: 'Opens the Impact section',
    ctaImpactButton: 'Discover\nImpact',
    ctaImpactSub: 'Results',
    ctaDonateLabel: 'Donate and help',
    ctaDonateHint: 'Opens the Actions section',
    ctaDonateButton: 'Donate and\nHelp',
    ctaDonateSub: 'Support',
    screenLabel: 'Home Screen',
  },

  impact: {
    title: 'Our Impact',
    description: 'The numbers that tell our annual commitment',
    mealsPackaged: 'Meals Packaged',
    volunteersInvolved: 'Volunteers Involved',
    countriesReached: 'Countries Reached',
    eventsOrganized: 'Events Organized',
    communityTitle: 'Our Community',
    communitySubtitle:
      'Volunteers and partners united in the\n#zerohunger mission',
    volunteersInvolvedIn: 'Involved in {{year}}',
    partnerAssociationsLabel: 'Organizations',
    partnerAssociationsSubtitle: 'Partners in {{year}}',
    totalMeals: 'Total Meals',
    totalMealsSubtitle: 'Packaged since 2010',
    results2024: 'Results 2024',
    viewMap: 'View Map',
    mapTitle: 'Our Global Presence',
    // Map Modal
    loadingMap: 'Loading map...',
    interactiveMap: 'Interactive Map',
    tapCountries: 'Tap a country for more details',
    closeMap: 'Close map',
    allYears: 'All',
    // Header
    impactTitle1: 'Our',
    impactTitle2: 'Impact',
    impactAccessibility: 'Our Impact',
    // Stats labels
    totalMealsLabel: 'Total Meals',
    totalMealsSubtitle2: 'Produced since 2012',
    mealsPackagedLabel: 'Meals Packaged',
    mealsPackagedSubtitle: 'Produced in {{year}}',
    volunteersLabel: 'Volunteers',
    volunteersDescription: 'People who made a difference',
    nutritionLabel: 'Nutrition for communities in need',
    // TotalMealsSection
    ourNumbers: 'Our Numbers',
    numbersSubtitle: 'Since Rise Against Hunger Italia began',
    totalKits: 'Total Kits',
    totalKitsSubtitle: 'Produced since 2020',
    // AnnualResultsSection
    resultsAchieved: 'Our {{year}} Results',
    livesImpactedLabel: 'Lives Impacted',
    livesImpactedSubtitle: 'Through {{year}} meals',
    // MapSection
    whereWeOperate: 'Where We Operate',
    ourOperationsWorld: 'Our operations worldwide',
    tapToExplore: 'Tap to explore',
    // Detail pages (Annual Report 2025): numbers from IMPACT_DATA, years by interpolation
    details: {
      inYear: 'In {{year}}',
      sinceStart: 'Since Rise Against Hunger Italia began',
      meals: {
        title: 'Meals',
        intro:
          'At packaging events, participants assemble rice, soy, lentils and vitamins into bags. The boxes leave the Rise Against Hunger warehouses and local partners distribute the meals in schools: to prepare them, just add boiling water and stir.',
        schools:
          'The programme supports school attendance: a meal at school encourages families to send their children to school, secures their right to education and gives boys and girls the same opportunities.',
        distributedLabel: 'Meals distributed',
        byCountry: 'Meals distributed in {{year}}',
        zimbabwe: 'Zimbabwe',
        southAfrica: 'South Africa',
        ukraine: 'Ukraine',
      },
      kits: {
        title: 'Food kits',
        intro:
          'The kit packing programme began during the Covid-19 pandemic to respond to emergencies. Today it helps people struggling because of wars and humanitarian crises, and also here at home.',
        content:
          'Each kit holds easy-to-cook food, the equivalent of about {{meals}} meals, and is easy to carry even where it is hard to reach.',
        producedLabel: 'Kits produced',
        distributedLabel: 'Kits distributed',
        guaranteedLabel: 'Meals provided',
        guaranteedSubtitle: 'Through kits distributed in {{year}}',
        byArea: 'Kits distributed in {{year}}',
        italy: 'Italy',
        ukraine: 'Ukraine',
        europe: 'Europe',
        livesSubtitle: 'Through {{year}} kits',
      },
      volunteers: {
        title: 'Volunteers',
        intro:
          'Involving people is the heart of what we do: by packaging meals, thousands of people take part every year in changing the world.',
        together:
          'Individuals, associations and companies package meals and food kits together, including at events open to everyone.',
      },
      partners: {
        title: 'Partner organizations',
        intro:
          'We work with local partners and organizations to tackle the challenges of food security and nutrition with skill and dignity.',
        network:
          'In emergencies, a strong network of local partners helps us distribute food effectively.',
        listTitle: 'The organizations we work with',
      },
      beneficiaries: {
        title: 'Lives reached',
        intro:
          'Where there is extreme poverty, distributing nutritious meals is essential for the health and well-being of boys and girls who would otherwise not have a guaranteed daily meal.',
        lifetimeSubtitle:
          'Through meals, since Rise Against Hunger Italia began',
      },
    },
  },

  actions: {
    title: 'What You Can Do',
    headerTitle: 'Make a Difference',
    headerTitle1: 'Make a',
    headerTitle2: 'Difference',
    headerSubtitle: 'Every action counts in the fight against hunger',
    headerAccessibility: 'Make a difference',
    donate: 'Donate',
    donateNow: 'Donate Now',
    volunteer: 'Become a Volunteer',
    organize: 'Organize an Event',
    share: 'Share the Mission',
    donateDescription:
      'Your contribution helps prepare meals for those in need',
    volunteerDescription: 'Join our volunteer team',
    organizeDescription: 'Organize a meal packaging event in your community',
    shareDescription: 'Help us spread our mission',
    donationInfoTitle: 'How to Donate',
    donationMonetary: '💶 Monetary donations:',
    donationMonetaryText:
      'If you want to make a direct monetary donation, click on "Donate Now" to contribute immediately to our mission against hunger.',
    donationShopping: '🛍️ Charity shopping:',
    donationShoppingText:
      'Through our Charity Shop, every purchase from our partners automatically donates a percentage to our programs. You pay the same price, but help fight hunger!',
    donationGiftCard: '🎁 Gift Cards:',
    donationGiftCardText:
      'With our gift cards, you can choose the perfect gift while making a difference. Your loved ones will receive a unique experience, and you will contribute to feeding those in need.',
    donationEvents: 'The easiest way is to participate in our events!',
    donateSubtitle: 'Support the fight against hunger',
    exploreSubtitle: 'Humanitarian projects and initiatives',
    communitySubtitle: 'Join our community',
    donateTitle: 'Contribute',
    exploreTitle: 'Explore',
    communityTitle: 'Community',
    donateAccessibilityLabel: 'Contribute',
    donateInfoAccessibilityLabel: 'Contribute information',
    communityAccessibilityLabel: 'Community',
    charityShop: 'Charity Shop',
    giftCards: 'Gift Cards',
    projects: 'Projects',
    tracking: 'Tracking',
    events: 'Events',
    follow: 'Follow Us',
    aboutUs: 'About Us',
  },

  partner: {
    donorboxDisclosureTitle: 'You are about to leave the app',
    donorboxDisclosureBody:
      'Donations are handled by Donorbox, our partner. So you do not have to retype everything, the address we are about to open carries your first name, last name and email, so the form comes pre-filled. An address does stay in your browser history, though: if you prefer, you can carry on without them and fill the form in yourself.',
    donorboxContinueWithoutData: 'Continue without my details',
    disclosureTitle: 'You’re leaving the app',
    disclosureBody:
      'Shop, gift cards, events, projects and community registration are handled by Let’s Donation, our partner. That platform has its own account, separate from your app one: if you don’t have one yet, it will ask you to create it. If you continue, you’ll be redirected.',
    disclosureContinue: 'Continue',
    disclosureCancel: 'Cancel',
  },

  projects: {
    title: 'Our Projects',
    subtitle:
      'Discover where we are making a difference in the world\nin the fight against hunger',
    statsTitle: 'Projects in Numbers',
    totalProjects: 'Total\nProjects',
    activeProjects: 'Currently\nOngoing',
    peopleHelped: 'People\nHelped',
    emptyState: 'No projects found for this category',
    progress: 'Progress',
    impact: 'Impact',
  },

  social: {
    title: 'Follow us on social',
    subtitle: 'Stay updated on our initiatives and join the change',
    websiteName: 'Website',
    websiteDescription: 'Discover all our initiatives',
    instagramName: 'Instagram',
    instagramDescription: 'Photos and stories from missions',
    facebookName: 'Facebook',
    facebookDescription: 'Community and local events',
    youtubeName: 'YouTube',
    youtubeDescription: 'Videos of our activities',
    linkedinName: 'LinkedIn',
    linkedinDescription: 'Opportunities and partnerships',
  },

  about: {
    title: 'About Us',
    description: 'Organization fighting world hunger',
    accessibilityLabel: 'Open About Us information',
    mission: 'Our Mission',
    missionText:
      'Rise Against Hunger Italy works to eliminate world hunger through meal packaging and distribution, supporting sustainable development projects.',
    vision: 'Our Vision',
    visionText:
      'We are guided by the vision of a world without hunger, where food, health and education are accessible to everyone, so that anyone can nourish their aspirations with dignity.',
    values: 'Our Values',
    transparency: 'Transparency',
    impact: 'Impact',
    sustainability: 'Sustainability',
    locationTitle: 'Location',
    phoneTitle: 'Phone',
    emailTitle: 'Email',
    contactsTitle: 'Our Contacts',
    contactsSubtitle: 'Bologna headquarters and official contacts',
    ourStory: 'Our Story',
    ourPillars: 'Our Pillars',
    globalImpact: 'Global Impact',
    storyIntro: 'Since 1998, a global movement against hunger',
    storyOrigin:
      'Rise Against Hunger was founded in 1998 in the United States with a clear mission: to fight world hunger through the distribution of nutritious meals and the development of sustainable programs.',
    inItaly: '🇮🇹 In Italy',
    italyText:
      'The organization arrives in Italy with the goal of involving local communities in the fight against global hunger. Our Bologna headquarters is the operational heart and central hub for all of Europe, coordinating activities across national and European territory.',
    mealDistribution: 'Meal Distribution',
    mealDistributionText:
      'We organize meal packing events involving volunteers of all ages',
    communityInvolvement: 'Community Involvement',
    communityInvolvementText:
      'We unite schools, businesses and organizations in a shared commitment',
    globalImpactText:
      'Packed meals reach vulnerable communities around the world',
    education: 'Education',
    educationText: 'We raise awareness about hunger and promote solidarity',
    finalMessage:
      'Every meal we pack together is a gesture of love that crosses borders and reaches those who need it most.',
    joinUs: 'Join us in this mission! 💙',
  },

  errors: {
    generic: 'An error occurred',
    network: 'Connection error. Check your internet connection.',
    notFound: 'Content not found',
    unauthorized: 'Unauthorized access',
    serverError: 'Server error. Please try again later.',
  },

  updates: {
    logo: 'Rise Against Hunger Italia logo',
    message: 'Updating the app',
    subMessage: 'Thank you for your patience, just a few seconds',
    complete: 'Update complete!',
    progressLabel: 'Update progress',
    progressPercent: '{{progress}}%',
    checking: 'Checking for updates...',
    downloading: 'Downloading update...',
    upToDate: 'App up to date',
    error: 'Error during update',
    improving: 'We are improving your experience',
  },
};
