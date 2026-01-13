/**
 * Playwright Network Helpers
 * Utilities for network operations, cookies, and request interception
 */

import type { Page, Route, BrowserContext, APIRequestContext } from '@playwright/test';
import type { RequestOptions, CookieOptions, MockResponse } from '../types';

/**
 * NetworkHelpers - Utilities for network operations
 */
export class NetworkHelpers {
  constructor(
    protected readonly page: Page,
    protected readonly context?: BrowserContext
  ) {}

  // ============================================================================
  // API Calls (using page context - shares cookies)
  // ============================================================================

  /**
   * Make GET request and return JSON
   */
  async fetchJson<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const response = await this.page.evaluate(
      async ({ url, opts }) => {
        const res = await fetch(url, {
          method: 'GET',
          headers: opts.headers || {},
          credentials: 'include',
        });
        return res.json();
      },
      { url: endpoint, opts: options }
    );
    return response as T;
  }

  /**
   * Make POST request with JSON body
   */
  async postJson<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<T> {
    const response = await this.page.evaluate(
      async ({ url, body, opts }) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...opts.headers,
          },
          body: JSON.stringify(body),
          credentials: 'include',
        });
        return res.json();
      },
      { url: endpoint, body: data, opts: options }
    );
    return response as T;
  }

  /**
   * Make PUT request with JSON body
   */
  async putJson<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<T> {
    const response = await this.page.evaluate(
      async ({ url, body, opts }) => {
        const res = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...opts.headers,
          },
          body: JSON.stringify(body),
          credentials: 'include',
        });
        return res.json();
      },
      { url: endpoint, body: data, opts: options }
    );
    return response as T;
  }

  /**
   * Make DELETE request
   */
  async deleteRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const response = await this.page.evaluate(
      async ({ url, opts }) => {
        const res = await fetch(url, {
          method: 'DELETE',
          headers: opts.headers || {},
          credentials: 'include',
        });
        return res.json();
      },
      { url: endpoint, opts: options }
    );
    return response as T;
  }

  // ============================================================================
  // Cookie Management
  // ============================================================================

  /**
   * Get cookie header string for current page
   */
  async getCookieHeader(): Promise<string> {
    if (!this.context) {
      return this.page.evaluate(() => document.cookie);
    }

    const cookies = await this.context.cookies();
    return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
  }

  /**
   * Get specific cookie value
   */
  async getCookie(name: string): Promise<string | null> {
    if (this.context) {
      const cookies = await this.context.cookies();
      const cookie = cookies.find((c) => c.name === name);
      return cookie?.value ?? null;
    }

    return this.page.evaluate((cookieName) => {
      const match = document.cookie.match(new RegExp(`(?:^|; )${cookieName}=([^;]*)`));
      return match ? decodeURIComponent(match[1]) : null;
    }, name);
  }

  /**
   * Get all cookies
   */
  async getAllCookies(): Promise<Array<{ name: string; value: string; domain?: string }>> {
    if (this.context) {
      return this.context.cookies();
    }

    return this.page.evaluate(() => {
      return document.cookie.split('; ').map((c) => {
        const [name, value] = c.split('=');
        return { name, value: decodeURIComponent(value) };
      });
    });
  }

  /**
   * Set cookie
   */
  async setCookie(name: string, value: string, options: CookieOptions = {}): Promise<void> {
    if (this.context) {
      const url = this.page.url();
      const domain = options.domain || new URL(url).hostname;

      await this.context.addCookies([
        {
          name,
          value,
          domain,
          path: options.path || '/',
          expires: options.expires,
          httpOnly: options.httpOnly,
          secure: options.secure,
          sameSite: options.sameSite,
        },
      ]);
    } else {
      await this.page.evaluate(
        ({ n, v, opts }) => {
          let cookie = `${n}=${encodeURIComponent(v)}`;
          if (opts.path) cookie += `; path=${opts.path}`;
          if (opts.expires) cookie += `; expires=${new Date(opts.expires * 1000).toUTCString()}`;
          if (opts.secure) cookie += '; secure';
          if (opts.sameSite) cookie += `; samesite=${opts.sameSite}`;
          document.cookie = cookie;
        },
        { n: name, v: value, opts: options }
      );
    }
  }

  /**
   * Delete cookie
   */
  async deleteCookie(name: string): Promise<void> {
    if (this.context) {
      const cookies = await this.context.cookies();
      const cookie = cookies.find((c) => c.name === name);
      if (cookie) {
        await this.context.clearCookies({ name });
      }
    } else {
      await this.page.evaluate((cookieName) => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }, name);
    }
  }

  /**
   * Clear all cookies
   */
  async clearAllCookies(): Promise<void> {
    if (this.context) {
      await this.context.clearCookies();
    } else {
      await this.page.evaluate(() => {
        document.cookie.split('; ').forEach((c) => {
          const name = c.split('=')[0];
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        });
      });
    }
  }

  // ============================================================================
  // Request Interception
  // ============================================================================

  /**
   * Intercept requests matching pattern
   */
  async interceptRequest(
    pattern: string | RegExp,
    handler: (route: Route) => Promise<void> | void
  ): Promise<void> {
    await this.page.route(pattern, handler);
  }

  /**
   * Mock response for matching requests
   */
  async mockResponse(pattern: string | RegExp, response: MockResponse): Promise<void> {
    await this.page.route(pattern, async (route) => {
      await route.fulfill({
        status: response.status || 200,
        headers: response.headers,
        body: typeof response.body === 'object' ? JSON.stringify(response.body) : response.body,
        contentType: response.contentType || 'application/json',
      });
    });
  }

  /**
   * Block requests matching pattern
   */
  async blockRequests(pattern: string | RegExp): Promise<void> {
    await this.page.route(pattern, (route) => route.abort());
  }

  /**
   * Block specific resource types
   */
  async blockResourceTypes(types: Array<'image' | 'stylesheet' | 'font' | 'media' | 'script'>): Promise<void> {
    await this.page.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      if (types.includes(resourceType as typeof types[number])) {
        route.abort();
      } else {
        route.continue();
      }
    });
  }

  /**
   * Remove all route handlers
   */
  async clearRoutes(): Promise<void> {
    await this.page.unrouteAll();
  }

  // ============================================================================
  // Response Monitoring
  // ============================================================================

  /**
   * Wait for and capture response
   */
  async captureResponse<T>(
    pattern: string | RegExp,
    action: () => Promise<void>
  ): Promise<T> {
    const responsePromise = this.page.waitForResponse(pattern);
    await action();
    const response = await responsePromise;
    return response.json() as Promise<T>;
  }

  /**
   * Collect all responses matching pattern during action
   */
  async collectResponses<T>(
    pattern: string | RegExp,
    action: () => Promise<void>
  ): Promise<T[]> {
    const responses: T[] = [];

    const handler = async (response: Awaited<ReturnType<Page['waitForResponse']>>) => {
      if (typeof pattern === 'string') {
        if (response.url().includes(pattern)) {
          responses.push(await response.json());
        }
      } else if (pattern.test(response.url())) {
        responses.push(await response.json());
      }
    };

    this.page.on('response', handler);
    await action();
    this.page.off('response', handler);

    return responses;
  }

  // ============================================================================
  // Local Storage / Session Storage
  // ============================================================================

  /**
   * Get localStorage item
   */
  async getLocalStorageItem(key: string): Promise<string | null> {
    return this.page.evaluate((k) => localStorage.getItem(k), key);
  }

  /**
   * Set localStorage item
   */
  async setLocalStorageItem(key: string, value: string): Promise<void> {
    await this.page.evaluate(({ k, v }) => localStorage.setItem(k, v), { k: key, v: value });
  }

  /**
   * Remove localStorage item
   */
  async removeLocalStorageItem(key: string): Promise<void> {
    await this.page.evaluate((k) => localStorage.removeItem(k), key);
  }

  /**
   * Clear all localStorage
   */
  async clearLocalStorage(): Promise<void> {
    await this.page.evaluate(() => localStorage.clear());
  }

  /**
   * Get sessionStorage item
   */
  async getSessionStorageItem(key: string): Promise<string | null> {
    return this.page.evaluate((k) => sessionStorage.getItem(k), key);
  }

  /**
   * Set sessionStorage item
   */
  async setSessionStorageItem(key: string, value: string): Promise<void> {
    await this.page.evaluate(({ k, v }) => sessionStorage.setItem(k, v), { k: key, v: value });
  }

  /**
   * Clear all sessionStorage
   */
  async clearSessionStorage(): Promise<void> {
    await this.page.evaluate(() => sessionStorage.clear());
  }

  // ============================================================================
  // Network Conditions
  // ============================================================================

  /**
   * Simulate slow network
   */
  async simulateSlowNetwork(latencyMs: number = 2000): Promise<void> {
    await this.page.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, latencyMs));
      await route.continue();
    });
  }

  /**
   * Simulate offline mode
   */
  async goOffline(): Promise<void> {
    if (this.context) {
      await this.context.setOffline(true);
    }
  }

  /**
   * Restore online mode
   */
  async goOnline(): Promise<void> {
    if (this.context) {
      await this.context.setOffline(false);
    }
  }
}

/**
 * Create NetworkHelpers instance
 */
export function createNetworkHelpers(page: Page, context?: BrowserContext): NetworkHelpers {
  return new NetworkHelpers(page, context);
}

// ============================================================================
// Standalone API Helpers (using APIRequestContext)
// ============================================================================

/**
 * API client wrapper for Playwright's request context
 */
export class ApiClient {
  constructor(private request: APIRequestContext) {}

  async get<T>(url: string, options?: { headers?: Record<string, string> }): Promise<T> {
    const response = await this.request.get(url, options);
    return response.json();
  }

  async post<T>(url: string, data?: unknown, options?: { headers?: Record<string, string> }): Promise<T> {
    const response = await this.request.post(url, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return response.json();
  }

  async put<T>(url: string, data?: unknown, options?: { headers?: Record<string, string> }): Promise<T> {
    const response = await this.request.put(url, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return response.json();
  }

  async delete<T>(url: string, options?: { headers?: Record<string, string> }): Promise<T> {
    const response = await this.request.delete(url, options);
    return response.json();
  }

  async patch<T>(url: string, data?: unknown, options?: { headers?: Record<string, string> }): Promise<T> {
    const response = await this.request.patch(url, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return response.json();
  }
}

/**
 * Create ApiClient instance
 */
export function createApiClient(request: APIRequestContext): ApiClient {
  return new ApiClient(request);
}

