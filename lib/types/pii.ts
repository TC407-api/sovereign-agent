export type PIIType = 'ssn' | 'credit_card' | 'phone' | 'email' | 'name' | 'address' | 'date_of_birth' | 'ip_address';

export interface PIIPattern {
  type: PIIType;
  regex: RegExp;
  validator?: (match: string) => boolean;
  priority: number;
}

export interface PIIMatch {
  type: PIIType;
  value: string;
  start: number;
  end: number;
  confidence: number;
  placeholder: string;
}

export interface PIIDetectionResult {
  originalText: string;
  matches: PIIMatch[];
  scrubbedText: string;
  processingTimeMs: number;
}

export interface PIIScrubConfig {
  enabledTypes: PIIType[];
  placeholderFormat: string;
  preserveFormat: boolean;
  minConfidence: number;
}

export interface ScrubMapping {
  placeholder: string;
  originalValue: string;
  type: PIIType;
}
