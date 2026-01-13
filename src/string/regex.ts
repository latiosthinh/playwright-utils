/**
 * Regex utilities
 */

/**
 * Escape special regex characters in a string
 */
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a flexible regex that matches text with variable whitespace
 */
export function buildFlexibleRegex(text: string, flags: string = 'i'): RegExp {
  const escaped = escapeRegex(text);
  const flexible = escaped.replace(/\s+/g, '\\s+');
  return new RegExp(flexible, flags);
}

/**
 * Create a regex matcher from pattern string
 */
export function createMatcher(pattern: string, flags: string = ''): RegExp {
  return new RegExp(pattern, flags);
}

/**
 * Build regex for matching whole word
 */
export function buildWordBoundaryRegex(word: string, flags: string = 'i'): RegExp {
  return new RegExp(`\\b${escapeRegex(word)}\\b`, flags);
}

/**
 * Build regex for matching start of string
 */
export function buildStartsWithRegex(text: string, flags: string = 'i'): RegExp {
  return new RegExp(`^${escapeRegex(text)}`, flags);
}

/**
 * Build regex for matching end of string
 */
export function buildEndsWithRegex(text: string, flags: string = 'i'): RegExp {
  return new RegExp(`${escapeRegex(text)}$`, flags);
}

/**
 * Build regex for matching any of the given strings
 */
export function buildAlternationRegex(strings: string[], flags: string = 'i'): RegExp {
  const escaped = strings.map(escapeRegex);
  return new RegExp(`(${escaped.join('|')})`, flags);
}

/**
 * Build regex for matching text containing all given words (in any order)
 */
export function buildContainsAllRegex(words: string[], flags: string = 'i'): RegExp {
  const lookaheads = words.map((word) => `(?=.*${escapeRegex(word)})`).join('');
  return new RegExp(`${lookaheads}.*`, flags);
}

/**
 * Test if string matches pattern
 */
export function testPattern(text: string, pattern: string | RegExp): boolean {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  return regex.test(text);
}

/**
 * Extract all matches from string
 */
export function extractMatches(text: string, pattern: string | RegExp): string[] {
  const regex = typeof pattern === 'string' ? new RegExp(pattern, 'g') : new RegExp(pattern.source, 'g');
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[0]);
  }
  return matches;
}

/**
 * Extract first match from string
 */
export function extractFirstMatch(text: string, pattern: string | RegExp): string | null {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  const match = text.match(regex);
  return match ? match[0] : null;
}

/**
 * Extract capture groups from first match
 */
export function extractGroups(text: string, pattern: string | RegExp): string[] | null {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  const match = text.match(regex);
  return match ? match.slice(1) : null;
}

/**
 * Replace using regex with callback
 */
export function replaceWithCallback(
  text: string,
  pattern: string | RegExp,
  callback: (match: string, ...groups: string[]) => string
): string {
  const regex = typeof pattern === 'string' ? new RegExp(pattern, 'g') : new RegExp(pattern.source, 'g');
  return text.replace(regex, callback);
}

/**
 * Common regex patterns
 */
export const PATTERNS = {
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  phone: /^[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/,
  postalCodeUS: /^\d{5}(-\d{4})?$/,
  postalCodeCA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  postalCodeUK: /^[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}$/,
  creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/,
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ipv6: /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  hexColor: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^-?\d*\.?\d+$/,
  integer: /^-?\d+$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

/**
 * Validate string against common patterns
 */
export function validate(text: string, patternName: keyof typeof PATTERNS): boolean {
  return PATTERNS[patternName].test(text);
}

