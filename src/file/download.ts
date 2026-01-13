/**
 * File download utilities
 */

import * as fs from 'fs';
import * as path from 'path';
import type { DownloadOptions } from '../types';

const DEFAULT_OPTIONS: Required<DownloadOptions> = {
  timeout: 30000,
  minSize: 1,
  pollInterval: 100,
};

/**
 * Wait for a file to exist and reach minimum size
 */
export async function waitForDownload(
  downloadPath: string,
  options: DownloadOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const absolutePath = path.isAbsolute(downloadPath)
    ? downloadPath
    : path.resolve(process.cwd(), downloadPath);

  const startTime = Date.now();

  while (Date.now() - startTime < opts.timeout) {
    try {
      const stats = await fs.promises.stat(absolutePath);

      // Check if file exists and meets minimum size
      if (stats.isFile() && stats.size >= opts.minSize) {
        // Wait a bit more to ensure file is fully written
        await sleep(100);

        // Verify size is stable (file finished writing)
        const newStats = await fs.promises.stat(absolutePath);
        if (newStats.size === stats.size) {
          return absolutePath;
        }
      }
    } catch {
      // File doesn't exist yet, continue waiting
    }

    await sleep(opts.pollInterval);
  }

  throw new Error(`Download timeout: File not found or incomplete after ${opts.timeout}ms: ${absolutePath}`);
}

/**
 * Wait for file to exist (without size check)
 */
export async function waitForFileExists(
  filePath: string,
  timeout: number = 30000
): Promise<boolean> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (fs.existsSync(absolutePath)) {
      return true;
    }
    await sleep(100);
  }

  return false;
}

/**
 * Get file size in bytes
 */
export function getFileSize(filePath: string): number {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  try {
    const stats = fs.statSync(absolutePath);
    return stats.size;
  } catch {
    return -1;
  }
}

/**
 * Delete file if it exists
 */
export function deleteIfExists(filePath: string): boolean {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  try {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Delete file if it exists (async)
 */
export async function deleteIfExistsAsync(filePath: string): Promise<boolean> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  try {
    await fs.promises.access(absolutePath);
    await fs.promises.unlink(absolutePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if file exists
 */
export function fileExists(filePath: string): boolean {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  return fs.existsSync(absolutePath);
}

/**
 * Check if file exists (async)
 */
export async function fileExistsAsync(filePath: string): Promise<boolean> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  try {
    await fs.promises.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create directory if it doesn't exist
 */
export function ensureDirectory(dirPath: string): void {
  const absolutePath = path.isAbsolute(dirPath)
    ? dirPath
    : path.resolve(process.cwd(), dirPath);

  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }
}

/**
 * Create directory if it doesn't exist (async)
 */
export async function ensureDirectoryAsync(dirPath: string): Promise<void> {
  const absolutePath = path.isAbsolute(dirPath)
    ? dirPath
    : path.resolve(process.cwd(), dirPath);

  try {
    await fs.promises.access(absolutePath);
  } catch {
    await fs.promises.mkdir(absolutePath, { recursive: true });
  }
}

/**
 * Get file extension
 */
export function getFileExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}

/**
 * Get filename without extension
 */
export function getFileNameWithoutExtension(filePath: string): string {
  const basename = path.basename(filePath);
  const ext = path.extname(basename);
  return basename.slice(0, -ext.length);
}

/**
 * Generate unique filename by appending number if file exists
 */
export function getUniqueFilename(filePath: string): string {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    return absolutePath;
  }

  const dir = path.dirname(absolutePath);
  const ext = path.extname(absolutePath);
  const basename = path.basename(absolutePath, ext);

  let counter = 1;
  let newPath = absolutePath;

  while (fs.existsSync(newPath)) {
    newPath = path.join(dir, `${basename}_${counter}${ext}`);
    counter++;
  }

  return newPath;
}

/**
 * Read file content as string
 */
export async function readFileContent(
  filePath: string,
  encoding: BufferEncoding = 'utf-8'
): Promise<string> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  return fs.promises.readFile(absolutePath, { encoding });
}

/**
 * Read file content as string (sync)
 */
export function readFileContentSync(
  filePath: string,
  encoding: BufferEncoding = 'utf-8'
): string {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  return fs.readFileSync(absolutePath, { encoding });
}

/**
 * Write content to file
 */
export async function writeFileContent(
  filePath: string,
  content: string,
  encoding: BufferEncoding = 'utf-8'
): Promise<void> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  // Ensure directory exists
  const dir = path.dirname(absolutePath);
  await ensureDirectoryAsync(dir);

  await fs.promises.writeFile(absolutePath, content, { encoding });
}

/**
 * Write content to file (sync)
 */
export function writeFileContentSync(
  filePath: string,
  content: string,
  encoding: BufferEncoding = 'utf-8'
): void {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  // Ensure directory exists
  const dir = path.dirname(absolutePath);
  ensureDirectory(dir);

  fs.writeFileSync(absolutePath, content, { encoding });
}

/**
 * Copy file
 */
export async function copyFile(source: string, destination: string): Promise<void> {
  const sourcePath = path.isAbsolute(source)
    ? source
    : path.resolve(process.cwd(), source);
  const destPath = path.isAbsolute(destination)
    ? destination
    : path.resolve(process.cwd(), destination);

  // Ensure destination directory exists
  await ensureDirectoryAsync(path.dirname(destPath));

  await fs.promises.copyFile(sourcePath, destPath);
}

/**
 * Move/rename file
 */
export async function moveFile(source: string, destination: string): Promise<void> {
  const sourcePath = path.isAbsolute(source)
    ? source
    : path.resolve(process.cwd(), source);
  const destPath = path.isAbsolute(destination)
    ? destination
    : path.resolve(process.cwd(), destination);

  // Ensure destination directory exists
  await ensureDirectoryAsync(path.dirname(destPath));

  await fs.promises.rename(sourcePath, destPath);
}

/**
 * List files in directory
 */
export async function listFiles(
  dirPath: string,
  extension?: string
): Promise<string[]> {
  const absolutePath = path.isAbsolute(dirPath)
    ? dirPath
    : path.resolve(process.cwd(), dirPath);

  const entries = await fs.promises.readdir(absolutePath, { withFileTypes: true });
  let files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(absolutePath, entry.name));

  if (extension) {
    const ext = extension.startsWith('.') ? extension : `.${extension}`;
    files = files.filter((file) => path.extname(file).toLowerCase() === ext.toLowerCase());
  }

  return files;
}

// ============================================================================
// Helper Functions
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

