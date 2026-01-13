/**
 * Password generator utilities
 */

import type { PasswordOptions, PasswordStrength } from '../types';
import { randomInt, randomElement, shuffle } from './random';

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
} as const;

/**
 * Generate a password with configurable options
 */
export function generatePassword(options: PasswordOptions = {}): string {
  const {
    length = 12,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
    excludeChars = '',
    mustInclude = [],
  } = options;

  if (length < 1) {
    throw new Error('Password length must be at least 1');
  }

  // Build character pool
  let pool = '';
  if (uppercase) pool += CHARSETS.uppercase;
  if (lowercase) pool += CHARSETS.lowercase;
  if (numbers) pool += CHARSETS.numbers;
  if (symbols) pool += CHARSETS.symbols;

  // Remove excluded characters
  if (excludeChars) {
    pool = pool
      .split('')
      .filter((c) => !excludeChars.includes(c))
      .join('');
  }

  if (pool.length === 0) {
    throw new Error('No characters available for password generation');
  }

  // Generate base password
  const chars: string[] = [];

  // First, ensure mustInclude requirements are met
  const requiredChars: string[] = [];
  for (const type of mustInclude) {
    let charset = '';
    switch (type) {
      case 'uppercase':
        charset = CHARSETS.uppercase;
        break;
      case 'lowercase':
        charset = CHARSETS.lowercase;
        break;
      case 'number':
        charset = CHARSETS.numbers;
        break;
      case 'symbol':
        charset = CHARSETS.symbols;
        break;
    }
    // Filter out excluded characters
    charset = charset
      .split('')
      .filter((c) => !excludeChars.includes(c))
      .join('');
    if (charset.length > 0) {
      requiredChars.push(charset.charAt(randomInt(0, charset.length - 1)));
    }
  }

  // Add required characters
  chars.push(...requiredChars);

  // Fill remaining length with random characters from pool
  while (chars.length < length) {
    chars.push(pool.charAt(randomInt(0, pool.length - 1)));
  }

  // Shuffle to randomize position of required characters
  return shuffle(chars).join('');
}

/**
 * Generate a secure password with all character types
 */
export function generateSecurePassword(length: number = 16): string {
  return generatePassword({
    length,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    mustInclude: ['uppercase', 'lowercase', 'number', 'symbol'],
  });
}

/**
 * Generate a numeric PIN
 */
export function generatePin(length: number = 4): string {
  if (length < 1) {
    throw new Error('PIN length must be at least 1');
  }
  let pin = '';
  for (let i = 0; i < length; i++) {
    pin += randomInt(0, 9).toString();
  }
  return pin;
}

/**
 * Generate a memorable password using words
 */
export function generateMemorablePassword(options: {
  wordCount?: number;
  separator?: string;
  capitalize?: boolean;
  appendNumber?: boolean;
} = {}): string {
  const {
    wordCount = 4,
    separator = '-',
    capitalize = true,
    appendNumber = true,
  } = options;

  // Simple word list for memorable passwords
  const words = [
    'apple', 'banana', 'cherry', 'dragon', 'eagle', 'falcon', 'garden',
    'harbor', 'island', 'jungle', 'kitten', 'lemon', 'mango', 'nebula',
    'ocean', 'planet', 'quartz', 'river', 'sunset', 'tiger', 'umbrella',
    'valley', 'winter', 'xenon', 'yellow', 'zebra', 'anchor', 'bridge',
    'castle', 'delta', 'ember', 'forest', 'glacier', 'horizon', 'ivory',
    'jasmine', 'karma', 'lunar', 'meadow', 'nova', 'oasis', 'phoenix',
  ];

  const selectedWords: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    selectedWords.push(randomElement(words));
  }

  let password = selectedWords
    .map((w) => (capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(separator);

  if (appendNumber) {
    password += separator + randomInt(10, 99);
  }

  return password;
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (password.length < 8) feedback.push('Password should be at least 8 characters');

  // Character type checks
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

  if (hasUppercase) score++;
  else feedback.push('Add uppercase letters');

  if (hasLowercase) score++;
  else feedback.push('Add lowercase letters');

  if (hasNumbers) score++;
  else feedback.push('Add numbers');

  if (hasSymbols) score++;
  else feedback.push('Add special characters');

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    score--;
    feedback.push('Avoid repeated characters');
  }

  if (/^[a-zA-Z]+$/.test(password)) {
    feedback.push('Mix in numbers and symbols');
  }

  // Normalize score to 0-4
  const normalizedScore = Math.max(0, Math.min(4, Math.floor(score / 2)));

  const levels: PasswordStrength['level'][] = ['weak', 'fair', 'good', 'strong', 'very-strong'];

  return {
    score: normalizedScore,
    level: levels[normalizedScore],
    feedback,
  };
}

