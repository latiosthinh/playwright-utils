# playwright-utils

A comprehensive collection of reusable utilities for Playwright test automation. This package provides both Playwright-specific helpers and framework-agnostic utilities that can be used in any Node.js project.

## Installation

```bash
npm install playwright-utils
```

**Note:** `@playwright/test` is a peer dependency and must be installed separately if you want to use the Playwright helpers.

```bash
npm install @playwright/test
```

## Features

- **Playwright Helpers** - Page interaction, waiting, scrolling, network, and viewport utilities
- **Data Generators** - Random values, passwords, phone numbers, emails, addresses, credit cards, dates
- **String Utilities** - Normalization, HTML processing, regex builders, formatting
- **File Utilities** - CSV reading/writing, file download waiting

## Quick Start

```typescript
// Import everything
import { PageHelpers, generatePassword, normalize } from 'playwright-utils';

// Or import specific modules
import { PageHelpers, WaitHelpers } from 'playwright-utils/playwright';
import { generateEmail, generatePhone } from 'playwright-utils/generators';
import { stripHtml, escapeRegex } from 'playwright-utils/string';
import { readCSV, waitForDownload } from 'playwright-utils/file';
```

## Usage Examples

### Playwright Helpers

#### Page Helpers

```typescript
import { createPageHelpers } from 'playwright-utils/playwright';

test('example test', async ({ page }) => {
  const helpers = createPageHelpers(page);

  // Viewport detection
  if (helpers.isMobile) {
    console.log('Running on mobile viewport');
  }

  // Safe interactions (returns boolean success)
  const clicked = await helpers.clickSafe(page.locator('#submit'));
  const filled = await helpers.fillSafe(page.locator('#email'), 'test@example.com');

  // Get text safely with fallback
  const text = await helpers.getTextSafe(page.locator('.price'), '$0.00');

  // Get all visible elements
  const visibleItems = await helpers.getAllVisibleElements(page.locator('.item'));
});
```

#### Wait Helpers

```typescript
import { createWaitHelpers } from 'playwright-utils/playwright';

test('wait example', async ({ page }) => {
  const waits = createWaitHelpers(page);

  // Wait for element states
  await waits.waitForVisible(page.locator('.modal'));
  await waits.waitForHidden(page.locator('.loading'));

  // Wait for custom conditions
  await waits.waitForCondition(
    async () => (await page.locator('.items').count()) > 5,
    { timeout: 10000, message: 'Expected more than 5 items' }
  );

  // Wait for text
  await waits.waitForText(page.locator('.status'), 'Complete');

  // Wait for loading indicators to disappear
  await waits.waitForLoadingGone('.spinner');
});
```

#### Scroll Helpers

```typescript
import { createScrollHelpers } from 'playwright-utils/playwright';

test('scroll example', async ({ page }) => {
  const scroll = createScrollHelpers(page);

  // Basic scrolling
  await scroll.scrollToElement(page.locator('#footer'));
  await scroll.scrollToTop();
  await scroll.scrollToBottom();

  // Scroll + action combinations
  await scroll.clickWithScroll(page.locator('#hidden-button'));
  await scroll.fillWithScroll(page.locator('#form-field'), 'value');

  // Lazy loading - scroll to load all content
  await scroll.scrollToLoadAll({ delay: 500, maxScrolls: 20 });

  // Scroll until element is found
  const found = await scroll.scrollUntilFound(page.locator('.target-item'));
});
```

#### Network Helpers

```typescript
import { createNetworkHelpers } from 'playwright-utils/playwright';

test('network example', async ({ page, context }) => {
  const network = createNetworkHelpers(page, context);

  // Make API calls using page context (shares cookies)
  const data = await network.fetchJson<{ items: string[] }>('/api/items');
  await network.postJson('/api/submit', { name: 'Test' });

  // Cookie management
  const token = await network.getCookie('auth_token');
  await network.setCookie('preference', 'dark', { path: '/' });

  // Mock responses
  await network.mockResponse('**/api/users', {
    status: 200,
    body: { users: [] },
  });

  // Block requests
  await network.blockResourceTypes(['image', 'font']);

  // Local storage
  await network.setLocalStorageItem('theme', 'dark');
});
```

#### Viewport Helpers

```typescript
import { createViewportHelpers } from 'playwright-utils/playwright';

test('viewport example', async ({ page }) => {
  const viewport = createViewportHelpers(page);

  // Set device viewport
  await viewport.setDevice('iPhone 14');
  await viewport.setDevice('Desktop FHD');

  // Check current viewport
  if (viewport.isMobile()) {
    // Mobile-specific assertions
  }

  // Test at multiple viewports
  await viewport.testResponsive(async (isMobile) => {
    // Test runs for both mobile and desktop
  });
});
```

### Data Generators

#### Random Values

```typescript
import {
  randomInt,
  randomString,
  randomElement,
  shuffle,
  randomUUID,
} from 'playwright-utils/generators';

const id = randomInt(1, 1000);           // Random integer
const code = randomString(8);             // Random alphanumeric string
const item = randomElement(['a', 'b']);   // Random array element
const shuffled = shuffle([1, 2, 3, 4]);   // Shuffled array
const uuid = randomUUID();                // UUID v4
```

#### Password Generator

```typescript
import {
  generatePassword,
  generateSecurePassword,
  generatePin,
  validatePasswordStrength,
} from 'playwright-utils/generators';

// Basic password
const password = generatePassword({ length: 12 });

// Secure password with all character types
const secure = generateSecurePassword(16);

// PIN code
const pin = generatePin(6);

// Validate strength
const strength = validatePasswordStrength('MyP@ssw0rd');
console.log(strength.level); // 'strong'
```

#### Phone Generator

```typescript
import {
  generatePhone,
  formatPhone,
  isValidPhone,
} from 'playwright-utils/generators';

// Generate phone number
const phone = generatePhone({ country: 'US', format: 'dashed' });
// Output: "201-555-1234"

// Format existing number
const formatted = formatPhone('2015551234', 'international');
// Output: "+1 201 555 1234"

// Validate
const valid = isValidPhone('201-555-1234', 'US'); // true
```

#### Email Generator

```typescript
import {
  generateEmail,
  generateTimestampedEmail,
  generateProfessionalEmail,
} from 'playwright-utils/generators';

// Basic email with timestamp
const email = generateEmail({
  prefix: 'test',
  domain: 'mailinator.com',
});
// Output: "test_20240115_143022@mailinator.com"

// Quick timestamped email
const quick = generateTimestampedEmail('qa', 'test.com');

// Professional looking email
const pro = generateProfessionalEmail('John', 'Doe', 'company.com');
// Output: "john.doe@company.com"
```

#### Address Generator

```typescript
import {
  generateFullAddress,
  generateStreetAddress,
  generatePostalCode,
} from 'playwright-utils/generators';

// Full address
const address = generateFullAddress({ country: 'US', includeApt: true });
// {
//   street: "123 Oak Street",
//   apt: "Apt 4B",
//   city: "New York",
//   state: "NY",
//   postalCode: "10001",
//   country: "US"
// }

// Canadian postal code
const postalCode = generatePostalCode('CA');
// Output: "M5V 2H1"
```

#### Credit Card Generator

```typescript
import {
  generateCard,
  generateCardNumber,
  isValidCardNumber,
  getTestCardNumber,
} from 'playwright-utils/generators';

// Generate complete card
const card = generateCard({ type: 'visa' });
// {
//   number: "4111111111111111",
//   expiry: "03/27",
//   cvc: "123",
//   type: "visa"
// }

// Test card for specific scenarios
const testCard = getTestCardNumber('success');
const declineCard = getTestCardNumber('decline');

// Validate card number (Luhn check)
const valid = isValidCardNumber('4111111111111111'); // true
```

#### Date Utilities

```typescript
import {
  formatDate,
  addDays,
  addInterval,
  futureDate,
  randomBirthDate,
  diffInBusinessDays,
} from 'playwright-utils/generators';

// Format date
const formatted = formatDate(new Date(), 'MM/DD/YYYY');

// Add time
const nextWeek = addDays(new Date(), 7);
const nextMonth = addInterval(new Date(), '1m');

// Future date
const delivery = futureDate(5); // 5 days from now

// Random birth date (18-65 years old)
const birthDate = randomBirthDate(18, 65);

// Business days between dates
const workDays = diffInBusinessDays(startDate, endDate);
```

### String Utilities

```typescript
import {
  // Normalization
  normalize,
  toSlug,
  toCamelCase,
  normalizeWhitespace,
  
  // HTML
  stripHtml,
  escapeHtml,
  extractLinks,
  
  // Regex
  escapeRegex,
  buildFlexibleRegex,
  PATTERNS,
  
  // Formatting
  formatCurrency,
  truncate,
  capitalize,
  mask,
} from 'playwright-utils/string';

// Normalize
const clean = normalizeWhitespace('  hello   world  '); // "hello world"
const slug = toSlug('Hello World!'); // "hello-world"
const camel = toCamelCase('hello-world'); // "helloWorld"

// HTML
const text = stripHtml('<p>Hello <b>World</b></p>'); // "Hello World"
const safe = escapeHtml('<script>'); // "&lt;script&gt;"
const links = extractLinks('<a href="/page">Link</a>');

// Regex
const escaped = escapeRegex('$100.00'); // "\\$100\\.00"
const flexible = buildFlexibleRegex('hello world'); // matches "hello  world"
const isEmail = PATTERNS.email.test('test@example.com');

// Formatting
const price = formatCurrency(99.99, 'USD'); // "$99.99"
const short = truncate('Long text here', 10); // "Long te..."
const title = capitalize('hello'); // "Hello"
const masked = mask('1234567890', 0, 4); // "******7890"
```

### File Utilities

```typescript
import {
  readCSV,
  writeCSV,
  validateCSV,
  waitForDownload,
  fileExists,
  ensureDirectory,
} from 'playwright-utils/file';

// Read CSV
const data = await readCSV<{ name: string; email: string }>('users.csv');

// Write CSV
await writeCSV('output.csv', [
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' },
]);

// Validate CSV
const result = await validateCSV('data.csv', {
  expectedColumns: ['id', 'name', 'email'],
  requiredFields: ['id', 'name'],
  minRowCount: 1,
});

// Wait for download
const filePath = await waitForDownload('downloads/report.pdf', {
  timeout: 30000,
  minSize: 1024,
});

// File operations
if (fileExists('config.json')) {
  // ...
}
ensureDirectory('output/reports');
```

## Module Structure

```
playwright-utils
├── /playwright      # Playwright-specific helpers (peer dep)
│   ├── PageHelpers
│   ├── WaitHelpers
│   ├── ScrollHelpers
│   ├── NetworkHelpers
│   ├── ViewportHelpers
│   └── LocatorBuilder
├── /generators      # Pure data generators (no deps)
│   ├── random
│   ├── password
│   ├── phone
│   ├── email
│   ├── address
│   ├── card
│   └── date
├── /string          # String utilities (no deps)
│   ├── normalize
│   ├── html
│   ├── regex
│   └── format
└── /file            # File utilities (Node.js fs)
    ├── csv
    └── download
```

## TypeScript Support

This package is written in TypeScript and includes full type definitions. All types are exported:

```typescript
import type {
  PasswordOptions,
  PhoneOptions,
  EmailOptions,
  AddressOptions,
  CardOptions,
  CSVOptions,
  ClickOptions,
  WaitOptions,
  // ... and more
} from 'playwright-utils';
```

## API Reference

### Playwright Module

| Class | Description |
|-------|-------------|
| `PageHelpers` | Page interaction utilities, viewport detection |
| `WaitHelpers` | Wait for conditions, elements, loading states |
| `ScrollHelpers` | Scroll operations, lazy loading |
| `NetworkHelpers` | API calls, cookies, request interception |
| `ViewportHelpers` | Viewport management, responsive testing |
| `LocatorBuilder` | Fluent API for building selectors |

### Generators Module

| Function | Description |
|----------|-------------|
| `generatePassword()` | Generate passwords with options |
| `generatePhone()` | Generate phone numbers by country |
| `generateEmail()` | Generate email addresses |
| `generateFullAddress()` | Generate complete addresses |
| `generateCard()` | Generate credit card info |
| `formatDate()` | Format dates with patterns |

### String Module

| Function | Description |
|----------|-------------|
| `normalize()` | Normalize null/undefined to string |
| `toSlug()` | Convert to URL-friendly slug |
| `stripHtml()` | Remove HTML tags |
| `escapeRegex()` | Escape regex special chars |
| `formatCurrency()` | Format number as currency |

### File Module

| Function | Description |
|----------|-------------|
| `readCSV()` | Read CSV file to objects |
| `writeCSV()` | Write objects to CSV |
| `validateCSV()` | Validate CSV structure |
| `waitForDownload()` | Wait for file download |

## License

MIT

