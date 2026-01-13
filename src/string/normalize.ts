/**
 * String normalization utilities
 */

/**
 * Normalize a value to a string, handling null/undefined
 */
export function normalize(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

/**
 * Normalize whitespace - collapse multiple spaces, trim
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Remove accents/diacritics from text
 */
export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Convert text to URL-friendly slug
 */
export function toSlug(text: string): string {
  return removeAccents(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

/**
 * Convert to kebab-case
 */
export function toKebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert to camelCase
 */
export function toCamelCase(text: string): string {
  return text
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

/**
 * Convert to PascalCase
 */
export function toPascalCase(text: string): string {
  const camel = toCamelCase(text);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * Convert to snake_case
 */
export function toSnakeCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

/**
 * Convert to CONSTANT_CASE
 */
export function toConstantCase(text: string): string {
  return toSnakeCase(text).toUpperCase();
}

/**
 * Normalize line endings to LF
 */
export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Remove zero-width characters
 */
export function removeZeroWidthChars(text: string): string {
  return text.replace(/[\u200B-\u200D\uFEFF]/g, '');
}

/**
 * Clean string for comparison (lowercase, no accents, normalized whitespace)
 */
export function cleanForComparison(text: string): string {
  return normalizeWhitespace(removeAccents(text.toLowerCase()));
}

/**
 * Check if two strings are equal ignoring case and whitespace
 */
export function equalsIgnoreCaseAndWhitespace(a: string, b: string): boolean {
  return cleanForComparison(a) === cleanForComparison(b);
}

/**
 * Remove all whitespace from string
 */
export function removeWhitespace(text: string): string {
  return text.replace(/\s/g, '');
}

/**
 * Pad string on left
 */
export function padLeft(text: string, length: number, char: string = ' '): string {
  return text.padStart(length, char);
}

/**
 * Pad string on right
 */
export function padRight(text: string, length: number, char: string = ' '): string {
  return text.padEnd(length, char);
}

/**
 * Ensure string starts with prefix
 */
export function ensurePrefix(text: string, prefix: string): string {
  return text.startsWith(prefix) ? text : prefix + text;
}

/**
 * Ensure string ends with suffix
 */
export function ensureSuffix(text: string, suffix: string): string {
  return text.endsWith(suffix) ? text : text + suffix;
}

/**
 * Remove prefix if present
 */
export function removePrefix(text: string, prefix: string): string {
  return text.startsWith(prefix) ? text.slice(prefix.length) : text;
}

/**
 * Remove suffix if present
 */
export function removeSuffix(text: string, suffix: string): string {
  return text.endsWith(suffix) ? text.slice(0, -suffix.length) : text;
}

