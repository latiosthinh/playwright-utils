/**
 * Playwright Page Helpers
 * Generic page interaction utilities
 */

import type { Page, Locator, BrowserContext } from '@playwright/test';
import type { ClickOptions, FillOptions } from '../types';

/**
 * Viewport breakpoints for responsive testing
 */
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

/**
 * PageHelpers - Generic utilities for Playwright page interactions
 */
export class PageHelpers {
  constructor(
    protected readonly page: Page,
    protected readonly context?: BrowserContext
  ) {}

  // ============================================================================
  // Viewport Detection
  // ============================================================================

  /**
   * Check if current viewport is mobile size
   */
  get isMobile(): boolean {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width < BREAKPOINTS.tablet : false;
  }

  /**
   * Check if current viewport is tablet size
   */
  get isTablet(): boolean {
    const viewport = this.page.viewportSize();
    if (!viewport) return false;
    return viewport.width >= BREAKPOINTS.tablet && viewport.width < BREAKPOINTS.desktop;
  }

  /**
   * Check if current viewport is desktop size
   */
  get isDesktop(): boolean {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width >= BREAKPOINTS.desktop : true;
  }

  /**
   * Get current viewport type
   */
  getViewportType(): 'mobile' | 'tablet' | 'desktop' | 'wide' {
    const viewport = this.page.viewportSize();
    if (!viewport) return 'desktop';

    if (viewport.width < BREAKPOINTS.tablet) return 'mobile';
    if (viewport.width < BREAKPOINTS.desktop) return 'tablet';
    if (viewport.width < BREAKPOINTS.wide) return 'desktop';
    return 'wide';
  }

  /**
   * Get current viewport dimensions
   */
  getViewportSize(): { width: number; height: number } | null {
    return this.page.viewportSize();
  }

  // ============================================================================
  // Safe Element Interactions
  // ============================================================================

  /**
   * Click element safely, returns success status
   */
  async clickSafe(locator: Locator, options: ClickOptions = {}): Promise<boolean> {
    try {
      await locator.click({
        timeout: options.timeout || 5000,
        force: options.force,
        position: options.position,
        delay: options.delay,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fill element safely, returns success status
   */
  async fillSafe(locator: Locator, value: string, options: FillOptions = {}): Promise<boolean> {
    try {
      await locator.fill(value, {
        timeout: options.timeout || 5000,
        force: options.force,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Select option safely, returns success status
   */
  async selectSafe(locator: Locator, value: string): Promise<boolean> {
    try {
      await locator.selectOption(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check checkbox safely
   */
  async checkSafe(locator: Locator): Promise<boolean> {
    try {
      await locator.check();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Uncheck checkbox safely
   */
  async uncheckSafe(locator: Locator): Promise<boolean> {
    try {
      await locator.uncheck();
      return true;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // Element Retrieval
  // ============================================================================

  /**
   * Get visible element or null
   */
  async getVisibleElement(locator: Locator): Promise<Locator | null> {
    try {
      const count = await locator.count();
      for (let i = 0; i < count; i++) {
        const element = locator.nth(i);
        if (await element.isVisible()) {
          return element;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get all visible elements
   */
  async getAllVisibleElements(locator: Locator): Promise<Locator[]> {
    const visibleElements: Locator[] = [];
    const count = await locator.count();

    for (let i = 0; i < count; i++) {
      const element = locator.nth(i);
      if (await element.isVisible()) {
        visibleElements.push(element);
      }
    }

    return visibleElements;
  }

  /**
   * Get element by index
   */
  async getElementByIndex(locator: Locator, index: number): Promise<Locator> {
    return locator.nth(index);
  }

  /**
   * Get first visible element
   */
  async getFirstVisible(locator: Locator): Promise<Locator | null> {
    return this.getVisibleElement(locator);
  }

  /**
   * Count visible elements
   */
  async countVisible(locator: Locator): Promise<number> {
    const visible = await this.getAllVisibleElements(locator);
    return visible.length;
  }

  // ============================================================================
  // Text/Value Extraction
  // ============================================================================

  /**
   * Get text content safely
   */
  async getTextSafe(locator: Locator, fallback: string = ''): Promise<string> {
    try {
      const text = await locator.textContent({ timeout: 5000 });
      return text?.trim() || fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Get input value safely
   */
  async getValueSafe(locator: Locator, fallback: string = ''): Promise<string> {
    try {
      const value = await locator.inputValue({ timeout: 5000 });
      return value || fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Get attribute value safely
   */
  async getAttributeSafe(locator: Locator, attr: string): Promise<string | null> {
    try {
      return await locator.getAttribute(attr, { timeout: 5000 });
    } catch {
      return null;
    }
  }

  /**
   * Get all text contents from multiple elements
   */
  async getAllTexts(locator: Locator): Promise<string[]> {
    const texts = await locator.allTextContents();
    return texts.map((t) => t.trim()).filter((t) => t.length > 0);
  }

  /**
   * Get inner HTML safely
   */
  async getInnerHTMLSafe(locator: Locator, fallback: string = ''): Promise<string> {
    try {
      return await locator.innerHTML({ timeout: 5000 });
    } catch {
      return fallback;
    }
  }

  // ============================================================================
  // Element State Checks
  // ============================================================================

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(locator: Locator): Promise<boolean> {
    try {
      return await locator.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is checked (checkbox/radio)
   */
  async isChecked(locator: Locator): Promise<boolean> {
    try {
      return await locator.isChecked();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is editable
   */
  async isEditable(locator: Locator): Promise<boolean> {
    try {
      return await locator.isEditable();
    } catch {
      return false;
    }
  }

  // ============================================================================
  // Window/Document Helpers
  // ============================================================================

  /**
   * Get window variable value
   */
  async getWindowVariable<T>(name: string): Promise<T> {
    return this.page.evaluate((varName) => {
      return (window as unknown as Record<string, T>)[varName];
    }, name);
  }

  /**
   * Execute script in page context
   */
  async executeScript<T>(script: string | ((...args: unknown[]) => T), ...args: unknown[]): Promise<T> {
    return this.page.evaluate(script as (...args: unknown[]) => T, ...args);
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Get document ready state
   */
  async getReadyState(): Promise<string> {
    return this.page.evaluate(() => document.readyState);
  }

  // ============================================================================
  // Navigation Helpers
  // ============================================================================

  /**
   * Navigate to URL with options
   */
  async navigateTo(
    url: string,
    options: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' } = {}
  ): Promise<void> {
    await this.page.goto(url, { waitUntil: options.waitUntil || 'load' });
  }

  /**
   * Reload page
   */
  async reload(options: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' } = {}): Promise<void> {
    await this.page.reload({ waitUntil: options.waitUntil || 'load' });
  }

  /**
   * Go back in history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /**
   * Go forward in history
   */
  async goForward(): Promise<void> {
    await this.page.goForward();
  }

  // ============================================================================
  // Keyboard Helpers
  // ============================================================================

  /**
   * Press key
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Type text with optional delay
   */
  async typeText(text: string, delay: number = 0): Promise<void> {
    await this.page.keyboard.type(text, { delay });
  }

  /**
   * Press Enter key
   */
  async pressEnter(): Promise<void> {
    await this.pressKey('Enter');
  }

  /**
   * Press Escape key
   */
  async pressEscape(): Promise<void> {
    await this.pressKey('Escape');
  }

  /**
   * Press Tab key
   */
  async pressTab(): Promise<void> {
    await this.pressKey('Tab');
  }

  // ============================================================================
  // Screenshot Helpers
  // ============================================================================

  /**
   * Take screenshot
   */
  async takeScreenshot(path?: string): Promise<Buffer> {
    return this.page.screenshot({ path, fullPage: false });
  }

  /**
   * Take full page screenshot
   */
  async takeFullPageScreenshot(path?: string): Promise<Buffer> {
    return this.page.screenshot({ path, fullPage: true });
  }

  /**
   * Take element screenshot
   */
  async takeElementScreenshot(locator: Locator, path?: string): Promise<Buffer> {
    return locator.screenshot({ path });
  }
}

/**
 * Create PageHelpers instance
 */
export function createPageHelpers(page: Page, context?: BrowserContext): PageHelpers {
  return new PageHelpers(page, context);
}

