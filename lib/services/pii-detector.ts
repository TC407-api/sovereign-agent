import type { PIIType, PIIMatch, PIIDetectionResult, PIIPattern } from '@/lib/types/pii';

const PATTERNS: PIIPattern[] = [
  { type: 'ssn', regex: /\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/g, priority: 1 },
  { type: 'credit_card', regex: /\b(?:4[0-9]{3}|5[1-5][0-9]{2}|3[47][0-9]{2}|6(?:011|5[0-9]{2}))[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}\b/g, validator: (match) => luhnCheck(match.replace(/[- ]/g, '')), priority: 1 },
  { type: 'phone', regex: /(?:\+1[- ]?)?(?:\([0-9]{3}\)|[0-9]{3})[- .]?[0-9]{3}[- .]?[0-9]{4}\b/g, priority: 2 },
  { type: 'email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, priority: 2 },
];

function luhnCheck(cardNumber: string): boolean {
  let sum = 0, isEven = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);
    if (isEven) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

export class RegexPIIDetector {
  private counters: Map<PIIType, number> = new Map();

  detect(text: string): PIIDetectionResult {
    const start = performance.now();
    this.counters.clear();
    const matches: PIIMatch[] = [];
    for (const pattern of PATTERNS) {
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      let match;
      while ((match = regex.exec(text)) !== null) {
        if (pattern.validator && !pattern.validator(match[0])) continue;
        const count = (this.counters.get(pattern.type) || 0) + 1;
        this.counters.set(pattern.type, count);
        matches.push({ type: pattern.type, value: match[0], start: match.index, end: match.index + match[0].length, confidence: 0.95, placeholder: `[${pattern.type.toUpperCase()}_${count}]` });
      }
    }
    matches.sort((a, b) => a.start - b.start);
    const scrubbedText = this.scrub(text, matches);
    return { originalText: text, matches, scrubbedText, processingTimeMs: performance.now() - start };
  }

  private scrub(text: string, matches: PIIMatch[]): string {
    let result = text, offset = 0;
    for (const match of matches) {
      const before = result.slice(0, match.start + offset);
      const after = result.slice(match.end + offset);
      result = before + match.placeholder + after;
      offset += match.placeholder.length - match.value.length;
    }
    return result;
  }
}
