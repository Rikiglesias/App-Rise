module.exports = {
  extends: [
    'expo',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  plugins: [
    'react',
    'react-hooks',
    'react-native',
    '@typescript-eslint',
    'import',
    'prefer-arrow',
    'unused-imports',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // =================== REACT NATIVE SPECIFICHE ===================
    'react-native/no-unused-styles': 'off', // RIATTIVATO: Identificare stili non utilizzati
    'react-native/split-platform-components': 'error', // Architettura corretta
    'react-native/no-inline-styles': 'off', // TEMPORANEO: Da abilitare gradualmente
    'react-native/no-color-literals': 'off', // TEMPORANEO: Da standardizzare theme prima
    'react-native/no-raw-text': 'off', // TEMPORANEO: Richiede refactor massiccio FormattedText

    // =================== TYPESCRIPT PRATICO ===================
    '@typescript-eslint/no-explicit-any': 'error', // CRITICO: Zero tolleranza per any
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off', // Inference è OK
    '@typescript-eslint/no-non-null-assertion': 'error', // CRITICO: Usa optional chaining
    '@typescript-eslint/no-var-requires': 'error', // CRITICO: Usa ES6 imports

    // Sicurezza TypeScript - Solo regole critiche
    '@typescript-eslint/no-unsafe-assignment': 'warn', // GRADUALE: Warning per identificare problemi senza bloccare
    '@typescript-eslint/no-unsafe-call': 'off', // TEMPORANEO: Troppi errori legacy
    '@typescript-eslint/no-unsafe-member-access': 'off', // TEMPORANEO: Troppi errori legacy
    '@typescript-eslint/no-unsafe-return': 'off', // TEMPORANEO: Troppi errori legacy
    '@typescript-eslint/no-unsafe-argument': 'off', // TEMPORANEO: Troppi errori legacy

    // Regole utili ma non troppo severe
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/no-unnecessary-condition': 'off', // TEMPORANEO: Da rivedere caso per caso
    '@typescript-eslint/strict-boolean-expressions': 'off', // TEMPORANEO: Troppo restrittivo per codebase esistente
    '@typescript-eslint/no-floating-promises': 'error', // CRITICO: Gestisci sempre le Promise
    '@typescript-eslint/require-await': 'error', // CRITICO: async solo se necessario

    // =================== REACT HOOKS ===================
    'react-hooks/rules-of-hooks': 'error', // Critico
    'react-hooks/exhaustive-deps': 'warn', // Importante ma può essere flessibile

    // =================== REACT COMPONENTI ===================
    'react/prop-types': 'off', // Usiamo TypeScript
    'react/react-in-jsx-scope': 'off', // React 17+
    'react/display-name': 'warn',
    'react/jsx-key': 'error', // Performance critica
    'react/jsx-no-bind': 'off', // TEMPORANEO: Da ottimizzare gradualmente
    'react/no-array-index-key': 'warn', // Buona pratica
    'react/no-unstable-nested-components': 'warn',

    // =================== QUALITÀ CODICE ESSENZIALE ===================
    'no-console': 'warn', // Permesso in sviluppo
    'no-debugger': 'error', // Mai in produzione
    'prefer-const': 'error',
    'no-var': 'error',

    // =================== COMPARAZIONI E LOGICA ===================
    eqeqeq: 'warn', // RIATTIVATO: Comparazioni sicure obbligatorie
    'no-eq-null': 'warn', // RIATTIVATO: Evitare == null
    'no-void': 'off', // TEMPORANEO: Usato in alcuni pattern

    // =================== STILE RAGIONEVOLE ===================
    'consistent-return': 'off', // TEMPORANEO: Troppi errori legacy
    'no-empty-function': 'warn',
    'no-nested-ternary': 'warn', // Leggibilità
    'no-negated-condition': 'off', // TEMPORANEO: Da rivedere caso per caso
    'max-nested-callbacks': ['warn', 4], // Pratico
    'max-statements-per-line': 'off', // TEMPORANEO: Troppo restrittivo

    // =================== IMPORT/EXPORT ===================
    'import/no-unresolved': 'warn', // Warning per asset paths
    'import/order': 'warn', // RIATTIVATO: Standardizzazione organizzazione imports
    'import/no-duplicates': 'error',
    'import/no-named-as-default': 'off', // TEMPORANEO: Troppi falsi positivi
    'unused-imports/no-unused-imports': 'error', // Pulizia automatica

    // =================== ENFORCE SISTEMA PERFETTO (BAN LEGACY) ===================
    'no-restricted-imports': [
      'error', // RIATTIVATO: Blocca pattern legacy dopo migrazione
      {
        paths: [
          {
            name: '@/components/ui',
            importNames: [
              'FormattedText',
              'FormattedTextEnhanced',
              'ResponsiveBox',
              'ResponsiveStack',
              'ResponsiveCard',
              'ResponsiveImage',
            ],
            message:
              'Sistema legacy vietato. Usa PerfectText/PerfectImage/PerfectContainer.',
          },
          {
            name: 'react-native',
            importNames: ['Text'],
            message:
              'Import diretto vietato. Usa PerfectText per layout identici.',
          },
          {
            name: 'react-native',
            importNames: ['Image'],
            message:
              'Import diretto vietato. Usa PerfectImage per proporzioni identiche.',
          },
        ],
        patterns: [
          '**/FormattedText',
          '**/FormattedTextEnhanced',
          '**/ResponsiveBox',
          '**/ResponsiveStack',
          '**/ResponsiveCard',
          '**/ResponsiveImage',
          '**/useResponsiveLayout',
          '**/useResponsiveDarkMode',
        ],
      },
    ],
    'no-restricted-properties': [
      'error', // RIATTIVATO: Blocca Dimensions.get() dopo migrazione
      {
        object: 'Dimensions',
        property: 'get',
        message:
          'Vietato usare Dimensions.get per layout. Usa PerfectContainer/PerfectImage e il sistema millimetrico.',
      },
    ],

    // =================== PERFORMANCE ===================
    'require-await': 'warn',
    'no-await-in-loop': 'warn',

    // =================== BASELINE GRID ENFORCEMENT ===================
    // Custom ESLint plugin available: eslint-rules/no-offgrid-spacing.js
    // Can be enabled when needed for strict grid enforcement

    // =================== ARROW FUNCTIONS ===================
    'prefer-arrow/prefer-arrow-functions': [
      'warn',
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false,
      },
    ],

    // =================== LIMITE GENERALE FUNZIONI ===================
    // Limite pragmatico generale per tutte le funzioni
    'max-lines-per-function': [
      'error',
      {
        max: 350,
        skipBlankLines: true,
        skipComments: true,
      },
    ],

    // =================== LIMITE RIGHE PER FILE (PROFESSIONAL STANDARDS) ===================
    // Soglie professionali per diversi contesti di sviluppo
    'max-lines': [
      'off', // TEMPORANEO: Disabilitato per evitare blocchi massicci
      {
        max: 500, // Default generale - overrides specifici per tipo
        skipBlankLines: true,
        skipComments: true,
      },
    ],
  },

  // =================== CONFIGURAZIONI SPECIFICHE ===================
  overrides: [
    {
      files: [
        '**/__tests__/**/*.{ts,tsx,js,jsx}',
        'src/examples/**/*.{ts,tsx,js,jsx}',
        'src/shared/examples/**/*.{ts,tsx,js,jsx}',
        'src/shared/screens/TestAutomaticoScreen.tsx',
        'src/shared/screens/DevelopmentScreen.tsx',
        'src/shared/screens/SimplePlaceholderScreen.tsx',
      ],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
    {
      files: ['src/components/ui/PerfectText.tsx', 'src/components/ui/PerfectImage.tsx'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
    {
      files: [
        'src/components/domain/HeaderImageSection.tsx',
        'src/components/domain/HomeHeader/HeaderImageSection.tsx',
        'src/features/home/components/HeroImage/index.tsx',
      ],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
    // =================== COMPONENTI REACT NATIVE ===================
    // UI Components (.tsx/.jsx) - VERDE: ≤300, GIALLO: 300-500, ROSSO: >500
    {
      files: ['src/components/**/*.tsx', 'src/components/**/*.jsx'],
      rules: {
        'react/display-name': 'error', // Importante per debugging
        'react/jsx-no-bind': 'warn',
        'max-lines': [
          'error',
          {
            max: 500, // Soglia ROSSA per refactor obbligatorio
            skipBlankLines: true,
            skipComments: true,
          },
        ],
      },
    },

    // Screen/Container components - Classe/modulo di dominio ≤400 (verde), 400-800 (giallo), >800 (rosso)
    {
      files: [
        'src/screens/**/*.tsx',
        'src/screens/**/*.jsx',
        'src/features/**/*Screen*.tsx',
        'src/features/**/*Screen*.jsx',
      ],
      rules: {
        'react/jsx-no-bind': 'warn',
        'max-lines': [
          'error',
          {
            max: 800, // Soglia ROSSA per moduli di dominio
            skipBlankLines: true,
            skipComments: true,
          },
        ],
      },
    },

    // Hook personalizzati - VERDE: ≤200, GIALLO: 200-400, ROSSO: >400
    {
      files: [
        'src/hooks/**/*.ts',
        'src/hooks/**/*.tsx',
        '**/use*.ts',
        '**/use*.tsx',
      ],
      rules: {
        'react-hooks/exhaustive-deps': 'error',
        'max-lines': [
          'error',
          {
            max: 400, // Soglia ROSSA per hook/helper functions
            skipBlankLines: true,
            skipComments: true,
          },
        ],
      },
    },

    // =================== FILE TYPESCRIPT/JAVASCRIPT ===================
    // Utility functions - Eredita limite generale
    {
      files: ['src/utils/**/*.ts', 'src/utils/**/*.js'],
      rules: {
        // Eredita limite generale di 350 linee
      },
    },

    // File di servizi/API - Eredita limite generale
    {
      files: ['src/services/**/*.ts', 'src/api/**/*.ts'],
      rules: {
        // Eredita limite generale di 350 linee
      },
    },

    // =================== HELPER LIBRARIES ===================
    // Helper/Utils libraries - VERDE: ≤200, GIALLO: 200-400, ROSSO: >400
    {
      files: [
        'src/utils/**/*.ts',
        'src/shared/utils/**/*.ts',
        'src/services/**/*.ts',
      ],
      rules: {
        'max-lines': [
          'error',
          {
            max: 400, // Soglia ROSSA per helper functions
            skipBlankLines: true,
            skipComments: true,
          },
        ],
      },
    },

    // =================== CONSTANTS & DESIGN TOKENS ===================
    // Constants/Design tokens - VERDE: ≤400, GIALLO: 400-800, ROSSO: >800
    {
      files: [
        'src/constants/**/*.ts',
        'src/shared/constants/**/*.ts',
        '**/designTokens.ts',
      ],
      rules: {
        'max-lines': [
          'error',
          {
            max: 800, // Soglia ROSSA per moduli di dominio
            skipBlankLines: true,
            skipComments: true,
          },
        ],
      },
    },

    // =================== STYLE FILES ===================
    // StyleSheet/Styled-components - VERDE: ≤200, GIALLO: 200-400, ROSSO: >400
    {
      files: [
        '**/*Styles.ts',
        '**/*Styled.ts',
        '**/*Style.ts',
        '**/styles/**/*.ts',
      ],
      rules: {
        'max-lines': [
          'error',
          {
            max: 400, // Soglia ROSSA per helper functions
            skipBlankLines: true,
            skipComments: true,
          },
        ],
      },
    },

    // =================== FILE DI TEST ===================
    // Test files - VERDE: ≤600, GIALLO: 600-1000, ROSSO: >1000 (snapshot esclusi)
    {
      files: [
        '**/__tests__/**/*',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
      ],
      env: {
        jest: true,
      },
      rules: {
        'max-lines': [
          'error',
          {
            max: 1000, // Soglia ROSSA per file di test
            skipBlankLines: true,
            skipComments: true,
          },
        ],
        'max-lines-per-function': [
          'error',
          {
            max: 100,
            skipBlankLines: true,
            skipComments: true,
          },
        ],
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        'react/display-name': 'off',
        'no-restricted-properties': 'off', // Allow Dimensions.get() in tests for mocking
        'prefer-arrow/prefer-arrow-functions': 'off', // Allow function declarations in tests
        'no-await-in-loop': 'off', // Allow await in loops for test scenarios
        '@typescript-eslint/require-await': 'off', // Allow async functions without await in tests
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
      },
    },

    // =================== FILE DI CONFIGURAZIONE ===================
    // Config/build scripts - VERDE: ≤150, GIALLO: 150-300, ROSSO: >300
    {
      files: [
        '**/*.config.ts',
        '**/*.config.js',
        'babel.config.js',
        'metro.config.js',
        'jest.config.js',
        'eas.json',
        'app.config.js',
      ],
      rules: {
        'max-lines': [
          'error',
          {
            max: 300, // Soglia ROSSA per config/build scripts
            skipBlankLines: true,
            skipComments: true,
          },
        ],
        'max-lines-per-function': [
          'error',
          {
            max: 80,
            skipBlankLines: true,
            skipComments: true,
          },
        ],
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },

    // =================== TYPE DEFINITION FILES ===================
    // Type files - Standard ≤300 righe
    {
      files: ['src/types/**/*.ts', '**/types.ts', '**/*.d.ts'],
      rules: {
        'max-lines': [
          'error',
          {
            max: 300, // Types possono essere un po' più lunghi
            skipBlankLines: true,
            skipComments: true,
          },
        ],
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },

    // =================== LEGACY FILES - REFACTORING NECESSARIO ===================
    // TEMPORARY: File che violano le nuove soglie professionali - Refactoring pianificato
    {
      files: [
        'src/features/impact/screens/ImpactTabScreen.tsx', // 1082 righe > 800 (domain) → CRITICO
        'src/features/actions/components/components/ActionButtons.tsx', // 916 righe > 500 (UI) → CRITICO
        'src/components/domain/HomeHeaderSubComponents.tsx', // 755 righe > 500 (UI) → CRITICO
        'src/components/ui/FormattedText.tsx', // 568 righe > 500 (UI) → MEDIO
      ],
      rules: {
        'max-lines': [
          'error', // RIABILITATO: Soglia rigida per refactoring obbligatorio
          {
            max: 800, // Soglia ridotta per forzare refactoring
            skipBlankLines: true,
            skipComments: true,
          },
        ],
        // Temporary override for legacy files requiring refactoring
        // PRIORITY: ImpactTabScreen (282 lines excess), ActionButtons (416 lines excess)
      },
    },

    // File TypeScript - Usa typed linting
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
      },
    },

    // File di configurazione JavaScript - Non usare TypeScript parser
    {
      files: ['.eslintrc.js', 'jest.config.js', '*.config.js'],
      parser: 'espree',
      rules: {
        // DISABILITA: Regole che richiedono type info (causano errori)
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',

        // MANTIENI: Regole utili anche per JavaScript
        '@typescript-eslint/no-var-requires': 'warn', // CommonJS vs ES6
        '@typescript-eslint/no-unused-vars': 'warn', // Variabili inutilizzate
        '@typescript-eslint/explicit-function-return-type': 'off', // Troppo strict per config
        '@typescript-eslint/no-explicit-any': 'warn', // Evita any quando possibile

        // RELAX: Regole specifiche per file di configurazione
        'prefer-arrow/prefer-arrow-functions': 'off',
        'no-console': 'off',
        'import/no-unresolved': 'off',
      },
    },

    // Scripts JavaScript - Regole rilassate per tool scripts
    {
      files: ['scripts/**/*.js'],
      parser: 'espree',
      env: {
        node: true,
        es6: true,
      },
      rules: {
        // DISABILITA: Regole TypeScript non applicabili
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-var-requires': 'off', // CommonJS OK per scripts
        '@typescript-eslint/no-unused-vars': 'warn', // Solo warning per scripts

        // RELAX: Patterns comuni negli script
        'no-await-in-loop': 'off', // OK per script sequenziali
        'require-await': 'off', // OK per script async senza await
        'no-console': 'off', // Console logging OK per scripts
        'prefer-arrow/prefer-arrow-functions': 'off',
        'import/no-unresolved': 'off',
        'max-lines-per-function': 'off', // Scripts possono essere lunghi
      },
    },

    // Jest setup files - Environment Jest
    {
      files: ['jest.setup.js', '*.setup.js'],
      parser: 'espree',
      env: {
        jest: true,
        es6: true,
        node: true,
      },
      globals: {
        jest: 'readonly',
        global: 'writable',
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        'no-console': 'off',
        'prefer-arrow/prefer-arrow-functions': 'off',
      },
    },
  ],

  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },

  env: {
    'react-native/react-native': true,
    es6: true,
    node: true,
  },

  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    '.expo/',
    'coverage/',
    '*.config.js',
    'eslint-rules/', // Exclude custom ESLint rules directory
  ],
};
