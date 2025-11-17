/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */

/**
 * AI Translation Script
 * Traduce i18n files usando GPT-4 con comprensione contestuale
 * 
 * USO:
 * npx ts-node scripts/ai-translate.ts --target=en
 * npx ts-node scripts/ai-translate.ts --target=en,es,fr --review
 * 
 * FEATURES:
 * - Comprensione contestuale (GPT-4 capisce "Dona" button vs "dona" verbo)
 * - Mantiene formattazione (line breaks, emoji, variabili)
 * - Traduce in batch (più economico)
 * - Review mode per controllo umano
 */

import * as fs from 'fs';
import * as path from 'path';

// ===================================================================
// CONFIGURATION
// ===================================================================

interface TranslationConfig {
  sourceLocale: string;
  targetLocales: string[];
  apiKey: string;
  model: 'gpt-4' | 'gpt-4-turbo' | 'claude-3-opus';
  reviewMode: boolean;
  contextHints: Record<string, string>;
}

const DEFAULT_CONFIG: Partial<TranslationConfig> = {
  sourceLocale: 'it',
  model: 'gpt-4-turbo',
  reviewMode: true,
  contextHints: {
    'home.ctaImpactButton': 'CTA button text - keep concise, max 2 lines',
    'home.ctaDonateButton': 'CTA button text - keep concise, max 2 lines',
    'home.heroTitle': 'Hero title - emotional, mission-focused',
    'common.appName': 'Brand name - DO NOT TRANSLATE',
  },
};

// ===================================================================
// AI TRANSLATION ENGINE
// ===================================================================

interface TranslationRequest {
  key: string;
  sourceText: string;
  context: string;
  targetLanguage: string;
}

interface TranslationResult {
  key: string;
  originalText: string;
  translatedText: string;
  confidence: number;
  needsReview: boolean;
  suggestions?: string[];
}

class AITranslationEngine {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Traduce un batch di stringhe con contesto
   */
  async translateBatch(
    requests: TranslationRequest[]
  ): Promise<TranslationResult[]> {
    const prompt = this.buildContextualPrompt(requests);

    try {
      const response = await this.callAI(prompt);
      return this.parseAIResponse(response, requests);
    } catch (error) {
      console.error('❌ AI Translation failed:', error);
      throw error;
    }
  }

  /**
   * Crea prompt con contesto per GPT-4
   */
  private buildContextualPrompt(requests: TranslationRequest[]): string {
    const targetLang = requests[0]?.targetLanguage || 'en';
    const languageNames: Record<string, string> = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      pl: 'Polish',
    };

    return `You are a professional translator for a non-profit mobile app "Rise Against Hunger Italia".

CONTEXT: This is a humanitarian organization fighting world hunger. Tone should be:
- Warm and empathetic
- Action-oriented
- Professional but accessible
- Inspiring without being preachy

TARGET LANGUAGE: ${languageNames[targetLang] || targetLang}

RULES:
1. Preserve line breaks (\\n) EXACTLY as they are
2. Keep emoji symbols unchanged
3. Preserve variable placeholders like {{name}}
4. For CTA buttons: keep text CONCISE (max 2-3 words per line)
5. For brand name "Rise Against Hunger Italia": ONLY translate "Italia" → "Italy" etc.
6. Maintain emotional tone and urgency
7. Consider UI space constraints

TRANSLATIONS NEEDED:

${requests
  .map(
    (req, i) => `
${i + 1}. KEY: ${req.key}
   CONTEXT: ${req.context}
   ITALIAN: "${req.sourceText}"
   ${languageNames[targetLang]?.toUpperCase()}: `
  )
  .join('\n')}

Provide ONLY the translations, one per line, numbered 1-${requests.length}.
Do NOT include explanations or additional text.`;
  }

  /**
   * Chiama API GPT-4 / Claude
   */
  private async callAI(prompt: string): Promise<string> {
    // Implementazione OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a professional translator specializing in humanitarian and non-profit communications.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3, // Lower = more consistent
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Parse risposta AI e crea risultati
   */
  private parseAIResponse(
    aiResponse: string,
    requests: TranslationRequest[]
  ): TranslationResult[] {
    const lines = aiResponse.trim().split('\n');
    const results: TranslationResult[] = [];

    requests.forEach((req, index) => {
      // Trova la linea corrispondente (formato: "1. Translated text")
      const translationLine = lines.find(line =>
        line.trim().startsWith(`${index + 1}.`)
      );

      if (!translationLine) {
        results.push({
          key: req.key,
          originalText: req.sourceText,
          translatedText: req.sourceText, // Fallback
          confidence: 0,
          needsReview: true,
        });
        return;
      }

      const translatedText = translationLine
        .replace(/^\d+\.\s*/, '')
        .replace(/^["""]/, '')
        .replace(/["""]$/, '')
        .trim();

      // Calcola confidence (simple heuristic)
      const confidence = this.calculateConfidence(
        req.sourceText,
        translatedText
      );

      results.push({
        key: req.key,
        originalText: req.sourceText,
        translatedText,
        confidence,
        needsReview: confidence < 0.8,
      });
    });

    return results;
  }

  /**
   * Calcola confidence score
   */
  private calculateConfidence(source: string, translation: string): number {
    let score = 1.0;

    // Check: line breaks preservati
    if ((source.match(/\\n/g) || []).length !== (translation.match(/\\n/g) || []).length) {
      score -= 0.3;
    }

    // Check: emoji preservati
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]/gu;
    const sourceEmoji = (source.match(emojiRegex) || []).length;
    const translationEmoji = (translation.match(emojiRegex) || []).length;
    if (sourceEmoji !== translationEmoji) {
      score -= 0.2;
    }

    // Check: lunghezza ragionevole
    const lengthRatio = translation.length / source.length;
    if (lengthRatio < 0.5 || lengthRatio > 2) {
      score -= 0.3;
    }

    return Math.max(0, score);
  }
}

// ===================================================================
// TRANSLATION PIPELINE
// ===================================================================

class TranslationPipeline {
  private config: TranslationConfig;
  private engine: AITranslationEngine;

  constructor(config: TranslationConfig) {
    this.config = config;
    this.engine = new AITranslationEngine(config.apiKey, config.model);
  }

  /**
   * Main execution
   */
  async run(): Promise<void> {
    console.log('🌍 AI Translation Pipeline Started\n');

    // 1. Load source translations
    const sourceFile = path.join(
      __dirname,
      '../src/locales',
      `${this.config.sourceLocale}.ts`
    );
    const sourceTranslations = await this.loadTranslations(sourceFile);

    console.log(`✅ Loaded ${Object.keys(sourceTranslations).length} source keys from ${this.config.sourceLocale}.ts\n`);

    // 2. Translate to each target locale
    for (const targetLocale of this.config.targetLocales) {
      console.log(`📝 Translating to ${targetLocale}...`);

      const results = await this.translateToLocale(
        sourceTranslations,
        targetLocale
      );

      // 3. Save results
      await this.saveTranslations(targetLocale, results);

      // 4. Generate review report
      if (this.config.reviewMode) {
        await this.generateReviewReport(targetLocale, results);
      }

      console.log(`✅ ${targetLocale}.ts generated!\n`);
    }

    console.log('🎉 Translation complete!');
  }

  /**
   * Load translations file
   */
  private async loadTranslations(
    filePath: string
  ): Promise<Record<string, any>> {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract default export object
    const match = content.match(/export default\s+(\{[\s\S]+\});/);
    if (!match) {
      throw new Error('Cannot parse translations file');
    }

    // Safe eval (in real scenario, use proper parser)
    // For production, use @babel/parser or ts-morph
    return eval(`(${match[1]})`);
  }

  /**
   * Flatten nested object to dot notation
   */
  private flattenObject(
    obj: Record<string, any>,
    prefix = ''
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null) {
        Object.assign(result, this.flattenObject(value, fullKey));
      } else if (typeof value === 'string') {
        result[fullKey] = value;
      }
    }

    return result;
  }

  /**
   * Unflatten dot notation to nested object
   */
  private unflattenObject(flat: Record<string, string>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(flat)) {
      const keys = key.split('.');
      let current = result;

      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current)) {
          current[k] = {};
        }
        current = current[k];
      }

      current[keys[keys.length - 1]] = value;
    }

    return result;
  }

  /**
   * Translate all strings to target locale
   */
  private async translateToLocale(
    sourceTranslations: Record<string, any>,
    targetLocale: string
  ): Promise<Record<string, string>> {
    const flat = this.flattenObject(sourceTranslations);
    const requests: TranslationRequest[] = [];

    // Build translation requests with context
    for (const [key, value] of Object.entries(flat)) {
      const context =
        this.config.contextHints[key] ||
        this.inferContext(key) ||
        'General translation';

      requests.push({
        key,
        sourceText: value,
        context,
        targetLanguage: targetLocale,
      });
    }

    // Translate in batches (10 at a time to avoid token limits)
    const BATCH_SIZE = 10;
    const allResults: TranslationResult[] = [];

    for (let i = 0; i < requests.length; i += BATCH_SIZE) {
      const batch = requests.slice(i, i + BATCH_SIZE);
      console.log(
        `   Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(requests.length / BATCH_SIZE)}...`
      );

      const batchResults = await this.engine.translateBatch(batch);
      allResults.push(...batchResults);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Convert results to flat object
    const translated: Record<string, string> = {};
    for (const result of allResults) {
      translated[result.key] = result.translatedText;
    }

    return translated;
  }

  /**
   * Infer context from key name
   */
  private inferContext(key: string): string | null {
    if (key.includes('Button')) return 'Button text - keep concise';
    if (key.includes('Title')) return 'Section title - prominent';
    if (key.includes('Label')) return 'Form label or accessibility';
    if (key.includes('Hint')) return 'Accessibility hint for screen readers';
    if (key.includes('error')) return 'Error message - clear and helpful';
    if (key.startsWith('common.')) return 'Common UI element';
    return null;
  }

  /**
   * Save translations to file
   */
  private async saveTranslations(
    locale: string,
    translations: Record<string, string>
  ): Promise<void> {
    const nested = this.unflattenObject(translations);
    const targetFile = path.join(__dirname, '../src/locales', `${locale}.ts`);

    const content = `/**
 * Traduzioni ${locale.toUpperCase()}
 * Rise Against Hunger Italia
 * 
 * ⚠️ AUTO-GENERATED by AI Translation Script
 * Last updated: ${new Date().toISOString()}
 * Review status: NEEDS_HUMAN_REVIEW
 */

export default ${JSON.stringify(nested, null, 2)};
`;

    fs.writeFileSync(targetFile, content, 'utf-8');
  }

  /**
   * Generate review report for human validation
   */
  private async generateReviewReport(
    locale: string,
    results: TranslationResult[]
  ): Promise<void> {
    const needsReview = results.filter(r => r.needsReview);

    const report = `# Translation Review Report - ${locale.toUpperCase()}
Generated: ${new Date().toISOString()}

## Summary
- Total translations: ${results.length}
- High confidence: ${results.filter(r => r.confidence >= 0.8).length}
- Needs review: ${needsReview.length}

## Items Needing Human Review

${needsReview
  .map(
    (r, i) => `
### ${i + 1}. ${r.key}
**Confidence:** ${(r.confidence * 100).toFixed(1)}%
**Original (IT):** ${r.originalText}
**Translated (${locale.toUpperCase()}):** ${r.translatedText}

**Action needed:** ☐ Approve ☐ Modify ☐ Reject

---
`
  )
  .join('\n')}

## Next Steps
1. Review each translation marked above
2. Make manual corrections if needed in \`src/locales/${locale}.ts\`
3. Update review status header in the file
4. Test in-app to verify UI fit
`;

    const reviewFile = path.join(
      __dirname,
      '../translation-reviews',
      `${locale}-review.md`
    );

    fs.mkdirSync(path.dirname(reviewFile), { recursive: true });
    fs.writeFileSync(reviewFile, report, 'utf-8');

    console.log(`   📄 Review report: translation-reviews/${locale}-review.md`);
  }
}

// ===================================================================
// CLI
// ===================================================================

async function main() {
  const args = process.argv.slice(2);

  const config: TranslationConfig = {
    ...DEFAULT_CONFIG,
    apiKey: process.env.OPENAI_API_KEY || '',
    targetLocales: [],
  } as TranslationConfig;

  // Parse args
  for (const arg of args) {
    if (arg.startsWith('--target=')) {
      config.targetLocales = arg.split('=')[1].split(',');
    } else if (arg === '--no-review') {
      config.reviewMode = false;
    } else if (arg.startsWith('--model=')) {
      config.model = arg.split('=')[1] as any;
    }
  }

  // Validation
  if (!config.apiKey) {
    console.error('❌ Error: OPENAI_API_KEY environment variable not set');
    console.error('\nSet it with:');
    console.error('  export OPENAI_API_KEY=sk-...');
    process.exit(1);
  }

  if (config.targetLocales.length === 0) {
    console.error('❌ Error: No target locales specified');
    console.error('\nUsage:');
    console.error('  npx ts-node scripts/ai-translate.ts --target=en');
    console.error('  npx ts-node scripts/ai-translate.ts --target=en,es,fr');
    process.exit(1);
  }

  // Run pipeline
  const pipeline = new TranslationPipeline(config);
  await pipeline.run();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { TranslationPipeline, AITranslationEngine };
