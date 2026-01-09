import '@testing-library/jest-dom'

// Mock IntersectionObserver for Framer Motion
global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];

  constructor(callback: IntersectionObserverCallback) {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
} as unknown as typeof IntersectionObserver;

// Mock ResizeObserver for Framer Motion
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof ResizeObserver;

// Ensure Node.js globals are available for convex-test
if (typeof globalThis.glob === 'undefined') {
  try {
    const { glob } = require('glob');
    Object.defineProperty(globalThis, 'glob', {
      value: glob,
      writable: true,
      configurable: true
    });
  } catch (e) {
    // glob not available
  }
}
