/**
 * @nsc/playwright-utils
 *
 * Reusable utilities for Playwright test automation
 *
 * This package provides:
 * - Playwright helpers (page, locator, wait, scroll, network, viewport)
 * - Pure generators (random, password, phone, email, address, card, date)
 * - String utilities (normalize, html, regex, format)
 * - File utilities (csv, download)
 */

// ============================================================================
// Types
// ============================================================================
export type {
  // Generator types
  PasswordOptions,
  PasswordStrength,
  PhoneOptions,
  PhoneComponents,
  EmailOptions,
  AddressOptions,
  Address,
  CardOptions,
  CardInfo,
  // File types
  CSVOptions,
  CSVValidationOptions,
  CSVValidationResult,
  DownloadOptions,
  // Playwright types
  ClickOptions,
  FillOptions,
  ScrollOptions,
  WaitOptions,
  RequestOptions,
  CookieOptions,
  MockResponse,
} from './types';

// ============================================================================
// Generators (Pure - no dependencies)
// ============================================================================
export {
  // Random
  randomInt,
  randomFloat,
  randomString,
  randomAlpha,
  randomAlphanumeric,
  randomHex,
  randomUUID,
  randomBoolean,
  randomElement,
  randomElements,
  shuffle,
  randomLowercase,
  randomUppercase,
  randomNumeric,
  CHARSETS,
  // Password
  generatePassword,
  generateSecurePassword,
  generatePin,
  generateMemorablePassword,
  validatePasswordStrength,
  // Phone
  generatePhone,
  formatPhone,
  parsePhone,
  isValidPhone,
  generateMobilePhone,
  // Email
  generateEmail,
  generateTimestampedEmail,
  generateRandomEmail,
  generateProfessionalEmail,
  isValidEmail,
  parseEmail,
  generateDisposableEmail,
  generatePlusAddressedEmail,
  generateUniqueEmails,
  // Address
  generateStreetAddress,
  generateCity,
  generateState,
  generatePostalCode,
  generateFullAddress,
  formatAddress,
  generatePOBox,
  // Card
  generateCardNumber,
  generateExpiry,
  generateExpiryComponents,
  generateCVC,
  generateCard,
  isValidCardNumber,
  getCardType,
  formatCardNumber,
  maskCardNumber,
  getTestCardNumber,
  // Date
  randomDate,
  futureDate,
  pastDate,
  formatDate,
  formatMMDDYYYY,
  formatYYYYMMDD,
  formatISO,
  formatDDMMYYYY,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  addInterval,
  firstDayOfMonth,
  lastDayOfMonth,
  firstDayOfNextMonth,
  firstDayOfYear,
  lastDayOfYear,
  isToday,
  isPast,
  isFuture,
  diffInDays,
  diffInBusinessDays,
  randomBirthDate,
  getAge,
  parseDate,
} from './generators';

// ============================================================================
// String Utilities (Pure - no dependencies)
// ============================================================================
export {
  // Normalize
  normalize,
  normalizeWhitespace,
  removeAccents,
  toSlug,
  toKebabCase,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toConstantCase,
  normalizeLineEndings,
  removeZeroWidthChars,
  cleanForComparison,
  equalsIgnoreCaseAndWhitespace,
  removeWhitespace,
  padLeft,
  padRight,
  ensurePrefix,
  ensureSuffix,
  removePrefix,
  removeSuffix,
  // HTML
  stripHtml,
  decodeHtmlEntities,
  escapeHtml,
  unescapeHtml,
  extractTextFromHtml,
  extractLinks,
  extractImageSources,
  removeHtmlTags,
  wrapInTag,
  nl2br,
  br2nl,
  sanitizeHtml,
  // Regex
  escapeRegex,
  buildFlexibleRegex,
  createMatcher,
  buildWordBoundaryRegex,
  buildStartsWithRegex,
  buildEndsWithRegex,
  buildAlternationRegex,
  buildContainsAllRegex,
  testPattern,
  extractMatches,
  extractFirstMatch,
  extractGroups,
  replaceWithCallback,
  PATTERNS,
  validate,
  // Format
  cleanNumeric,
  formatCurrency,
  formatNumber,
  formatWithCommas,
  truncate,
  truncateWords,
  capitalize,
  titleCase,
  sentenceCase,
  formatBytes,
  formatDuration,
  formatPhoneDisplay,
  formatCardDisplay,
  formatPercent,
  pluralize,
  formatCount,
  formatOrdinal,
  interpolate,
  joinWithAnd,
  mask,
  wordWrap,
} from './string';

// ============================================================================
// File Utilities (Node.js - fs dependency)
// ============================================================================
export {
  // CSV
  readCSV,
  readCSVSync,
  parseCSV,
  writeCSV,
  writeCSVSync,
  stringifyCSV,
  validateCSV,
  getCSVHeaders,
  countCSVRows,
  // Download/File
  waitForDownload,
  waitForFileExists,
  getFileSize,
  deleteIfExists,
  deleteIfExistsAsync,
  fileExists,
  fileExistsAsync,
  ensureDirectory,
  ensureDirectoryAsync,
  getFileExtension,
  getFileNameWithoutExtension,
  getUniqueFilename,
  readFileContent,
  readFileContentSync,
  writeFileContent,
  writeFileContentSync,
  copyFile,
  moveFile,
  listFiles,
} from './file';

// ============================================================================
// Playwright Helpers (Peer dependency)
// ============================================================================
export {
  // Page helpers
  PageHelpers,
  createPageHelpers,
  BREAKPOINTS,
  // Locator helpers
  buildLocator,
  combineLocators,
  filterVisibleLocators,
  escapeSelector,
  buildTextSelector,
  buildRoleSelector,
  buildTestIdSelector,
  buildAriaLabelSelector,
  buildIdSelector,
  buildClassSelector,
  buildAttributeSelector,
  buildNthChildSelector,
  buildNthOfTypeSelector,
  buildFirstChildSelector,
  buildLastChildSelector,
  buildVisibleSelector,
  buildContainsTextSelector,
  buildHasChildSelector,
  LocatorBuilder,
  createLocatorBuilder,
  suggestSelector,
  // Wait helpers
  WaitHelpers,
  createWaitHelpers,
  poll,
  retry,
  // Scroll helpers
  ScrollHelpers,
  createScrollHelpers,
  // Network helpers
  NetworkHelpers,
  createNetworkHelpers,
  ApiClient,
  createApiClient,
  // Viewport helpers
  ViewportHelpers,
  createViewportHelpers,
  VIEWPORTS,
  VIEWPORT_BREAKPOINTS,
  getViewport,
  getMobileViewports,
  getTabletViewports,
  getDesktopViewports,
} from './playwright';

export type { ViewportName, BreakpointName } from './playwright';

