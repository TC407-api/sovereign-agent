import { RegexPIIDetector } from './pii-detector';
import type { ScrubMapping, PIIDetectionResult } from '@/lib/types/pii';

interface ScrubResult {
  scrubbedText: string;
  mappings: ScrubMapping[];
  sessionId: string;
  detectionResult: PIIDetectionResult;
}

interface ScrubSession {
  mappings: ScrubMapping[];
  createdAt: number;
}

interface PIIScrubberConfig {
  sessionTTL?: number;
}

export class PIIScrubber {
  private detector = new RegexPIIDetector();
  private sessions = new Map<string, ScrubSession>();
  private sessionTTL: number;

  constructor(config: PIIScrubberConfig = {}) {
    this.sessionTTL = config.sessionTTL ?? 3600000;
  }

  scrub(text: string): ScrubResult {
    const detectionResult = this.detector.detect(text);
    const sessionId = crypto.randomUUID();
    const mappings: ScrubMapping[] = detectionResult.matches.map(match => ({
      placeholder: match.placeholder,
      originalValue: match.value,
      type: match.type,
    }));
    this.sessions.set(sessionId, { mappings, createdAt: Date.now() });
    this.cleanupExpiredSessions();
    return { scrubbedText: detectionResult.scrubbedText, mappings, sessionId, detectionResult };
  }

  rehydrate(text: string, sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found or expired`);
    if (Date.now() - session.createdAt > this.sessionTTL) {
      this.sessions.delete(sessionId);
      throw new Error(`Session ${sessionId} expired`);
    }
    let result = text;
    for (const mapping of session.mappings) {
      result = result.replaceAll(mapping.placeholder, mapping.originalValue);
    }
    return result;
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.createdAt > this.sessionTTL) this.sessions.delete(id);
    }
  }
}
