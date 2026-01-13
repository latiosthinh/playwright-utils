/**
 * Playwright Wait Helpers
 * Utilities for waiting on various conditions
 */

import type { Page, Locator, Response, Request } from '@playwright/test';
import type { WaitOptions } from '../types';

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_INTERVAL = 100;

/**
 * WaitHelpers - Utilities for waiting on conditions
 */
export class WaitHelpers {
  constructor(protected readonly page: Page) {}

  // ============================================================================
  // Element State Waits
  // ============================================================================

  /**
   * Wait for element to be visible
   */
  async waitForVisible(locator: Locator, timeout: number = DEFAULT_TIMEOUT): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(locator: Locator, timeout: number = DEFAULT_TIMEOUT): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Wait for element to be attached to DOM
   */
  async waitForAttached(locator: Locator, timeout: number = DEFAULT_TIMEOUT): Promise<void> {
    await locator.waitFor({ state: 'attached', timeout });
  }

  /**
   * Wait for element to be detached from DOM
   */
  async waitForDetached(locator: Locator, timeout: number = DEFAULT_TIMEOUT): Promise<void> {
    await locator.waitFor({ state: 'detached', timeout });
  }

  /**
   * Wait for element to be enabled
   */
  async waitForEnabled(locator: Locator, timeout: number = DEFAULT_TIMEOUT): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (await locator.isEnabled()) {
        return;
      }
      await this.sleep(DEFAULT_INTERVAL);
    }
    throw new Error(`Element not enabled after ${timeout}ms`);
  }

  /**
   * Wait for element to be disabled
   */
  async waitForDisabled(locator: Locator, timeout: number = DEFAULT_TIMEOUT): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (!(await locator.isEnabled())) {
        return;
      }
      await this.sleep(DEFAULT_INTERVAL);
    }
    throw new Error(`Element not disabled after ${timeout}ms`);
  }

  // ============================================================================
  // Page State Waits
  // ============================================================================

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle(timeout: number = DEFAULT_TIMEOUT): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Wait for page load state
   */
  async waitForLoadState(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'load',
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<void> {
    await this.page.waitForLoadState(state, { timeout });
  }

  /**
   * Wait for URL to match
   */
  async waitForURL(
    url: string | RegExp | ((url: URL) => boolean),
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<void> {
    await this.page.waitForURL(url, { timeout });
  }

  /**
   * Wait for URL to contain string
   */
  async waitForURLContains(substring: string, timeout: number = DEFAULT_TIMEOUT): Promise<void> {
    await this.page.waitForURL((url) => url.href.includes(substring), { timeout });
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(timeout: number = DEFAULT_TIMEOUT): Promise<void> {
    await this.page.waitForNavigation({ timeout });
  }

  // ============================================================================
  // Custom Condition Waits
  // ============================================================================

  /**
   * Wait for custom condition to be true
   */
  async waitForCondition(
    condition: () => Promise<boolean> | boolean,
    options: WaitOptions = {}
  ): Promise<void> {
    const {
      timeout = DEFAULT_TIMEOUT,
      interval = DEFAULT_INTERVAL,
      message = 'Condition not met',
    } = options;

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const result = await condition();
        if (result) {
          return;
        }
      } catch {
        // Condition threw, continue waiting
      }
      await this.sleep(interval);
    }

    throw new Error(`${message} after ${timeout}ms`);
  }

  /**
   * Wait for element text to match
   */
  async waitForText(
    locator: Locator,
    text: string | RegExp,
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<void> {
    await this.waitForCondition(
      async () => {
        const content = await locator.textContent();
        if (typeof text === 'string') {
          return content?.includes(text) ?? false;
        }
        return text.test(content ?? '');
      },
      { timeout, message: `Text "${text}" not found` }
    );
  }

  /**
   * Wait for element text to change from initial value
   */
  async waitForTextChange(
    locator: Locator,
    initialText: string,
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<void> {
    await this.waitForCondition(
      async () => {
        const content = await locator.textContent();
        return content !== initialText;
      },
      { timeout, message: 'Text did not change' }
    );
  }

  /**
   * Wait for element count to match
   */
  async waitForCount(
    locator: Locator,
    expectedCount: number,
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<void> {
    await this.waitForCondition(
      async () => {
        const count = await locator.count();
        return count === expectedCount;
      },
      { timeout, message: `Expected ${expectedCount} elements` }
    );
  }

  /**
   * Wait for element count to be at least
   */
  async waitForMinCount(
    locator: Locator,
    minCount: number,
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<void> {
    await this.waitForCondition(
      async () => {
        const count = await locator.count();
        return count >= minCount;
      },
      { timeout, message: `Expected at least ${minCount} elements` }
    );
  }

  /**
   * Wait for attribute value
   */
  async waitForAttribute(
    locator: Locator,
    attribute: string,
    value: string | RegExp,
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<void> {
    await this.waitForCondition(
      async () => {
        const attrValue = await locator.getAttribute(attribute);
        if (attrValue === null) return false;
        if (typeof value === 'string') {
          return attrValue === value;
        }
        return value.test(attrValue);
      },
      { timeout, message: `Attribute "${attribute}" did not match "${value}"` }
    );
  }

  /**
   * Wait for CSS class to be present
   */
  async waitForClass(
    locator: Locator,
    className: string,
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<void> {
    await this.waitForCondition(
      async () => {
        const classes = await locator.getAttribute('class');
        return classes?.split(' ').includes(className) ?? false;
      },
      { timeout, message: `Class "${className}" not found` }
    );
  }

  /**
   * Wait for CSS class to be removed
   */
  async waitForClassRemoved(
    locator: Locator,
    className: string,
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<void> {
    await this.waitForCondition(
      async () => {
        const classes = await locator.getAttribute('class');
        return !(classes?.split(' ').includes(className) ?? false);
      },
      { timeout, message: `Class "${className}" still present` }
    );
  }

  // ============================================================================
  // Loading Indicator Waits
  // ============================================================================

  /**
   * Wait for loading indicator to disappear
   */
  async waitForLoadingGone(selector: string, timeout: number = DEFAULT_TIMEOUT): Promise<void> {
    const locator = this.page.locator(selector);
    try {
      // First check if it's visible
      const isVisible = await locator.isVisible();
      if (isVisible) {
        await this.waitForHidden(locator, timeout);
      }
    } catch {
      // Element might not exist, which is fine
    }
  }

  /**
   * Wait for multiple loading indicators to disappear
   */
  async waitForSpinnersGone(selectors: string[], timeout: number = DEFAULT_TIMEOUT): Promise<void> {
    await Promise.all(selectors.map((selector) => this.waitForLoadingGone(selector, timeout)));
  }

  /**
   * Wait for common loading indicators
   */
  async waitForAllLoadingGone(timeout: number = DEFAULT_TIMEOUT): Promise<void> {
    const commonSelectors = [
      '.loading',
      '.spinner',
      '.loader',
      '[class*="loading"]',
      '[class*="spinner"]',
      '[data-loading="true"]',
      '.skeleton',
    ];
    await this.waitForSpinnersGone(commonSelectors, timeout);
  }

  // ============================================================================
  // Network Waits
  // ============================================================================

  /**
   * Wait for specific API response
   */
  async waitForResponse(
    urlPattern: string | RegExp | ((response: Response) => boolean | Promise<boolean>),
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<void> {
    await this.page.waitForResponse(urlPattern, { timeout });
  }

  /**
   * Wait for request to be made
   */
  async waitForRequest(
    urlPattern: string | RegExp | ((request: Request) => boolean | Promise<boolean>),
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<void> {
    await this.page.waitForRequest(urlPattern, { timeout });
  }

  // ============================================================================
  // Time-Based Waits
  // ============================================================================

  /**
   * Wait for specified duration (use sparingly!)
   */
  async wait(ms: number): Promise<void> {
    await this.sleep(ms);
  }

  /**
   * Wait with exponential backoff
   */
  async waitWithBackoff(
    condition: () => Promise<boolean>,
    options: {
      maxAttempts?: number;
      initialDelay?: number;
      maxDelay?: number;
      factor?: number;
    } = {}
  ): Promise<boolean> {
    const {
      maxAttempts = 5,
      initialDelay = 100,
      maxDelay = 5000,
      factor = 2,
    } = options;

    let delay = initialDelay;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        if (await condition()) {
          return true;
        }
      } catch {
        // Continue trying
      }

      await this.sleep(delay);
      delay = Math.min(delay * factor, maxDelay);
    }

    return false;
  }

  // ============================================================================
  // Frame Waits
  // ============================================================================

  /**
   * Wait for iframe to load
   */
  async waitForFrame(
    frameSelector: string,
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<void> {
    const frame = this.page.frameLocator(frameSelector);
    await frame.locator('body').waitFor({ state: 'attached', timeout });
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Create WaitHelpers instance
 */
export function createWaitHelpers(page: Page): WaitHelpers {
  return new WaitHelpers(page);
}

// ============================================================================
// Standalone Wait Functions
// ============================================================================

/**
 * Poll until condition is true
 */
export async function poll<T>(
  fn: () => Promise<T> | T,
  options: {
    timeout?: number;
    interval?: number;
    validate?: (result: T) => boolean;
  } = {}
): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    interval = DEFAULT_INTERVAL,
    validate = (r) => Boolean(r),
  } = options;

  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const result = await fn();
      if (validate(result)) {
        return result;
      }
    } catch {
      // Continue polling
    }
    await sleep(interval);
  }

  throw new Error(`Polling timeout after ${timeout}ms`);
}

/**
 * Retry function with attempts
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    attempts?: number;
    delay?: number;
    onError?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const { attempts = 3, delay = 1000, onError } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      onError?.(lastError, attempt);

      if (attempt < attempts) {
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

