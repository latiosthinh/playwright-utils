/**
 * Shared types for @nsc/playwright-utils
 */

// ============================================================================
// Generator Types
// ============================================================================

export interface PasswordOptions {
  /** Minimum password length (default: 8) */
  length?: number;
  /** Include uppercase letters (default: true) */
  uppercase?: boolean;
  /** Include lowercase letters (default: true) */
  lowercase?: boolean;
  /** Include numbers (default: true) */
  numbers?: boolean;
  /** Include symbols (default: true) */
  symbols?: boolean;
  /** Characters to exclude from the password */
  excludeChars?: string;
  /** Character types that must be included */
  mustInclude?: ('uppercase' | 'lowercase' | 'number' | 'symbol')[];
}

export interface PasswordStrength {
  score: number; // 0-4
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  feedback: string[];
}

export interface PhoneOptions {
  /** Country code (default: 'US') */
  country?: 'US' | 'UK' | 'CA' | 'AU' | string;
  /** Output format */
  format?: 'digits' | 'dashed' | 'dotted' | 'international' | 'national' | 'parentheses';
}

export interface PhoneComponents {
  countryCode: string;
  areaCode: string;
  exchange: string;
  subscriber: string;
  raw: string;
}

export interface EmailOptions {
  /** Email domain (default: 'test.com') */
  domain?: string;
  /** Email prefix (default: 'user') */
  prefix?: string;
  /** Include timestamp for uniqueness (default: true) */
  includeTimestamp?: boolean;
  /** Timestamp format */
  timestampFormat?: 'iso' | 'epoch' | 'compact';
}

export interface AddressOptions {
  /** Country (default: 'US') */
  country?: 'US' | 'CA' | 'UK';
  /** Include apartment/unit number */
  includeApt?: boolean;
}

export interface Address {
  street: string;
  apt?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CardOptions {
  /** Card type */
  type?: 'visa' | 'mastercard' | 'amex' | 'discover';
  /** Generate valid Luhn checksum (default: true) */
  valid?: boolean;
}

export interface CardInfo {
  number: string;
  expiry: string;
  cvc: string;
  type: string;
}

// ============================================================================
// File Types
// ============================================================================

export interface CSVOptions {
  /** Column delimiter (default: ',') */
  delimiter?: string;
  /** First row contains headers (default: true) */
  hasHeaders?: boolean;
  /** File encoding (default: 'utf-8') */
  encoding?: BufferEncoding;
  /** Skip empty lines (default: true) */
  skipEmptyLines?: boolean;
}

export interface CSVValidationOptions extends CSVOptions {
  /** Expected number of data rows */
  expectedRowCount?: number;
  /** Expected column names */
  expectedColumns?: string[];
  /** Required fields that must have values */
  requiredFields?: string[];
  /** Minimum row count */
  minRowCount?: number;
  /** Maximum row count */
  maxRowCount?: number;
}

export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  rowCount: number;
  columns: string[];
}

export interface DownloadOptions {
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Minimum file size in bytes (default: 1) */
  minSize?: number;
  /** Poll interval in milliseconds (default: 100) */
  pollInterval?: number;
}

// ============================================================================
// Playwright Types (re-exported for convenience when @playwright/test is available)
// ============================================================================

export interface ClickOptions {
  /** Timeout in milliseconds */
  timeout?: number;
  /** Force click even if element is not visible */
  force?: boolean;
  /** Click position relative to element */
  position?: { x: number; y: number };
  /** Delay between mousedown and mouseup */
  delay?: number;
}

export interface FillOptions {
  /** Timeout in milliseconds */
  timeout?: number;
  /** Force fill even if element is not visible */
  force?: boolean;
}

export interface ScrollOptions {
  /** Scroll behavior */
  behavior?: 'auto' | 'smooth';
  /** Vertical alignment */
  block?: 'start' | 'center' | 'end' | 'nearest';
  /** Horizontal alignment */
  inline?: 'start' | 'center' | 'end' | 'nearest';
}

export interface WaitOptions {
  /** Timeout in milliseconds */
  timeout?: number;
  /** Poll interval in milliseconds */
  interval?: number;
  /** Error message on timeout */
  message?: string;
}

export interface RequestOptions {
  /** HTTP headers */
  headers?: Record<string, string>;
  /** Request timeout */
  timeout?: number;
}

export interface CookieOptions {
  /** Cookie domain */
  domain?: string;
  /** Cookie path */
  path?: string;
  /** Cookie expiration date */
  expires?: number;
  /** HTTP only flag */
  httpOnly?: boolean;
  /** Secure flag */
  secure?: boolean;
  /** SameSite attribute */
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export interface MockResponse {
  /** Response status code */
  status?: number;
  /** Response headers */
  headers?: Record<string, string>;
  /** Response body */
  body?: string | object;
  /** Content type */
  contentType?: string;
}

