/**
 * HTML string utilities
 */

/**
 * Strip all HTML tags from string
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Decode HTML entities
 */
export function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&mdash;': '—',
    '&ndash;': '-',
    '&hellip;': '…',
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
    '&ldquo;': '\u201C',
    '&rdquo;': '\u201D',
    '&bull;': '•',
    '&middot;': '·',
    '&cent;': '¢',
    '&pound;': '£',
    '&euro;': '€',
    '&yen;': '¥',
  };

  let result = text;

  // Replace named entities
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }

  // Replace numeric entities (decimal)
  result = result.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));

  // Replace numeric entities (hex)
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  return result;
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return text.replace(/[&<>"']/g, (char) => escapeMap[char]);
}

/**
 * Unescape HTML (alias for decodeHtmlEntities)
 */
export function unescapeHtml(text: string): string {
  return decodeHtmlEntities(text);
}

/**
 * Extract text content from HTML, preserving some structure
 */
export function extractTextFromHtml(html: string): string {
  return html
    // Remove script and style tags with content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Add newlines for block elements
    .replace(/<\/(p|div|br|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<(p|div|br|h[1-6]|li|tr)[^>]*>/gi, '')
    // Remove remaining tags
    .replace(/<[^>]+>/g, '')
    // Decode entities
    .replace(/&nbsp;/g, ' ')
    // Normalize whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/**
 * Extract all links from HTML
 */
export function extractLinks(html: string): Array<{ href: string; text: string }> {
  const links: Array<{ href: string; text: string }> = [];
  const regex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;

  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push({
      href: match[1],
      text: stripHtml(match[2]).trim(),
    });
  }

  return links;
}

/**
 * Extract all image sources from HTML
 */
export function extractImageSources(html: string): string[] {
  const sources: string[] = [];
  const regex = /<img[^>]+src=["']([^"']+)["']/gi;

  let match;
  while ((match = regex.exec(html)) !== null) {
    sources.push(match[1]);
  }

  return sources;
}

/**
 * Remove specific HTML tags but keep content
 */
export function removeHtmlTags(html: string, tags: string[]): string {
  let result = html;
  for (const tag of tags) {
    const openRegex = new RegExp(`<${tag}[^>]*>`, 'gi');
    const closeRegex = new RegExp(`</${tag}>`, 'gi');
    result = result.replace(openRegex, '').replace(closeRegex, '');
  }
  return result;
}

/**
 * Wrap text in HTML tag
 */
export function wrapInTag(text: string, tag: string, attributes?: Record<string, string>): string {
  let attrString = '';
  if (attributes) {
    attrString = Object.entries(attributes)
      .map(([key, value]) => ` ${key}="${escapeHtml(value)}"`)
      .join('');
  }
  return `<${tag}${attrString}>${text}</${tag}>`;
}

/**
 * Convert newlines to <br> tags
 */
export function nl2br(text: string): string {
  return text.replace(/\n/g, '<br>');
}

/**
 * Convert <br> tags to newlines
 */
export function br2nl(html: string): string {
  return html.replace(/<br\s*\/?>/gi, '\n');
}

/**
 * Sanitize HTML - remove potentially dangerous elements
 * Note: For production use, consider a dedicated library like DOMPurify
 */
export function sanitizeHtml(html: string): string {
  return html
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: URLs
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
    // Remove data: URLs in src
    .replace(/src\s*=\s*["']data:[^"']*["']/gi, '');
}

