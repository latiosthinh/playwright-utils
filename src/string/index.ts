/**
 * String utilities module
 */

// Normalization utilities
export {
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
} from './normalize';

// HTML utilities
export {
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
} from './html';

// Regex utilities
export {
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
} from './regex';

// Format utilities
export {
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
} from './format';

