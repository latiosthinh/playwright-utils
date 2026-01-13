/**
 * Random value generators - Generic utilities for generating random values
 */

const CHARSETS = {
  alpha: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  alphaLower: 'abcdefghijklmnopqrstuvwxyz',
  alphaUpper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numeric: '0123456789',
  alphanumeric: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  hex: '0123456789abcdef',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
} as const;

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  if (min > max) {
    throw new Error('min must be less than or equal to max');
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float between min and max
 * @param decimals - Number of decimal places (default: 2)
 */
export function randomFloat(min: number, max: number, decimals: number = 2): number {
  if (min > max) {
    throw new Error('min must be less than or equal to max');
  }
  const value = Math.random() * (max - min) + min;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Generate a random string of specified length
 * @param charset - Characters to use (default: alphanumeric)
 */
export function randomString(length: number, charset?: string): string {
  if (length < 0) {
    throw new Error('length must be non-negative');
  }
  const chars = charset || CHARSETS.alphanumeric;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomInt(0, chars.length - 1));
  }
  return result;
}

/**
 * Generate a random alphabetic string (letters only)
 */
export function randomAlpha(length: number): string {
  return randomString(length, CHARSETS.alpha);
}

/**
 * Generate a random alphanumeric string
 */
export function randomAlphanumeric(length: number): string {
  return randomString(length, CHARSETS.alphanumeric);
}

/**
 * Generate a random hex string
 */
export function randomHex(length: number): string {
  return randomString(length, CHARSETS.hex);
}

/**
 * Generate a random UUID v4
 */
export function randomUUID(): string {
  // Use crypto if available, otherwise fall back to Math.random
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a random boolean
 * @param probability - Probability of true (0-1, default: 0.5)
 */
export function randomBoolean(probability: number = 0.5): boolean {
  if (probability < 0 || probability > 1) {
    throw new Error('probability must be between 0 and 1');
  }
  return Math.random() < probability;
}

/**
 * Get a random element from an array
 */
export function randomElement<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot get random element from empty array');
  }
  return array[randomInt(0, array.length - 1)];
}

/**
 * Get multiple random elements from an array (without replacement)
 */
export function randomElements<T>(array: T[], count: number): T[] {
  if (count < 0) {
    throw new Error('count must be non-negative');
  }
  if (count > array.length) {
    throw new Error('count cannot be greater than array length');
  }
  const shuffled = shuffle([...array]);
  return shuffled.slice(0, count);
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * Returns a new array, does not modify the original
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate a random lowercase string
 */
export function randomLowercase(length: number): string {
  return randomString(length, CHARSETS.alphaLower);
}

/**
 * Generate a random uppercase string
 */
export function randomUppercase(length: number): string {
  return randomString(length, CHARSETS.alphaUpper);
}

/**
 * Generate a random numeric string
 */
export function randomNumeric(length: number): string {
  return randomString(length, CHARSETS.numeric);
}

/**
 * Export charsets for custom use
 */
export { CHARSETS };

