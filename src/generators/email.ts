/**
 * Email generator utilities
 */

import type { EmailOptions } from '../types';
import { randomAlphanumeric, randomElement, randomInt } from './random';

const DEFAULT_DOMAINS = [
  'test.com',
  'example.com',
  'mailinator.com',
  'yopmail.com',
  'tempmail.com',
];

const NAME_PREFIXES = [
  'user', 'test', 'qa', 'auto', 'demo', 'sample', 'temp', 'dev',
];

/**
 * Generate a random email address
 */
export function generateEmail(options: EmailOptions = {}): string {
  const {
    domain = 'test.com',
    prefix = 'user',
    includeTimestamp = true,
    timestampFormat = 'compact',
  } = options;

  let localPart = prefix;

  if (includeTimestamp) {
    const timestamp = getTimestamp(timestampFormat);
    localPart = `${prefix}_${timestamp}`;
  } else {
    // Add random suffix for uniqueness
    localPart = `${prefix}_${randomAlphanumeric(8)}`;
  }

  return `${localPart}@${domain}`.toLowerCase();
}

/**
 * Generate an email with timestamp (shorthand)
 */
export function generateTimestampedEmail(
  prefix: string = 'test',
  domain: string = 'mailinator.com'
): string {
  return generateEmail({
    prefix,
    domain,
    includeTimestamp: true,
    timestampFormat: 'compact',
  });
}

/**
 * Generate a completely random email
 */
export function generateRandomEmail(domain?: string): string {
  const randomPrefix = `${randomElement(NAME_PREFIXES)}${randomInt(100, 9999)}`;
  const randomDomain = domain || randomElement(DEFAULT_DOMAINS);
  return `${randomPrefix}@${randomDomain}`.toLowerCase();
}

/**
 * Generate a professional-looking email
 */
export function generateProfessionalEmail(
  firstName?: string,
  lastName?: string,
  domain: string = 'company.com'
): string {
  const first = firstName || randomElement(['john', 'jane', 'alex', 'sam', 'chris', 'taylor']);
  const last = lastName || randomElement(['smith', 'jones', 'brown', 'wilson', 'davis', 'miller']);

  const formats = [
    `${first}.${last}`,
    `${first}${last}`,
    `${first[0]}${last}`,
    `${first}_${last}`,
  ];

  return `${randomElement(formats)}@${domain}`.toLowerCase();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  // RFC 5322 compliant regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * Parse email into components
 */
export function parseEmail(email: string): { local: string; domain: string } {
  const parts = email.split('@');
  if (parts.length !== 2) {
    throw new Error('Invalid email format');
  }
  return {
    local: parts[0],
    domain: parts[1],
  };
}

/**
 * Generate a disposable email address
 */
export function generateDisposableEmail(provider: 'mailinator' | 'yopmail' | 'tempmail' = 'mailinator'): string {
  const domains: Record<string, string> = {
    mailinator: 'mailinator.com',
    yopmail: 'yopmail.com',
    tempmail: 'tempmail.com',
  };

  return generateEmail({
    domain: domains[provider],
    prefix: 'test',
    includeTimestamp: true,
  });
}

/**
 * Generate email with plus addressing (for Gmail-style aliasing)
 */
export function generatePlusAddressedEmail(
  baseEmail: string,
  tag: string
): string {
  const { local, domain } = parseEmail(baseEmail);
  return `${local}+${tag}@${domain}`;
}

/**
 * Generate multiple unique emails
 */
export function generateUniqueEmails(
  count: number,
  options: EmailOptions = {}
): string[] {
  const emails = new Set<string>();

  while (emails.size < count) {
    emails.add(generateEmail({
      ...options,
      includeTimestamp: true,
      timestampFormat: 'epoch', // Use epoch for maximum uniqueness
    }));
  }

  return Array.from(emails);
}

// Helper function to generate timestamp
function getTimestamp(format: EmailOptions['timestampFormat']): string {
  const now = new Date();

  switch (format) {
    case 'iso':
      return now.toISOString().replace(/[:.]/g, '-');
    case 'epoch':
      return now.getTime().toString();
    case 'compact':
    default:
      // YYYYMMDD_HHMMSS format
      return [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
        '_',
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
        String(now.getSeconds()).padStart(2, '0'),
      ].join('');
  }
}

