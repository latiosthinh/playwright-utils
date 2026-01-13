/**
 * String formatting utilities
 */

/**
 * Extract numeric value from string (removes currency symbols, commas, etc.)
 */
export function cleanNumeric(input: string): number {
  // Remove currency symbols and thousands separators
  const cleaned = input.replace(/[^0-9.-]/g, '');
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

/**
 * Format number as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format number with decimal places
 */
export function formatNumber(
  num: number,
  decimals: number = 2,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format number with thousands separator
 */
export function formatWithCommas(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Truncate string with ellipsis
 */
export function truncate(text: string, length: number, suffix: string = '...'): string {
  if (text.length <= length) {
    return text;
  }
  return text.slice(0, length - suffix.length) + suffix;
}

/**
 * Truncate string at word boundary
 */
export function truncateWords(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.slice(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + suffix;
  }

  return truncated + suffix;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
}

/**
 * Convert to sentence case
 */
export function sentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Format phone number for display
 */
export function formatPhoneDisplay(phone: string, format: 'US' | 'international' = 'US'): string {
  const digits = phone.replace(/\D/g, '');

  if (format === 'US' && digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (format === 'international' && digits.length >= 10) {
    const country = digits.slice(0, digits.length - 10);
    const area = digits.slice(-10, -7);
    const exchange = digits.slice(-7, -4);
    const subscriber = digits.slice(-4);
    return `+${country} (${area}) ${exchange}-${subscriber}`;
  }

  return phone;
}

/**
 * Format credit card number for display (with masking)
 */
export function formatCardDisplay(cardNumber: string, showLast: number = 4): string {
  const digits = cardNumber.replace(/\D/g, '');
  const masked = '*'.repeat(digits.length - showLast) + digits.slice(-showLast);

  // Format in groups of 4
  return masked.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Pluralize a word based on count
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  const pluralForm = plural || `${singular}s`;
  return count === 1 ? singular : pluralForm;
}

/**
 * Format count with word (e.g., "5 items")
 */
export function formatCount(count: number, singular: string, plural?: string): string {
  return `${count} ${pluralize(count, singular, plural)}`;
}

/**
 * Format ordinal number (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(num: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const remainder = num % 100;

  if (remainder >= 11 && remainder <= 13) {
    return `${num}th`;
  }

  return `${num}${suffixes[num % 10] || suffixes[0]}`;
}

/**
 * Template string interpolation
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return key in values ? String(values[key]) : `{${key}}`;
  });
}

/**
 * Join array with proper grammar (e.g., "a, b, and c")
 */
export function joinWithAnd(items: string[], conjunction: string = 'and'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

  const allButLast = items.slice(0, -1).join(', ');
  const last = items[items.length - 1];
  return `${allButLast}, ${conjunction} ${last}`;
}

/**
 * Mask string (e.g., for sensitive data)
 */
export function mask(
  text: string,
  visibleStart: number = 0,
  visibleEnd: number = 0,
  maskChar: string = '*'
): string {
  if (text.length <= visibleStart + visibleEnd) {
    return text;
  }

  const start = text.slice(0, visibleStart);
  const end = text.slice(-visibleEnd || undefined);
  const masked = maskChar.repeat(text.length - visibleStart - visibleEnd);

  return start + masked + (visibleEnd > 0 ? end : '');
}

/**
 * Wrap text at specified width
 */
export function wordWrap(text: string, width: number = 80): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= width) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines.join('\n');
}

