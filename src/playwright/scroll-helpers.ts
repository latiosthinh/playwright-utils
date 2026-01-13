/**
 * Playwright Scroll Helpers
 * Utilities for scrolling and lazy loading
 */

import type { Page, Locator } from '@playwright/test';
import type { ScrollOptions } from '../types';

const DEFAULT_SCROLL_DELAY = 100;

/**
 * ScrollHelpers - Utilities for scrolling operations
 */
export class ScrollHelpers {
  constructor(protected readonly page: Page) {}

  // ============================================================================
  // Basic Scrolling
  // ============================================================================

  /**
   * Scroll element into view
   */
  async scrollToElement(locator: Locator, options: ScrollOptions = {}): Promise<void> {
    await locator.scrollIntoViewIfNeeded();

    // Apply additional scroll options if specified
    if (options.block || options.inline) {
      await locator.evaluate(
        (el, opts) => {
          el.scrollIntoView({
            behavior: opts.behavior || 'auto',
            block: opts.block || 'center',
            inline: opts.inline || 'nearest',
          });
        },
        options
      );
    }
  }

  /**
   * Scroll to top of page
   */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }

  /**
   * Scroll to bottom of page
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' });
    });
  }

  /**
   * Scroll by specified amount
   */
  async scrollBy(x: number, y: number): Promise<void> {
    await this.page.evaluate(
      ({ dx, dy }) => {
        window.scrollBy(dx, dy);
      },
      { dx: x, dy: y }
    );
  }

  /**
   * Scroll to specific position
   */
  async scrollTo(x: number, y: number): Promise<void> {
    await this.page.evaluate(
      ({ sx, sy }) => {
        window.scrollTo(sx, sy);
      },
      { sx: x, sy: y }
    );
  }

  /**
   * Scroll by percentage of viewport
   */
  async scrollByViewport(percentX: number = 0, percentY: number = 100): Promise<void> {
    await this.page.evaluate(
      ({ px, py }) => {
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        window.scrollBy((vw * px) / 100, (vh * py) / 100);
      },
      { px: percentX, py: percentY }
    );
  }

  // ============================================================================
  // Smart Scrolling
  // ============================================================================

  /**
   * Scroll into view with smart positioning
   * Handles elements that might be behind fixed headers/footers
   */
  async scrollIntoViewSmart(
    locator: Locator,
    options: { headerOffset?: number; footerOffset?: number } = {}
  ): Promise<void> {
    const { headerOffset = 0, footerOffset = 0 } = options;

    await locator.evaluate(
      (el, opts) => {
        const rect = el.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Calculate if element is in view considering offsets
        const effectiveTop = rect.top - opts.headerOffset;
        const effectiveBottom = rect.bottom + opts.footerOffset;

        if (effectiveTop < 0) {
          // Element is above viewport
          window.scrollBy(0, effectiveTop - 20);
        } else if (effectiveBottom > viewportHeight) {
          // Element is below viewport
          window.scrollBy(0, effectiveBottom - viewportHeight + 20);
        }
      },
      { headerOffset, footerOffset }
    );
  }

  /**
   * Scroll within a scrollable container
   */
  async scrollWithinContainer(container: Locator, target: Locator): Promise<void> {
    await container.evaluate(
      (containerEl, targetSelector) => {
        const targetEl = containerEl.querySelector(targetSelector);
        if (targetEl) {
          targetEl.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
      },
      await target.evaluate((el) => {
        // Get a unique selector for the target
        if (el.id) return `#${el.id}`;
        const classes = Array.from(el.classList).join('.');
        return classes ? `.${classes}` : el.tagName.toLowerCase();
      })
    );
  }

  /**
   * Scroll container to top
   */
  async scrollContainerToTop(container: Locator): Promise<void> {
    await container.evaluate((el) => {
      el.scrollTop = 0;
    });
  }

  /**
   * Scroll container to bottom
   */
  async scrollContainerToBottom(container: Locator): Promise<void> {
    await container.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
  }

  // ============================================================================
  // Scroll + Action Combinations
  // ============================================================================

  /**
   * Scroll to element and click
   */
  async clickWithScroll(locator: Locator): Promise<void> {
    await this.scrollToElement(locator);
    await this.sleep(DEFAULT_SCROLL_DELAY);
    await locator.click();
  }

  /**
   * Scroll to element and fill
   */
  async fillWithScroll(locator: Locator, value: string): Promise<void> {
    await this.scrollToElement(locator);
    await this.sleep(DEFAULT_SCROLL_DELAY);
    await locator.fill(value);
  }

  /**
   * Scroll to element and hover
   */
  async hoverWithScroll(locator: Locator): Promise<void> {
    await this.scrollToElement(locator);
    await this.sleep(DEFAULT_SCROLL_DELAY);
    await locator.hover();
  }

  // ============================================================================
  // Lazy Loading Helpers
  // ============================================================================

  /**
   * Scroll to load all lazy-loaded content
   */
  async scrollToLoadAll(options: {
    delay?: number;
    maxScrolls?: number;
    scrollAmount?: number;
  } = {}): Promise<void> {
    const {
      delay = 500,
      maxScrolls = 50,
      scrollAmount = 500,
    } = options;

    let previousHeight = 0;
    let scrollCount = 0;

    while (scrollCount < maxScrolls) {
      const currentHeight = await this.page.evaluate(() => document.body.scrollHeight);

      if (currentHeight === previousHeight) {
        // No new content loaded, we're done
        break;
      }

      previousHeight = currentHeight;
      await this.scrollBy(0, scrollAmount);
      await this.sleep(delay);
      scrollCount++;
    }

    // Scroll back to top
    await this.scrollToTop();
  }

  /**
   * Scroll until element is found
   */
  async scrollUntilFound(
    locator: Locator,
    options: { maxScrolls?: number; scrollAmount?: number; delay?: number } = {}
  ): Promise<boolean> {
    const {
      maxScrolls = 20,
      scrollAmount = 300,
      delay = 200,
    } = options;

    for (let i = 0; i < maxScrolls; i++) {
      if (await locator.isVisible()) {
        return true;
      }
      await this.scrollBy(0, scrollAmount);
      await this.sleep(delay);
    }

    return false;
  }

  /**
   * Scroll and collect items (for infinite scroll pages)
   */
  async scrollAndCollect<T>(
    itemSelector: string,
    extractor: (locator: Locator) => Promise<T>,
    options: {
      maxItems?: number;
      maxScrolls?: number;
      delay?: number;
    } = {}
  ): Promise<T[]> {
    const {
      maxItems = 100,
      maxScrolls = 50,
      delay = 500,
    } = options;

    const items: T[] = [];
    const seenTexts = new Set<string>();
    let scrollCount = 0;

    while (items.length < maxItems && scrollCount < maxScrolls) {
      const locators = this.page.locator(itemSelector);
      const count = await locators.count();

      for (let i = 0; i < count && items.length < maxItems; i++) {
        const item = locators.nth(i);
        const text = await item.textContent();

        if (text && !seenTexts.has(text)) {
          seenTexts.add(text);
          const extracted = await extractor(item);
          items.push(extracted);
        }
      }

      // Scroll down
      await this.scrollBy(0, 500);
      await this.sleep(delay);
      scrollCount++;
    }

    return items;
  }

  // ============================================================================
  // Scroll Position Helpers
  // ============================================================================

  /**
   * Get current scroll position
   */
  async getScrollPosition(): Promise<{ x: number; y: number }> {
    return this.page.evaluate(() => ({
      x: window.scrollX,
      y: window.scrollY,
    }));
  }

  /**
   * Get scroll dimensions
   */
  async getScrollDimensions(): Promise<{
    scrollWidth: number;
    scrollHeight: number;
    clientWidth: number;
    clientHeight: number;
  }> {
    return this.page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
    }));
  }

  /**
   * Check if page is scrollable
   */
  async isScrollable(): Promise<boolean> {
    const dims = await this.getScrollDimensions();
    return dims.scrollHeight > dims.clientHeight || dims.scrollWidth > dims.clientWidth;
  }

  /**
   * Check if at bottom of page
   */
  async isAtBottom(threshold: number = 10): Promise<boolean> {
    return this.page.evaluate((t) => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      return scrollTop + clientHeight >= scrollHeight - t;
    }, threshold);
  }

  /**
   * Check if at top of page
   */
  async isAtTop(threshold: number = 10): Promise<boolean> {
    const pos = await this.getScrollPosition();
    return pos.y <= threshold;
  }

  // ============================================================================
  // Smooth Scrolling
  // ============================================================================

  /**
   * Smooth scroll to element
   */
  async smoothScrollToElement(locator: Locator): Promise<void> {
    await locator.evaluate((el) => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    // Wait for smooth scroll animation
    await this.sleep(500);
  }

  /**
   * Smooth scroll to top
   */
  async smoothScrollToTop(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    await this.sleep(500);
  }

  /**
   * Smooth scroll to bottom
   */
  async smoothScrollToBottom(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
    await this.sleep(500);
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Create ScrollHelpers instance
 */
export function createScrollHelpers(page: Page): ScrollHelpers {
  return new ScrollHelpers(page);
}

