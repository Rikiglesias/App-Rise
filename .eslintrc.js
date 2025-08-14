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
    'react-native/no-unused-styles': 'warn', // Importante ma non bloccante
    'react-native/split-platform-components': 'error', // Architettura corretta
    'react-native/no-inline-styles': 'off', // DISABILITATO: Sistema responsive intenzionale con { fontSize: X }
    'react-native/no-color-literals': 'off', // Troppo restrittivo per sviluppo rapido
    'react-native/no-raw-text': 'off', // Normale in React Native

    // =================== TYPESCRIPT PRATICO ===================
    '@typescript-eslint/no-explicit-any': 'warn', // Permesso ma scoraggiato
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off', // Inference è OK
    '@typescript-eslint/no-non-null-assertion': 'warn', // Attenzione ma non bloccante
    '@typescript-eslint/no-var-requires': 'off', // Comune in React Native per assets e configurazioni

    // Sicurezza TypeScript - Livello pratico
    '@typescript-eslint/no-unsafe-assignment': 'off', // Troppo rigido per React Native development
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',

    // Regole utili ma non troppo severe
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/no-unnecessary-condition': 'off', // Troppo aggressivo con React Native, spesso falsi positivi
    '@typescript-eslint/strict-boolean-expressions': 'off', // Troppo pedante
    '@typescript-eslint/no-floating-promises': 'off', // Gestito caso per caso, troppo restrittivo per event handlers
    '@typescript-eslint/require-await': 'off', // Troppo restrittivo per async event handlers

    // =================== REACT HOOKS ===================
    'react-hooks/rules-of-hooks': 'error', // Critico
    'react-hooks/exhaustive-deps': 'warn', // Importante ma può essere flessibile

    // =================== REACT COMPONENTI ===================
    'react/prop-types': 'off', // Usiamo TypeScript
    'react/react-in-jsx-scope': 'off', // React 17+
    'react/display-name': 'warn',
    'react/jsx-key': 'error', // Performance critica
    'react/jsx-no-bind': 'off', // Troppo restrittivo per React Native, gestito da useMemo/useCallback quando necessario
    'react/no-array-index-key': 'warn', // Buona pratica
    'react/no-unstable-nested-components': 'warn',

    // =================== QUALITÀ CODICE ESSENZIALE ===================
    'no-console': 'warn', // Permesso in sviluppo
    'no-debugger': 'error', // Mai in produzione
    'prefer-const': 'error',
    'no-var': 'error',

    // =================== COMPARAZIONI E LOGICA ===================
    eqeqeq: ['warn', 'always'], // Incoraggia === ma non blocca
    'no-eq-null': 'off', // Troppo pedante
    'no-void': 'off', // Normale in async/await patterns

    // =================== STILE RAGIONEVOLE ===================
    'consistent-return': 'off', // Troppo restrittivo
    'no-empty-function': 'warn',
    'no-nested-ternary': 'warn', // Leggibilità
    'no-negated-condition': 'off', // A volte è più chiaro
    'max-nested-callbacks': ['warn', 4], // Pratico
    'max-statements-per-line': 'off', // Troppo restrittivo

    // =================== IMPORT/EXPORT ===================
    'import/no-unresolved': 'warn', // Warning per asset paths
    'import/order': 'off', // Troppo rigido, gestito da Prettier
    'import/no-duplicates': 'error',
    'import/no-named-as-default': 'off', // Normale in React Native per componenti
    'unused-imports/no-unused-imports': 'error', // Pulizia automatica

    // =================== ENFORCE SISTEMA PERFETTO (BAN LEGACY) ===================
    'no-restricted-imports': [
      'off',
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
      'off',
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
    // TODO: Implementare plugin ESLint custom per no-offgrid-spacing
    // File pronto: eslint-rules/no-offgrid-spacing.js

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
      'error',
      {
        max: 500, // Default generale - overrides specifici per tipo
        skipBlankLines: true,
        skipComments: true,
      },
    ],
  },

  // =================== CONFIGURAZIONI SPECIFICHE ===================
  overrides: [
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
        'src/features/**/*Screen*.jsx'
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
      files: ['src/hooks/**/*.ts', 'src/hooks/**/*.tsx', '**/use*.ts', '**/use*.tsx'],
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
      files: ['src/utils/**/*.ts', 'src/shared/utils/**/*.ts', 'src/services/**/*.ts'],
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
      files: ['src/constants/**/*.ts', 'src/shared/constants/**/*.ts', '**/designTokens.ts'],
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
      files: ['**/*Styles.ts', '**/*Styled.ts', '**/*Style.ts', '**/styles/**/*.ts'],
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
        'app.config.js'
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
          'warn', // TEMPORANEO: warning per non bloccare build durante refactoring
          {
            max: 1200, // Soglia alta temporanea
            skipBlankLines: true,
            skipComments: true,
          },
        ],
        // TODO: Rimuovere questo override dopo completamento refactoring
        // PRIORITÀ: ImpactTabScreen (282 righe eccesso), ActionButtons (416 righe eccesso)
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
      files: [
        '.eslintrc.js',
        'jest.config.js',
        '*.config.js',
      ],
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
