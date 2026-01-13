/**
 * Phone number generator utilities
 */

import type { PhoneOptions, PhoneComponents } from '../types';
import { randomInt, randomElement } from './random';

// Area codes by country (sample valid area codes)
const AREA_CODES: Record<string, string[]> = {
  US: ['201', '212', '213', '310', '312', '415', '512', '617', '702', '713', '818', '917'],
  CA: ['416', '604', '514', '403', '780', '905', '647', '778', '587', '250'],
  UK: ['20', '121', '131', '141', '151', '161', '113', '114', '115', '116'],
  AU: ['02', '03', '04', '07', '08'],
};

// Country calling codes
const COUNTRY_CODES: Record<string, string> = {
  US: '+1',
  CA: '+1',
  UK: '+44',
  AU: '+61',
};

/**
 * Generate a random phone number
 */
export function generatePhone(options: PhoneOptions = {}): string {
  const { country = 'US', format = 'dashed' } = options;

  const countryUpper = country.toUpperCase();
  const areaCodes = AREA_CODES[countryUpper] || AREA_CODES['US'];
  const countryCode = COUNTRY_CODES[countryUpper] || COUNTRY_CODES['US'];

  const areaCode = randomElement(areaCodes);

  let exchange: string;
  let subscriber: string;

  if (countryUpper === 'UK') {
    // UK format: 7xxx xxx xxx (mobile) or area code + 7 digits
    exchange = randomInt(100, 999).toString();
    subscriber = randomInt(1000, 9999).toString();
  } else if (countryUpper === 'AU') {
    // Australian format: 04xx xxx xxx (mobile)
    exchange = randomInt(100, 999).toString();
    subscriber = randomInt(1000, 9999).toString();
  } else {
    // US/CA format: NXX-XXXX where N is 2-9
    exchange = (randomInt(2, 9) * 100 + randomInt(0, 99)).toString().padStart(3, '0');
    subscriber = randomInt(0, 9999).toString().padStart(4, '0');
  }

  const components: PhoneComponents = {
    countryCode,
    areaCode,
    exchange,
    subscriber,
    raw: `${areaCode}${exchange}${subscriber}`,
  };

  return formatPhone(components.raw, format, countryUpper, countryCode);
}

/**
 * Format a phone number string
 */
export function formatPhone(
  phone: string,
  format: PhoneOptions['format'] = 'dashed',
  country: string = 'US',
  countryCode?: string
): string {
  // Strip all non-digits
  const digits = phone.replace(/\D/g, '');
  const code = countryCode || COUNTRY_CODES[country.toUpperCase()] || '+1';

  if (country.toUpperCase() === 'UK') {
    // UK formatting
    const area = digits.slice(0, 2);
    const rest = digits.slice(2);

    switch (format) {
      case 'digits':
        return digits;
      case 'dashed':
        return `${area}-${rest.slice(0, 4)}-${rest.slice(4)}`;
      case 'dotted':
        return `${area}.${rest.slice(0, 4)}.${rest.slice(4)}`;
      case 'international':
        return `${code} ${area} ${rest.slice(0, 4)} ${rest.slice(4)}`;
      case 'national':
        return `0${area} ${rest.slice(0, 4)} ${rest.slice(4)}`;
      case 'parentheses':
        return `(0${area}) ${rest.slice(0, 4)} ${rest.slice(4)}`;
      default:
        return `${area}-${rest.slice(0, 4)}-${rest.slice(4)}`;
    }
  }

  // US/CA/AU formatting (10 digits: area + exchange + subscriber)
  const area = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);
  const subscriber = digits.slice(6, 10);

  switch (format) {
    case 'digits':
      return digits;
    case 'dashed':
      return `${area}-${exchange}-${subscriber}`;
    case 'dotted':
      return `${area}.${exchange}.${subscriber}`;
    case 'international':
      return `${code} ${area} ${exchange} ${subscriber}`;
    case 'national':
      return `(${area}) ${exchange}-${subscriber}`;
    case 'parentheses':
      return `(${area}) ${exchange}-${subscriber}`;
    default:
      return `${area}-${exchange}-${subscriber}`;
  }
}

/**
 * Parse a phone number into components
 */
export function parsePhone(phone: string): PhoneComponents {
  // Remove all non-digits except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Extract country code if present
  let countryCode = '';
  if (cleaned.startsWith('+')) {
    // Find country code (1-3 digits after +)
    const match = cleaned.match(/^\+(\d{1,3})/);
    if (match) {
      countryCode = '+' + match[1];
      cleaned = cleaned.slice(match[0].length);
    }
  }

  // For 10-digit numbers (US/CA format)
  if (cleaned.length === 10) {
    return {
      countryCode: countryCode || '+1',
      areaCode: cleaned.slice(0, 3),
      exchange: cleaned.slice(3, 6),
      subscriber: cleaned.slice(6, 10),
      raw: cleaned,
    };
  }

  // For 11-digit numbers (with leading 1 for US/CA)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return {
      countryCode: '+1',
      areaCode: cleaned.slice(1, 4),
      exchange: cleaned.slice(4, 7),
      subscriber: cleaned.slice(7, 11),
      raw: cleaned.slice(1),
    };
  }

  // Fallback for other formats
  return {
    countryCode: countryCode || '',
    areaCode: cleaned.slice(0, 3),
    exchange: cleaned.slice(3, 6),
    subscriber: cleaned.slice(6),
    raw: cleaned,
  };
}

/**
 * Validate if a phone number is potentially valid
 * Note: This is a basic format validation, not a carrier lookup
 */
export function isValidPhone(phone: string, country: string = 'US'): boolean {
  const digits = phone.replace(/\D/g, '');
  const countryUpper = country.toUpperCase();

  switch (countryUpper) {
    case 'US':
    case 'CA':
      // NANP: 10 digits, area code doesn't start with 0 or 1
      if (digits.length === 10) {
        return digits[0] !== '0' && digits[0] !== '1';
      }
      // With country code
      if (digits.length === 11 && digits[0] === '1') {
        return digits[1] !== '0' && digits[1] !== '1';
      }
      return false;

    case 'UK':
      // UK: 10-11 digits
      return digits.length >= 10 && digits.length <= 11;

    case 'AU':
      // Australia: 10 digits
      return digits.length === 10;

    default:
      // Generic: 7-15 digits
      return digits.length >= 7 && digits.length <= 15;
  }
}

/**
 * Generate a mobile phone number
 */
export function generateMobilePhone(country: string = 'US'): string {
  const countryUpper = country.toUpperCase();

  switch (countryUpper) {
    case 'UK':
      // UK mobile: 07xxx xxxxxx
      return `07${randomInt(100, 999)}${randomInt(100000, 999999)}`;

    case 'AU':
      // Australian mobile: 04xx xxx xxx
      return `04${randomInt(10, 99)}${randomInt(100, 999)}${randomInt(100, 999)}`;

    default:
      // US/CA - just use regular generation
      return generatePhone({ country: countryUpper, format: 'digits' });
  }
}

