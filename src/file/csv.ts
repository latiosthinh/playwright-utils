/**
 * CSV file utilities
 */

import * as fs from 'fs';
import * as path from 'path';
import type { CSVOptions, CSVValidationOptions, CSVValidationResult } from '../types';

const DEFAULT_OPTIONS: Required<CSVOptions> = {
  delimiter: ',',
  hasHeaders: true,
  encoding: 'utf-8',
  skipEmptyLines: true,
};

/**
 * Read CSV file and return array of objects
 */
export async function readCSV<T = Record<string, string>>(
  filePath: string,
  options: CSVOptions = {}
): Promise<T[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

  const content = await fs.promises.readFile(absolutePath, { encoding: opts.encoding });
  return parseCSV<T>(content, opts);
}

/**
 * Read CSV file synchronously
 */
export function readCSVSync<T = Record<string, string>>(
  filePath: string,
  options: CSVOptions = {}
): T[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

  const content = fs.readFileSync(absolutePath, { encoding: opts.encoding });
  return parseCSV<T>(content, opts);
}

/**
 * Parse CSV content string into array of objects
 */
export function parseCSV<T = Record<string, string>>(
  content: string,
  options: CSVOptions = {}
): T[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const lines = content.split(/\r?\n/);
  const result: T[] = [];

  // Filter empty lines if needed
  const filteredLines = opts.skipEmptyLines
    ? lines.filter((line) => line.trim().length > 0)
    : lines;

  if (filteredLines.length === 0) {
    return result;
  }

  let headers: string[];
  let dataStartIndex: number;

  if (opts.hasHeaders) {
    headers = parseLine(filteredLines[0], opts.delimiter);
    dataStartIndex = 1;
  } else {
    // Generate numeric headers
    const firstLine = parseLine(filteredLines[0], opts.delimiter);
    headers = firstLine.map((_, i) => `column_${i}`);
    dataStartIndex = 0;
  }

  for (let i = dataStartIndex; i < filteredLines.length; i++) {
    const values = parseLine(filteredLines[i], opts.delimiter);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    result.push(row as T);
  }

  return result;
}

/**
 * Write data to CSV file
 */
export async function writeCSV(
  filePath: string,
  data: Record<string, unknown>[],
  options: CSVOptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

  const content = stringifyCSV(data, opts);
  await fs.promises.writeFile(absolutePath, content, { encoding: opts.encoding });
}

/**
 * Write data to CSV file synchronously
 */
export function writeCSVSync(
  filePath: string,
  data: Record<string, unknown>[],
  options: CSVOptions = {}
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

  const content = stringifyCSV(data, opts);
  fs.writeFileSync(absolutePath, content, { encoding: opts.encoding });
}

/**
 * Convert data array to CSV string
 */
export function stringifyCSV(
  data: Record<string, unknown>[],
  options: CSVOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const lines: string[] = [];

  if (opts.hasHeaders) {
    lines.push(headers.map((h) => escapeField(h, opts.delimiter)).join(opts.delimiter));
  }

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      return escapeField(value === null || value === undefined ? '' : String(value), opts.delimiter);
    });
    lines.push(values.join(opts.delimiter));
  }

  return lines.join('\n');
}

/**
 * Validate CSV file against schema
 */
export async function validateCSV(
  filePath: string,
  options: CSVValidationOptions = {}
): Promise<CSVValidationResult> {
  const errors: string[] = [];

  try {
    const data = await readCSV(filePath, options);
    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    // Check expected columns
    if (options.expectedColumns) {
      const missingColumns = options.expectedColumns.filter((col) => !columns.includes(col));
      if (missingColumns.length > 0) {
        errors.push(`Missing columns: ${missingColumns.join(', ')}`);
      }
    }

    // Check row count
    if (options.expectedRowCount !== undefined && data.length !== options.expectedRowCount) {
      errors.push(`Expected ${options.expectedRowCount} rows, got ${data.length}`);
    }

    if (options.minRowCount !== undefined && data.length < options.minRowCount) {
      errors.push(`Expected at least ${options.minRowCount} rows, got ${data.length}`);
    }

    if (options.maxRowCount !== undefined && data.length > options.maxRowCount) {
      errors.push(`Expected at most ${options.maxRowCount} rows, got ${data.length}`);
    }

    // Check required fields
    if (options.requiredFields) {
      for (let i = 0; i < data.length; i++) {
        const row = data[i] as Record<string, string>;
        for (const field of options.requiredFields) {
          if (!row[field] || row[field].trim() === '') {
            errors.push(`Row ${i + 1}: Missing required field '${field}'`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      rowCount: data.length,
      columns,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      isValid: false,
      errors: [`Failed to read CSV: ${errorMessage}`],
      rowCount: 0,
      columns: [],
    };
  }
}

/**
 * Get CSV headers without reading entire file
 */
export async function getCSVHeaders(
  filePath: string,
  options: CSVOptions = {}
): Promise<string[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

  const content = await fs.promises.readFile(absolutePath, { encoding: opts.encoding });
  const firstLine = content.split(/\r?\n/)[0];

  return parseLine(firstLine, opts.delimiter);
}

/**
 * Count rows in CSV file
 */
export async function countCSVRows(
  filePath: string,
  options: CSVOptions = {}
): Promise<number> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

  const content = await fs.promises.readFile(absolutePath, { encoding: opts.encoding });
  const lines = content.split(/\r?\n/).filter((line) => opts.skipEmptyLines ? line.trim().length > 0 : true);

  // Subtract header row if present
  return opts.hasHeaders ? Math.max(0, lines.length - 1) : lines.length;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // End of quoted field
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Escape a field value for CSV
 */
function escapeField(value: string, delimiter: string): string {
  // Check if quoting is needed
  const needsQuoting = value.includes(delimiter) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r');

  if (needsQuoting) {
    // Escape quotes by doubling them
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return value;
}

