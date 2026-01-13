/**
 * Playwright Locator Helpers
 * Utilities for building and working with locators
 */

import type { Page, Locator } from '@playwright/test';

/**
 * Build a locator with common options
 */
export function buildLocator(
  page: Page,
  selector: string,
  options: {
    hasText?: string | RegExp;
    has?: Locator;
  } = {}
): Locator {
  return page.locator(selector, options);
}

/**
 * Combine multiple locators using OR logic
 */
export function combineLocators(locators: Locator[]): Locator {
  if (locators.length === 0) {
    throw new Error('Cannot combine empty locator array');
  }

  let combined = locators[0];
  for (let i = 1; i < locators.length; i++) {
    combined = combined.or(locators[i]);
  }

  return combined;
}

/**
 * Filter locators to only visible ones
 */
export async function filterVisibleLocators(locators: Locator[]): Promise<Locator[]> {
  const visible: Locator[] = [];

  for (const locator of locators) {
    if (await locator.isVisible()) {
      visible.push(locator);
    }
  }

  return visible;
}

/**
 * Escape special characters in CSS selector
 */
export function escapeSelector(text: string): string {
  return text.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
}

/**
 * Build text-based selector
 */
export function buildTextSelector(text: string, exact: boolean = false): string {
  if (exact) {
    return `text="${text}"`;
  }
  return `text=${text}`;
}

/**
 * Build role-based selector
 */
export function buildRoleSelector(role: string, name?: string): string {
  if (name) {
    return `role=${role}[name="${name}"]`;
  }
  return `role=${role}`;
}

/**
 * Build data-testid selector
 */
export function buildTestIdSelector(testId: string): string {
  return `[data-testid="${testId}"]`;
}

/**
 * Build aria-label selector
 */
export function buildAriaLabelSelector(label: string): string {
  return `[aria-label="${label}"]`;
}

/**
 * Build ID selector
 */
export function buildIdSelector(id: string): string {
  return `#${escapeSelector(id)}`;
}

/**
 * Build class selector
 */
export function buildClassSelector(className: string): string {
  return `.${escapeSelector(className)}`;
}

/**
 * Build attribute selector
 */
export function buildAttributeSelector(
  attr: string,
  value?: string,
  operator: '=' | '*=' | '^=' | '$=' | '~=' = '='
): string {
  if (value === undefined) {
    return `[${attr}]`;
  }
  return `[${attr}${operator}"${value}"]`;
}

/**
 * Build nth-child selector
 */
export function buildNthChildSelector(baseSelector: string, n: number): string {
  return `${baseSelector}:nth-child(${n})`;
}

/**
 * Build nth-of-type selector
 */
export function buildNthOfTypeSelector(baseSelector: string, n: number): string {
  return `${baseSelector}:nth-of-type(${n})`;
}

/**
 * Build first/last child selectors
 */
export function buildFirstChildSelector(baseSelector: string): string {
  return `${baseSelector}:first-child`;
}

export function buildLastChildSelector(baseSelector: string): string {
  return `${baseSelector}:last-child`;
}

/**
 * Build visible selector
 */
export function buildVisibleSelector(baseSelector: string): string {
  return `${baseSelector}:visible`;
}

/**
 * Build selector for element containing text
 */
export function buildContainsTextSelector(baseSelector: string, text: string): string {
  return `${baseSelector}:has-text("${text}")`;
}

/**
 * Build selector for element with specific child
 */
export function buildHasChildSelector(parentSelector: string, childSelector: string): string {
  return `${parentSelector}:has(${childSelector})`;
}

/**
 * Locator builder class for fluent API
 */
export class LocatorBuilder {
  private selectors: string[] = [];

  constructor(private page: Page) {}

  /**
   * Add tag selector
   */
  tag(tagName: string): this {
    this.selectors.push(tagName);
    return this;
  }

  /**
   * Add ID selector
   */
  id(id: string): this {
    this.selectors.push(`#${escapeSelector(id)}`);
    return this;
  }

  /**
   * Add class selector
   */
  class(className: string): this {
    this.selectors.push(`.${escapeSelector(className)}`);
    return this;
  }

  /**
   * Add attribute selector
   */
  attr(name: string, value?: string, operator: '=' | '*=' | '^=' | '$=' = '='): this {
    this.selectors.push(buildAttributeSelector(name, value, operator));
    return this;
  }

  /**
   * Add data-testid selector
   */
  testId(testId: string): this {
    this.selectors.push(`[data-testid="${testId}"]`);
    return this;
  }

  /**
   * Add aria-label selector
   */
  ariaLabel(label: string): this {
    this.selectors.push(`[aria-label="${label}"]`);
    return this;
  }

  /**
   * Add text filter
   */
  hasText(text: string): this {
    this.selectors.push(`:has-text("${text}")`);
    return this;
  }

  /**
   * Add nth-child
   */
  nth(n: number): this {
    this.selectors.push(`:nth-child(${n})`);
    return this;
  }

  /**
   * Add first-child
   */
  first(): this {
    this.selectors.push(':first-child');
    return this;
  }

  /**
   * Add last-child
   */
  last(): this {
    this.selectors.push(':last-child');
    return this;
  }

  /**
   * Add visible filter
   */
  visible(): this {
    this.selectors.push(':visible');
    return this;
  }

  /**
   * Add descendant selector
   */
  descendant(selector: string): this {
    this.selectors.push(` ${selector}`);
    return this;
  }

  /**
   * Add child selector
   */
  child(selector: string): this {
    this.selectors.push(` > ${selector}`);
    return this;
  }

  /**
   * Build the final selector string
   */
  toString(): string {
    return this.selectors.join('');
  }

  /**
   * Build and return the locator
   */
  build(): Locator {
    return this.page.locator(this.toString());
  }

  /**
   * Reset the builder
   */
  reset(): this {
    this.selectors = [];
    return this;
  }
}

/**
 * Create a new LocatorBuilder
 */
export function createLocatorBuilder(page: Page): LocatorBuilder {
  return new LocatorBuilder(page);
}

/**
 * Get best selector for an element (for debugging/generation)
 */
export async function suggestSelector(_page: Page, locator: Locator): Promise<string[]> {
  const suggestions: string[] = [];

  try {
    // Try to get various attributes
    const id = await locator.getAttribute('id');
    const testId = await locator.getAttribute('data-testid');
    const ariaLabel = await locator.getAttribute('aria-label');
    const name = await locator.getAttribute('name');
    const className = await locator.getAttribute('class');
    const role = await locator.getAttribute('role');

    // Priority order for selectors
    if (testId) {
      suggestions.push(`[data-testid="${testId}"]`);
    }
    if (id) {
      suggestions.push(`#${id}`);
    }
    if (ariaLabel) {
      suggestions.push(`[aria-label="${ariaLabel}"]`);
    }
    if (role) {
      const roleSelector = ariaLabel
        ? `role=${role}[name="${ariaLabel}"]`
        : `role=${role}`;
      suggestions.push(roleSelector);
    }
    if (name) {
      suggestions.push(`[name="${name}"]`);
    }
    if (className) {
      const classes = className.split(' ').filter((c) => c.length > 0);
      if (classes.length > 0) {
        suggestions.push(`.${classes[0]}`);
      }
    }
  } catch {
    // Element might not be accessible
  }

  return suggestions;
}

