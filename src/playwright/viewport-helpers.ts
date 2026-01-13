/**
 * Playwright Viewport Helpers
 * Utilities for responsive testing and viewport management
 */

import type { Page } from '@playwright/test';

/**
 * Common device viewports
 */
export const VIEWPORTS = {
  // Mobile devices
  'iPhone SE': { width: 375, height: 667 },
  'iPhone 12': { width: 390, height: 844 },
  'iPhone 12 Pro Max': { width: 428, height: 926 },
  'iPhone 14': { width: 390, height: 844 },
  'iPhone 14 Pro Max': { width: 430, height: 932 },
  'Pixel 5': { width: 393, height: 851 },
  'Pixel 7': { width: 412, height: 915 },
  'Galaxy S21': { width: 360, height: 800 },
  'Galaxy S23': { width: 360, height: 780 },

  // Tablets
  'iPad Mini': { width: 768, height: 1024 },
  'iPad': { width: 810, height: 1080 },
  'iPad Air': { width: 820, height: 1180 },
  'iPad Pro 11': { width: 834, height: 1194 },
  'iPad Pro 12.9': { width: 1024, height: 1366 },
  'Galaxy Tab S7': { width: 800, height: 1280 },

  // Desktop
  'Desktop HD': { width: 1280, height: 720 },
  'Desktop FHD': { width: 1920, height: 1080 },
  'Desktop 2K': { width: 2560, height: 1440 },
  'Desktop 4K': { width: 3840, height: 2160 },
  'MacBook Air': { width: 1440, height: 900 },
  'MacBook Pro 14': { width: 1512, height: 982 },
  'MacBook Pro 16': { width: 1728, height: 1117 },
} as const;

export type ViewportName = keyof typeof VIEWPORTS;

/**
 * Breakpoint definitions
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
} as const;

export type BreakpointName = keyof typeof BREAKPOINTS;

/**
 * ViewportHelpers - Utilities for viewport management
 */
export class ViewportHelpers {
  constructor(protected readonly page: Page) {}

  /**
   * Set viewport to named device
   */
  async setDevice(device: ViewportName): Promise<void> {
    const viewport = VIEWPORTS[device];
    await this.page.setViewportSize(viewport);
  }

  /**
   * Set viewport to custom size
   */
  async setViewport(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
  }

  /**
   * Set viewport to breakpoint (with standard height)
   */
  async setBreakpoint(breakpoint: BreakpointName, height: number = 800): Promise<void> {
    const width = BREAKPOINTS[breakpoint];
    await this.page.setViewportSize({ width: width || 1200, height });
  }

  /**
   * Get current viewport size
   */
  getViewportSize(): { width: number; height: number } | null {
    return this.page.viewportSize();
  }

  /**
   * Get current breakpoint name
   */
  getCurrentBreakpoint(): BreakpointName {
    const viewport = this.page.viewportSize();
    if (!viewport) return 'lg';

    const width = viewport.width;

    if (width < BREAKPOINTS.sm) return 'xs';
    if (width < BREAKPOINTS.md) return 'sm';
    if (width < BREAKPOINTS.lg) return 'md';
    if (width < BREAKPOINTS.xl) return 'lg';
    if (width < BREAKPOINTS.xxl) return 'xl';
    return 'xxl';
  }

  /**
   * Check if viewport is mobile size
   */
  isMobile(): boolean {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width < BREAKPOINTS.md : false;
  }

  /**
   * Check if viewport is tablet size
   */
  isTablet(): boolean {
    const viewport = this.page.viewportSize();
    if (!viewport) return false;
    return viewport.width >= BREAKPOINTS.md && viewport.width < BREAKPOINTS.lg;
  }

  /**
   * Check if viewport is desktop size
   */
  isDesktop(): boolean {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width >= BREAKPOINTS.lg : true;
  }

  /**
   * Check if viewport matches breakpoint or larger
   */
  isBreakpointOrLarger(breakpoint: BreakpointName): boolean {
    const viewport = this.page.viewportSize();
    if (!viewport) return true;
    return viewport.width >= BREAKPOINTS[breakpoint];
  }

  /**
   * Check if viewport matches breakpoint or smaller
   */
  isBreakpointOrSmaller(breakpoint: BreakpointName): boolean {
    const viewport = this.page.viewportSize();
    if (!viewport) return false;
    return viewport.width <= BREAKPOINTS[breakpoint];
  }

  /**
   * Run test at multiple viewports
   */
  async testAtViewports(
    viewports: ViewportName[],
    testFn: (viewport: ViewportName) => Promise<void>
  ): Promise<void> {
    for (const viewport of viewports) {
      await this.setDevice(viewport);
      await testFn(viewport);
    }
  }

  /**
   * Run test at all breakpoints
   */
  async testAtBreakpoints(
    testFn: (breakpoint: BreakpointName) => Promise<void>
  ): Promise<void> {
    const breakpoints: BreakpointName[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    for (const breakpoint of breakpoints) {
      await this.setBreakpoint(breakpoint);
      await testFn(breakpoint);
    }
  }

  /**
   * Run test at mobile and desktop
   */
  async testResponsive(
    testFn: (isMobile: boolean) => Promise<void>
  ): Promise<void> {
    // Test mobile
    await this.setDevice('iPhone 14');
    await testFn(true);

    // Test desktop
    await this.setDevice('Desktop FHD');
    await testFn(false);
  }

  /**
   * Get device pixel ratio
   */
  async getDevicePixelRatio(): Promise<number> {
    return this.page.evaluate(() => window.devicePixelRatio);
  }

  /**
   * Get screen dimensions
   */
  async getScreenDimensions(): Promise<{
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
  }> {
    return this.page.evaluate(() => ({
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
    }));
  }

  /**
   * Check if element is visible at current viewport
   */
  async isElementInViewport(selector: string): Promise<boolean> {
    return this.page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return false;

      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
    }, selector);
  }

  /**
   * Get element's position relative to viewport
   */
  async getElementViewportPosition(selector: string): Promise<{
    top: number;
    left: number;
    bottom: number;
    right: number;
    isVisible: boolean;
  } | null> {
    return this.page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return null;

      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
        isVisible:
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth,
      };
    }, selector);
  }
}

/**
 * Create ViewportHelpers instance
 */
export function createViewportHelpers(page: Page): ViewportHelpers {
  return new ViewportHelpers(page);
}

/**
 * Get viewport for device name
 */
export function getViewport(device: ViewportName): { width: number; height: number } {
  return { ...VIEWPORTS[device] };
}

/**
 * Get all mobile viewports
 */
export function getMobileViewports(): ViewportName[] {
  return [
    'iPhone SE',
    'iPhone 12',
    'iPhone 12 Pro Max',
    'iPhone 14',
    'iPhone 14 Pro Max',
    'Pixel 5',
    'Pixel 7',
    'Galaxy S21',
    'Galaxy S23',
  ];
}

/**
 * Get all tablet viewports
 */
export function getTabletViewports(): ViewportName[] {
  return [
    'iPad Mini',
    'iPad',
    'iPad Air',
    'iPad Pro 11',
    'iPad Pro 12.9',
    'Galaxy Tab S7',
  ];
}

/**
 * Get all desktop viewports
 */
export function getDesktopViewports(): ViewportName[] {
  return [
    'Desktop HD',
    'Desktop FHD',
    'Desktop 2K',
    'Desktop 4K',
    'MacBook Air',
    'MacBook Pro 14',
    'MacBook Pro 16',
  ];
}

