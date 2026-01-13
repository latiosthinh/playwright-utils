/**
 * Date utilities and generators
 */

import { randomInt } from './random';

/**
 * Generate a random date between start and end
 */
export function randomDate(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();

  if (startTime > endTime) {
    throw new Error('Start date must be before end date');
  }

  const randomTime = randomInt(startTime, endTime);
  return new Date(randomTime);
}

/**
 * Generate a date in the future
 * @param days - Number of days in the future
 */
export function futureDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Generate a date in the past
 * @param days - Number of days in the past
 */
export function pastDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Format date using a format string
 * Supported tokens: YYYY, YY, MM, M, DD, D, HH, H, mm, m, ss, s
 */
export function formatDate(date: Date, format: string): string {
  const tokens: Record<string, string> = {
    YYYY: date.getFullYear().toString(),
    YY: (date.getFullYear() % 100).toString().padStart(2, '0'),
    MM: (date.getMonth() + 1).toString().padStart(2, '0'),
    M: (date.getMonth() + 1).toString(),
    DD: date.getDate().toString().padStart(2, '0'),
    D: date.getDate().toString(),
    HH: date.getHours().toString().padStart(2, '0'),
    H: date.getHours().toString(),
    mm: date.getMinutes().toString().padStart(2, '0'),
    m: date.getMinutes().toString(),
    ss: date.getSeconds().toString().padStart(2, '0'),
    s: date.getSeconds().toString(),
  };

  let result = format;
  // Replace longer tokens first to avoid partial replacements
  const sortedTokens = Object.keys(tokens).sort((a, b) => b.length - a.length);

  for (const token of sortedTokens) {
    result = result.replace(new RegExp(token, 'g'), tokens[token]);
  }

  return result;
}

/**
 * Format date as MM/DD/YYYY
 */
export function formatMMDDYYYY(date: Date): string {
  return formatDate(date, 'MM/DD/YYYY');
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatYYYYMMDD(date: Date): string {
  return formatDate(date, 'YYYY-MM-DD');
}

/**
 * Format date as ISO 8601 string
 */
export function formatISO(date: Date): string {
  return date.toISOString();
}

/**
 * Format date as DD/MM/YYYY (European format)
 */
export function formatDDMMYYYY(date: Date): string {
  return formatDate(date, 'DD/MM/YYYY');
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add weeks to a date
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add years to a date
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Add interval to a date using string notation
 * @param interval - Interval string like '4w', '2m', '1y', '30d'
 */
export function addInterval(date: Date, interval: string): Date {
  const match = interval.match(/^(\d+)([dwmy])$/i);

  if (!match) {
    throw new Error(`Invalid interval format: ${interval}. Use format like '4w', '2m', '1y', '30d'`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 'd':
      return addDays(date, value);
    case 'w':
      return addWeeks(date, value);
    case 'm':
      return addMonths(date, value);
    case 'y':
      return addYears(date, value);
    default:
      throw new Error(`Unknown interval unit: ${unit}`);
  }
}

/**
 * Get the first day of the month
 */
export function firstDayOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get the last day of the month
 */
export function lastDayOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Get the first day of next month
 */
export function firstDayOfNextMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

/**
 * Get the first day of the year
 */
export function firstDayOfYear(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), 0, 1);
}

/**
 * Get the last day of the year
 */
export function lastDayOfYear(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), 11, 31);
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Get difference between two dates in days
 */
export function diffInDays(date1: Date, date2: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((date1.getTime() - date2.getTime()) / msPerDay);
}

/**
 * Get difference between two dates in business days (excluding weekends)
 */
export function diffInBusinessDays(date1: Date, date2: Date): number {
  let count = 0;
  const start = new Date(Math.min(date1.getTime(), date2.getTime()));
  const end = new Date(Math.max(date1.getTime(), date2.getTime()));

  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Generate a random birth date for a person of given age range
 */
export function randomBirthDate(minAge: number = 18, maxAge: number = 65): Date {
  const today = new Date();
  const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  return randomDate(minDate, maxDate);
}

/**
 * Get age from birth date
 */
export function getAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Parse date from string in various formats
 */
export function parseDate(dateString: string): Date {
  // Try ISO format first
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try MM/DD/YYYY
  const mmddyyyy = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyy) {
    return new Date(parseInt(mmddyyyy[3]), parseInt(mmddyyyy[1]) - 1, parseInt(mmddyyyy[2]));
  }

  // Try DD/MM/YYYY
  const ddmmyyyy = dateString.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmmyyyy) {
    return new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2]) - 1, parseInt(ddmmyyyy[1]));
  }

  throw new Error(`Unable to parse date: ${dateString}`);
}

