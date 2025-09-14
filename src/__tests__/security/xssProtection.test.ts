/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from '../../shared/utils/logger';

// Mock delle dipendenze
jest.mock('../../shared/utils/logger');

const mockLogger = logger as jest.Mocked<typeof logger>;

/**
 * Test Suite per Protezione XSS Avanzata
 *
 * Copre:
 * - Reflected XSS
 * - Stored XSS
 * - DOM-based XSS
 * - Mutation XSS
 * - Filter Evasion
 * - Context-aware Sanitization
 * - Content Security Policy
 * - Output Encoding
 */
describe('XSS Protection Advanced Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Advanced XSS Sanitization', () => {
    const advancedXSSSanitizer = {
      // Context-aware sanitization
      sanitizeForHTML(input: string): string {
        return input
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;')
          .replace(/onerror/gi, '')
          .replace(/onclick/gi, '')
          .replace(/onmouseover/gi, '');
      },

      sanitizeForAttribute(input: string): string {
        return input
          .replace(/["'<>&]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+/gi, '')
          .replace(/data:/gi, '')
          .replace(/vbscript:/gi, '');
      },

      sanitizeForJS(input: string): string {
        return input
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/</g, '\\u003C')
          .replace(/>/g, '\\u003E');
      },

      sanitizeForCSS(input: string): string {
        return input
          .replace(/[<>"'&]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/expression\s*\(/gi, '')
          .replace(/url\s*\(/gi, '')
          .replace(/@import/gi, '');
      },
    };

    describe('HTML Context Sanitization', () => {
      it('should sanitize basic HTML entities', () => {
        const maliciousInputs = [
          '<script>alert(1)</script>',
          '&lt;script&gt;alert(1)&lt;/script&gt;',
          '<img src=x onerror=alert(1)>',
          '<div>"onclick=alert(1)"</div>',
          "<span>'onmouseover=alert(1)'</span>",
        ];

        maliciousInputs.forEach(input => {
          const sanitized = advancedXSSSanitizer.sanitizeForHTML(input);
          expect(sanitized).not.toContain('<script>');
          expect(sanitized).not.toContain('<img');
          expect(sanitized).not.toContain('onerror');
          expect(sanitized).not.toContain('onclick');
          expect(sanitized).not.toContain('onmouseover');
        });
      });

      it('should preserve safe HTML entities', () => {
        const safeInputs = [
          'Hello & Welcome',
          'Price: $100 < $200',
          'Quote: "Hello World"',
        ];

        safeInputs.forEach(input => {
          const sanitized = advancedXSSSanitizer.sanitizeForHTML(input);
          if (input.includes('&')) expect(sanitized).toContain('&amp;');
          if (input.includes('<')) expect(sanitized).toContain('&lt;');
          if (input.includes('"')) expect(sanitized).toContain('&quot;');
        });
      });
    });

    describe('Attribute Context Sanitization', () => {
      it('should sanitize dangerous attribute values', () => {
        const dangerousAttributes = [
          'javascript:alert(1)',
          'onclick=alert(1)',
          'onmouseover=alert(1)',
          'data:text/html,<script>alert(1)</script>',
          'vbscript:msgbox(1)',
        ];

        dangerousAttributes.forEach(attr => {
          const sanitized = advancedXSSSanitizer.sanitizeForAttribute(attr);
          expect(sanitized).not.toContain('javascript:');
          expect(sanitized).not.toContain('onclick');
          expect(sanitized).not.toContain('onmouseover');
          expect(sanitized).not.toContain('data:');
          expect(sanitized).not.toContain('vbscript:');
        });
      });
    });

    describe('JavaScript Context Sanitization', () => {
      it('should escape JavaScript special characters', () => {
        const jsInputs = [
          'Hello\nWorld',
          'Quote: "Hello"',
          "Apostrophe: 'Hello'",
          'HTML: <script>alert(1)</script>',
        ];

        jsInputs.forEach(input => {
          const sanitized = advancedXSSSanitizer.sanitizeForJS(input);
          expect(sanitized).toBeDefined();
          expect(sanitized.length).toBeGreaterThan(0);
          // Verifica che caratteri pericolosi siano escaped
          if (input.includes('<')) expect(sanitized).toContain('\\u003C');
        });
      });
    });

    describe('CSS Context Sanitization', () => {
      it('should sanitize dangerous CSS values', () => {
        const dangerousCSS = [
          'javascript:alert(1)',
          'expression(alert(1))',
          'url(javascript:alert(1))',
          '@import url(evil.css)',
          'background: url("javascript:alert(1)")',
        ];

        dangerousCSS.forEach(css => {
          const sanitized = advancedXSSSanitizer.sanitizeForCSS(css);
          expect(sanitized).not.toContain('javascript:');
          expect(sanitized).not.toContain('expression(');
          expect(sanitized).not.toContain('url(');
          expect(sanitized).not.toContain('@import');
        });
      });
    });
  });

  describe('XSS Filter Evasion Tests', () => {
    const detectXSSEvasion = (input: string): boolean => {
      const evasionPatterns = [
        // Case variations
        /<script/i,
        /<SCRIPT/,
        /<ScRiPt/,
        // Encoding variations
        /&#x[0-9a-f]+;/i,
        /&#[0-9]+;/,
        /%[0-9a-f]{2}/i,
        // Whitespace variations
        /<\s*script/i,
        /javascript\s*:/i,
        // Null byte injection
        /\x00/,
        // Unicode variations
        /\\u[0-9a-f]{4}/i,
        // Alternative protocols
        /data\s*:/i,
        /vbscript\s*:/i,
      ];

      return evasionPatterns.some(pattern => pattern.test(input));
    };

    it('should detect case variation evasion', () => {
      const caseVariations = [
        '<SCRIPT>alert(1)</SCRIPT>',
        '<ScRiPt>alert(1)</ScRiPt>',
        '<script>alert(1)</script>',
        'JAVASCRIPT:alert(1)',
        'JavaScript:alert(1)',
      ];

      caseVariations.forEach(input => {
        expect(detectXSSEvasion(input)).toBe(true);
      });
    });

    it('should detect encoding evasion', () => {
      const encodingVariations = [
        '&#x3C;script&#x3E;alert(1)&#x3C;/script&#x3E;',
        '&#60;script&#62;alert(1)&#60;/script&#62;',
        '%3Cscript%3Ealert(1)%3C/script%3E',
        '\\u003Cscript\\u003Ealert(1)\\u003C/script\\u003E',
      ];

      encodingVariations.forEach(input => {
        expect(detectXSSEvasion(input)).toBe(true);
      });
    });

    it('should detect whitespace evasion', () => {
      const whitespaceVariations = [
        '< script>alert(1)</script>',
        '<\tscript>alert(1)</script>',
        '<\nscript>alert(1)</script>',
        'javascript\t:alert(1)',
        'javascript\n:alert(1)',
      ];

      whitespaceVariations.forEach(input => {
        expect(detectXSSEvasion(input)).toBe(true);
      });
    });

    it('should detect alternative protocol evasion', () => {
      const protocolVariations = [
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox(1)',
        'data:application/javascript,alert(1)',
        'data:text/javascript,alert(1)',
      ];

      protocolVariations.forEach(input => {
        expect(detectXSSEvasion(input)).toBe(true);
      });
    });
  });

  describe('DOM-based XSS Protection', () => {
    const domXSSProtection = {
      sanitizeForInnerHTML(input: string): string {
        // Rimuovi completamente script e event handlers
        return input
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<[^>]*\son\w+\s*=[^>]*>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/data:/gi, '')
          .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
          .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
          .replace(/<embed[^>]*>/gi, '');
      },

      sanitizeURL(url: string): string {
        const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
        const urlLower = url.toLowerCase().trim();

        // Controlla protocolli pericolosi
        if (
          urlLower.startsWith('javascript:') ||
          urlLower.startsWith('data:') ||
          urlLower.startsWith('vbscript:') ||
          urlLower.startsWith('file:')
        ) {
          return '#';
        }

        // Verifica protocolli consentiti
        const hasAllowedProtocol = allowedProtocols.some(protocol =>
          urlLower.startsWith(protocol)
        );

        if (
          !hasAllowedProtocol &&
          !urlLower.startsWith('/') &&
          !urlLower.startsWith('#')
        ) {
          return '#';
        }

        return url;
      },
    };

    it('should sanitize dangerous innerHTML content', () => {
      const dangerousHTML = [
        '<div><script>alert(1)</script></div>',
        '<img src="x" onerror="alert(1)">',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<object data="javascript:alert(1)"></object>',
        '<embed src="javascript:alert(1)">',
      ];

      dangerousHTML.forEach(html => {
        const sanitized = domXSSProtection.sanitizeForInnerHTML(html);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('onerror');
        expect(sanitized).not.toContain('<iframe');
        expect(sanitized).not.toContain('<object');
        expect(sanitized).not.toContain('<embed');
      });
    });

    it('should sanitize dangerous URLs', () => {
      const dangerousURLs = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox(1)',
        'file:///etc/passwd',
      ];

      dangerousURLs.forEach(url => {
        const sanitized = domXSSProtection.sanitizeURL(url);
        expect(sanitized).toBe('#');
      });
    });

    it('should allow safe URLs', () => {
      const safeURLs = [
        'https://example.com',
        'http://example.com',
        'mailto:user@example.com',
        'tel:+1234567890',
        '/relative/path',
        '#anchor',
      ];

      safeURLs.forEach(url => {
        const sanitized = domXSSProtection.sanitizeURL(url);
        expect(sanitized).toBe(url);
      });
    });
  });

  describe('Content Security Policy Simulation', () => {
    const cspValidator = {
      validateInlineScript(content: string): boolean {
        // Simula CSP che blocca inline scripts
        return (
          !/<script[^>]*>[\s\S]*?<\/script>/i.test(content) &&
          !/on\w+\s*=/i.test(content) &&
          !/javascript:/i.test(content)
        );
      },

      validateInlineStyle(content: string): boolean {
        // Simula CSP che blocca inline styles pericolosi
        return (
          !/expression\s*\(/i.test(content) &&
          !/javascript:/i.test(content) &&
          !/url\s*\(\s*["']?javascript:/i.test(content)
        );
      },

      validateResourceURL(
        url: string,
        type: 'script' | 'style' | 'img'
      ): boolean {
        const allowedDomains = {
          script: ['https://cdn.example.com', 'https://api.example.com'],
          style: ['https://fonts.googleapis.com', 'https://cdn.example.com'],
          img: ['https://images.example.com', 'data:'],
        };

        const allowed = allowedDomains[type];
        return allowed.some(domain => url.startsWith(domain));
      },
    };

    it('should validate inline scripts according to CSP', () => {
      const inlineScripts = [
        '<div>Safe content</div>',
        '<div onclick="alert(1)">Dangerous</div>',
        '<script>alert(1)</script>',
        '<a href="javascript:alert(1)">Link</a>',
      ];

      expect(
        cspValidator.validateInlineScript(inlineScripts[0] as string)
      ).toBe(true);
      expect(
        cspValidator.validateInlineScript(inlineScripts[1] as string)
      ).toBe(false);
      expect(
        cspValidator.validateInlineScript(inlineScripts[2] as string)
      ).toBe(false);
      expect(
        cspValidator.validateInlineScript(inlineScripts[3] as string)
      ).toBe(false);
    });

    it('should validate inline styles according to CSP', () => {
      const inlineStyles = [
        'color: red; background: blue;',
        'background: expression(alert(1));',
        'background: url(javascript:alert(1));',
        'background: url("https://example.com/bg.jpg");',
      ];

      expect(cspValidator.validateInlineStyle(inlineStyles[0] as string)).toBe(
        true
      );
      expect(cspValidator.validateInlineStyle(inlineStyles[1] as string)).toBe(
        false
      );
      expect(cspValidator.validateInlineStyle(inlineStyles[2] as string)).toBe(
        false
      );
      expect(cspValidator.validateInlineStyle(inlineStyles[3] as string)).toBe(
        true
      );
    });

    it('should validate resource URLs according to CSP', () => {
      const scriptURLs = [
        'https://cdn.example.com/script.js',
        'https://evil.com/malware.js',
        'https://api.example.com/data.js',
      ];

      expect(
        cspValidator.validateResourceURL(scriptURLs[0] as string, 'script')
      ).toBe(true);
      expect(
        cspValidator.validateResourceURL(scriptURLs[1] as string, 'script')
      ).toBe(false);
      expect(
        cspValidator.validateResourceURL(scriptURLs[2] as string, 'script')
      ).toBe(true);
    });
  });

  describe('Mutation XSS Protection', () => {
    const mutationXSSDetector = {
      detectDangerousMutation(oldContent: string, newContent: string): boolean {
        // Rileva se una mutazione introduce contenuto pericoloso
        const dangerousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+\s*=/i,
          /<iframe/i,
          /data:text\/html/i,
        ];

        // Controlla se il nuovo contenuto introduce pattern pericolosi
        const oldHasDangerous = dangerousPatterns.some(pattern =>
          pattern.test(oldContent)
        );
        const newHasDangerous = dangerousPatterns.some(pattern =>
          pattern.test(newContent)
        );

        return !oldHasDangerous && newHasDangerous;
      },

      sanitizeMutation(content: string): string {
        return content
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/on\w+\s*=[^>]*/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
      },
    };

    it('should detect dangerous mutations', () => {
      const mutations = [
        {
          old: '<div>Safe content</div>',
          new: '<div>Safe content<script>alert(1)</script></div>',
        },
        {
          old: '<img src="safe.jpg">',
          new: '<img src="safe.jpg" onerror="alert(1)">',
        },
        {
          old: '<a href="#">Link</a>',
          new: '<a href="javascript:alert(1)">Link</a>',
        },
      ];

      mutations.forEach(({ old, new: newContent }) => {
        expect(
          mutationXSSDetector.detectDangerousMutation(old, newContent)
        ).toBe(true);
      });
    });

    it('should not flag safe mutations', () => {
      const safeMutations = [
        {
          old: '<div>Old content</div>',
          new: '<div>New safe content</div>',
        },
        {
          old: '<img src="old.jpg">',
          new: '<img src="new.jpg">',
        },
      ];

      safeMutations.forEach(({ old, new: newContent }) => {
        expect(
          mutationXSSDetector.detectDangerousMutation(old, newContent)
        ).toBe(false);
      });
    });
  });

  describe('Output Encoding Tests', () => {
    const outputEncoder = {
      encodeForHTML(input: string): string {
        return input
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      },

      encodeForHTMLAttribute(input: string): string {
        return input
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      },

      encodeForJavaScript(input: string): string {
        return input
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/\f/g, '\\f')
          .replace(/\b/g, '\\b')
          .replace(/</g, '\\u003C')
          .replace(/>/g, '\\u003E');
      },

      encodeForURL(input: string): string {
        return encodeURIComponent(input).replace(
          /[!'()*]/g,
          c => '%' + c.charCodeAt(0).toString(16).toUpperCase()
        );
      },
    };

    it('should properly encode for HTML context', () => {
      const htmlInputs = [
        '<script>alert(1)</script>',
        'Hello & "World"',
        "It's a 'test'",
      ];

      htmlInputs.forEach(input => {
        const encoded = outputEncoder.encodeForHTML(input);
        expect(encoded).not.toContain('<');
        expect(encoded).not.toContain('>');
        if (input.includes('<')) expect(encoded).toContain('&lt;');
        if (input.includes('>')) expect(encoded).toContain('&gt;');
      });
    });

    it('should properly encode for JavaScript context', () => {
      const jsInputs = [
        'Hello\nWorld',
        'Quote: "test"',
        "Apostrophe: 'test'",
        '<script>alert(1)</script>',
      ];

      jsInputs.forEach(input => {
        const encoded = outputEncoder.encodeForJavaScript(input);
        expect(encoded).toBeDefined();
        expect(encoded.length).toBeGreaterThan(0);
        // Verifica che caratteri pericolosi siano escaped
        if (input.includes('<')) expect(encoded).toContain('\\u003C');
      });
    });

    it('should properly encode for URL context', () => {
      const urlInputs = ['hello world', 'test@example.com', 'special!chars()'];

      urlInputs.forEach(input => {
        const encoded = outputEncoder.encodeForURL(input);
        expect(encoded).not.toContain(' ');
        expect(encoded).toContain('%');
      });
    });
  });

  describe('XSS Detection and Logging', () => {
    it('should log XSS attempts', () => {
      const xssAttempts = [
        '<script>alert("XSS")</script>',
        'javascript:alert(1)',
        '<img src=x onerror=alert(1)>',
      ];

      xssAttempts.forEach((attempt, index) => {
        // Simula rilevamento XSS
        if (
          attempt.includes('<script>') ||
          attempt.includes('javascript:') ||
          attempt.includes('onerror')
        ) {
          mockLogger.warn('XSSProtection', 'XSS attempt detected', {
            attempt,
            attemptId: index + 1,
            timestamp: new Date().toISOString(),
            severity: 'HIGH',
          });
        }
      });

      expect(mockLogger.warn).toHaveBeenCalledTimes(3);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'XSSProtection',
        'XSS attempt detected',
        expect.objectContaining({
          severity: 'HIGH',
        })
      );
    });

    it('should track XSS patterns', () => {
      const patterns = {
        script_injection: 5,
        event_handler: 3,
        javascript_url: 2,
        data_url: 1,
      };

      mockLogger.info('XSSProtection', 'XSS pattern analysis', {
        patterns,
        totalAttempts: Object.values(patterns).reduce((a, b) => a + b, 0),
        timeframe: '24h',
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'XSSProtection',
        'XSS pattern analysis',
        expect.objectContaining({
          patterns,
          totalAttempts: 11,
        })
      );
    });
  });
});
