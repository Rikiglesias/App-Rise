import type { ProblemReport } from './buildProblemReport';
import { RISE_CONTACTS } from '@/shared/constants/urls';

export interface ProblemMailto {
  url: string;
  body: string;
}

/** Riduce soltanto gli errori, dal più vecchio, misurando l'URL già codificato. */
export const buildProblemMailto = (
  report: ProblemReport,
  subject: string
): ProblemMailto => {
  const prefix = `mailto:${RISE_CONTACTS.email}?subject=${encodeURIComponent(subject)}&body=`;
  const errorLines = [...report.errorLines];
  for (;;) {
    const body = [...report.diagnosticLines, ...errorLines]
      .join('\r\n')
      .replace(/\r?\n/g, '\r\n');
    const url = prefix + encodeURIComponent(body);
    if (url.length <= 2000) return { url, body };
    if (errorLines.length === 0) {
      // Il chiamante può condividere report.body senza perdere la diagnosi.
      throw new RangeError('Problem report metadata exceeds the mailto limit');
    }
    errorLines.shift();
  }
};
