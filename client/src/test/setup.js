/* global global */
// Adds jest-dom's matchers (toBeInTheDocument, etc.) to Vitest's `expect`.
// Runs once before the test files, via vite.config.js's `test.setupFiles`.
import '@testing-library/jest-dom/vitest';

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Without this, each test's rendered component stays in the DOM for the
// next test in the same file - causing "found multiple elements" errors.
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver for headless JSDOM environments.
// Framer Motion's whileInView and viewport observers require IntersectionObserver,
// which is natively present in all browsers but absent in Node.js/JSDOM.
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  class MockIntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe(element) {
      // Immediately trigger intersection so elements render and animate in test runner
      if (this.callback) {
        this.callback([{ isIntersecting: true, target: element }], this);
      }
    }
    unobserve() {}
    disconnect() {}
  }

  window.IntersectionObserver = MockIntersectionObserver;
  global.IntersectionObserver = MockIntersectionObserver;
}
