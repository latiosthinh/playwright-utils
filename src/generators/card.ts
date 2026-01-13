/**
 * Credit card generator utilities
 * Note: Generated numbers are for testing purposes only
 */

import type { CardOptions, CardInfo } from '../types';
import { randomInt, randomElement } from './random';

// Card prefixes (IINs/BINs)
const CARD_PREFIXES: Record<string, string[]> = {
  visa: ['4'],
  mastercard: ['51', '52', '53', '54', '55', '2221', '2720'],
  amex: ['34', '37'],
  discover: ['6011', '644', '645', '646', '647', '648', '649', '65'],
};

// Card lengths
const CARD_LENGTHS: Record<string, number> = {
  visa: 16,
  mastercard: 16,
  amex: 15,
  discover: 16,
};

// CVC lengths
const CVC_LENGTHS: Record<string, number> = {
  visa: 3,
  mastercard: 3,
  amex: 4,
  discover: 3,
};

/**
 * Generate a credit card number
 */
export function generateCardNumber(options: CardOptions = {}): string {
  const { type = 'visa', valid = true } = options;

  const prefixes = CARD_PREFIXES[type] || CARD_PREFIXES['visa'];
  const length = CARD_LENGTHS[type] || 16;
  const prefix = randomElement(prefixes);

  // Generate random digits for the middle
  let number = prefix;
  const remainingLength = length - prefix.length - 1; // -1 for check digit

  for (let i = 0; i < remainingLength; i++) {
    number += randomInt(0, 9).toString();
  }

  if (valid) {
    // Calculate and append Luhn check digit
    const checkDigit = calculateLuhnCheckDigit(number);
    number += checkDigit;
  } else {
    // Append random digit (may or may not be valid)
    number += randomInt(0, 9).toString();
  }

  return number;
}

/**
 * Generate card expiry date (MM/YY format)
 * @param yearsAhead - How many years in the future (default: 3)
 */
export function generateExpiry(yearsAhead: number = 3): string {
  const now = new Date();
  const futureYear = now.getFullYear() + randomInt(1, yearsAhead);
  const month = randomInt(1, 12);

  const mm = month.toString().padStart(2, '0');
  const yy = (futureYear % 100).toString().padStart(2, '0');

  return `${mm}/${yy}`;
}

/**
 * Generate card expiry as separate month/year
 */
export function generateExpiryComponents(yearsAhead: number = 3): { month: string; year: string } {
  const expiry = generateExpiry(yearsAhead);
  const [month, year] = expiry.split('/');
  return { month, year };
}

/**
 * Generate CVC/CVV code
 */
export function generateCVC(length: number = 3): string {
  let cvc = '';
  for (let i = 0; i < length; i++) {
    cvc += randomInt(0, 9).toString();
  }
  return cvc;
}

/**
 * Generate complete card information
 */
export function generateCard(options: CardOptions = {}): CardInfo {
  const type = options.type || 'visa';
  const cvcLength = CVC_LENGTHS[type] || 3;

  return {
    number: generateCardNumber(options),
    expiry: generateExpiry(),
    cvc: generateCVC(cvcLength),
    type,
  };
}

/**
 * Validate card number using Luhn algorithm
 */
export function isValidCardNumber(number: string): boolean {
  const digits = number.replace(/\D/g, '');

  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  return luhnCheck(digits);
}

/**
 * Get card type from number
 */
export function getCardType(number: string): string | null {
  const digits = number.replace(/\D/g, '');

  // Check each card type's prefixes
  for (const [type, prefixes] of Object.entries(CARD_PREFIXES)) {
    for (const prefix of prefixes) {
      if (digits.startsWith(prefix)) {
        return type;
      }
    }
  }

  return null;
}

/**
 * Format card number with spaces
 */
export function formatCardNumber(number: string, type?: string): string {
  const digits = number.replace(/\D/g, '');
  const cardType = type || getCardType(digits) || 'visa';

  if (cardType === 'amex') {
    // Amex: 4-6-5 grouping
    return digits.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
  }

  // Default: 4-4-4-4 grouping
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

/**
 * Mask card number for display
 */
export function maskCardNumber(number: string, visibleDigits: number = 4): string {
  const digits = number.replace(/\D/g, '');
  const masked = '*'.repeat(digits.length - visibleDigits);
  const visible = digits.slice(-visibleDigits);
  return formatCardNumber(masked + visible);
}

/**
 * Generate test card numbers for specific scenarios
 */
export function getTestCardNumber(scenario: 'success' | 'decline' | 'error' | 'insufficient'): string {
  // Common test card numbers used by payment processors
  const testCards: Record<string, string> = {
    success: '4111111111111111',      // Visa - typically succeeds
    decline: '4000000000000002',      // Visa - typically declines
    error: '4000000000000119',        // Visa - typically errors
    insufficient: '4000000000009995', // Visa - insufficient funds
  };

  return testCards[scenario] || testCards['success'];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Luhn algorithm check
 */
function luhnCheck(digits: string): boolean {
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Calculate Luhn check digit
 */
function calculateLuhnCheckDigit(partialNumber: string): string {
  // Try each digit 0-9 and find which makes the number valid
  for (let digit = 0; digit <= 9; digit++) {
    if (luhnCheck(partialNumber + digit)) {
      return digit.toString();
    }
  }
  return '0';
}

