/**
 * Address generator utilities
 */

import type { AddressOptions, Address } from '../types';
import { randomInt, randomElement, randomBoolean } from './random';

// Street names
const STREET_NAMES = [
  'Main', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Washington', 'Lake',
  'Hill', 'Park', 'River', 'Forest', 'Spring', 'Valley', 'Sunset', 'Highland',
  'Broadway', 'Market', 'Church', 'School', 'Mill', 'Center', 'Union', 'Liberty',
];

const STREET_TYPES = [
  'Street', 'Avenue', 'Boulevard', 'Drive', 'Lane', 'Road', 'Way', 'Court',
  'Place', 'Circle', 'Trail', 'Parkway', 'Terrace', 'Loop',
];

const DIRECTIONS = ['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW'];

// Cities by country
const CITIES: Record<string, string[]> = {
  US: [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
    'Fort Worth', 'Columbus', 'San Francisco', 'Charlotte', 'Indianapolis',
    'Seattle', 'Denver', 'Boston', 'Portland', 'Miami', 'Atlanta', 'Nashville',
  ],
  CA: [
    'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa',
    'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria',
    'Halifax', 'Oshawa', 'Windsor', 'Saskatoon', 'Regina', 'Barrie',
  ],
  UK: [
    'London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds',
    'Sheffield', 'Edinburgh', 'Bristol', 'Leicester', 'Coventry', 'Bradford',
    'Cardiff', 'Belfast', 'Nottingham', 'Newcastle', 'Southampton', 'Brighton',
  ],
};

// States/Provinces
const STATES: Record<string, Array<{ name: string; abbr: string }>> = {
  US: [
    { name: 'Alabama', abbr: 'AL' }, { name: 'Alaska', abbr: 'AK' },
    { name: 'Arizona', abbr: 'AZ' }, { name: 'Arkansas', abbr: 'AR' },
    { name: 'California', abbr: 'CA' }, { name: 'Colorado', abbr: 'CO' },
    { name: 'Connecticut', abbr: 'CT' }, { name: 'Delaware', abbr: 'DE' },
    { name: 'Florida', abbr: 'FL' }, { name: 'Georgia', abbr: 'GA' },
    { name: 'Hawaii', abbr: 'HI' }, { name: 'Idaho', abbr: 'ID' },
    { name: 'Illinois', abbr: 'IL' }, { name: 'Indiana', abbr: 'IN' },
    { name: 'Iowa', abbr: 'IA' }, { name: 'Kansas', abbr: 'KS' },
    { name: 'Kentucky', abbr: 'KY' }, { name: 'Louisiana', abbr: 'LA' },
    { name: 'Maine', abbr: 'ME' }, { name: 'Maryland', abbr: 'MD' },
    { name: 'Massachusetts', abbr: 'MA' }, { name: 'Michigan', abbr: 'MI' },
    { name: 'Minnesota', abbr: 'MN' }, { name: 'Mississippi', abbr: 'MS' },
    { name: 'Missouri', abbr: 'MO' }, { name: 'Montana', abbr: 'MT' },
    { name: 'Nebraska', abbr: 'NE' }, { name: 'Nevada', abbr: 'NV' },
    { name: 'New Hampshire', abbr: 'NH' }, { name: 'New Jersey', abbr: 'NJ' },
    { name: 'New Mexico', abbr: 'NM' }, { name: 'New York', abbr: 'NY' },
    { name: 'North Carolina', abbr: 'NC' }, { name: 'North Dakota', abbr: 'ND' },
    { name: 'Ohio', abbr: 'OH' }, { name: 'Oklahoma', abbr: 'OK' },
    { name: 'Oregon', abbr: 'OR' }, { name: 'Pennsylvania', abbr: 'PA' },
    { name: 'Rhode Island', abbr: 'RI' }, { name: 'South Carolina', abbr: 'SC' },
    { name: 'South Dakota', abbr: 'SD' }, { name: 'Tennessee', abbr: 'TN' },
    { name: 'Texas', abbr: 'TX' }, { name: 'Utah', abbr: 'UT' },
    { name: 'Vermont', abbr: 'VT' }, { name: 'Virginia', abbr: 'VA' },
    { name: 'Washington', abbr: 'WA' }, { name: 'West Virginia', abbr: 'WV' },
    { name: 'Wisconsin', abbr: 'WI' }, { name: 'Wyoming', abbr: 'WY' },
  ],
  CA: [
    { name: 'Alberta', abbr: 'AB' }, { name: 'British Columbia', abbr: 'BC' },
    { name: 'Manitoba', abbr: 'MB' }, { name: 'New Brunswick', abbr: 'NB' },
    { name: 'Newfoundland and Labrador', abbr: 'NL' }, { name: 'Nova Scotia', abbr: 'NS' },
    { name: 'Ontario', abbr: 'ON' }, { name: 'Prince Edward Island', abbr: 'PE' },
    { name: 'Quebec', abbr: 'QC' }, { name: 'Saskatchewan', abbr: 'SK' },
  ],
  UK: [
    { name: 'England', abbr: 'ENG' }, { name: 'Scotland', abbr: 'SCT' },
    { name: 'Wales', abbr: 'WLS' }, { name: 'Northern Ireland', abbr: 'NIR' },
  ],
};

/**
 * Generate a street address
 */
export function generateStreetAddress(options: AddressOptions = {}): string {
  const { includeApt = false } = options;

  const streetNumber = randomInt(1, 9999);
  const streetName = randomElement(STREET_NAMES);
  const streetType = randomElement(STREET_TYPES);

  // Optionally add direction prefix
  const direction = randomBoolean(0.3) ? `${randomElement(DIRECTIONS)} ` : '';

  let address = `${streetNumber} ${direction}${streetName} ${streetType}`;

  if (includeApt) {
    const aptTypes = ['Apt', 'Suite', 'Unit', '#'];
    const aptNumber = randomBoolean() 
      ? randomInt(1, 999).toString() 
      : `${String.fromCharCode(65 + randomInt(0, 25))}${randomInt(1, 99)}`;
    address += `, ${randomElement(aptTypes)} ${aptNumber}`;
  }

  return address;
}

/**
 * Generate a city name
 */
export function generateCity(country: string = 'US'): string {
  const countryUpper = country.toUpperCase();
  const cities = CITIES[countryUpper] || CITIES['US'];
  return randomElement(cities);
}

/**
 * Generate a state/province
 * @param abbreviation - Return abbreviation instead of full name
 */
export function generateState(country: string = 'US', abbreviation: boolean = true): string {
  const countryUpper = country.toUpperCase();
  const states = STATES[countryUpper] || STATES['US'];
  const state = randomElement(states);
  return abbreviation ? state.abbr : state.name;
}

/**
 * Generate a postal code
 */
export function generatePostalCode(country: string = 'US', extended: boolean = false): string {
  const countryUpper = country.toUpperCase();

  switch (countryUpper) {
    case 'US':
      // US ZIP code: 5 digits, optionally +4
      const zip = randomInt(10000, 99999).toString();
      if (extended) {
        return `${zip}-${randomInt(1000, 9999)}`;
      }
      return zip;

    case 'CA':
      // Canadian postal code: A1A 1A1
      const letters = 'ABCEGHJKLMNPRSTVXY'; // Valid first letters
      const allLetters = 'ABCEGHJKLMNPRSTVWXYZ';
      return [
        letters.charAt(randomInt(0, letters.length - 1)),
        randomInt(0, 9),
        allLetters.charAt(randomInt(0, allLetters.length - 1)),
        ' ',
        randomInt(0, 9),
        allLetters.charAt(randomInt(0, allLetters.length - 1)),
        randomInt(0, 9),
      ].join('');

    case 'UK':
      // UK postcode: AA9A 9AA format (simplified)
      const area = String.fromCharCode(65 + randomInt(0, 25)) + 
                   String.fromCharCode(65 + randomInt(0, 25));
      const district = randomInt(1, 99).toString();
      const sector = randomInt(0, 9).toString();
      const unit = String.fromCharCode(65 + randomInt(0, 25)) + 
                   String.fromCharCode(65 + randomInt(0, 25));
      return `${area}${district} ${sector}${unit}`;

    default:
      return randomInt(10000, 99999).toString();
  }
}

/**
 * Generate a full address
 */
export function generateFullAddress(options: AddressOptions = {}): Address {
  const { country = 'US', includeApt = false } = options;
  const countryUpper = country.toUpperCase() as 'US' | 'CA' | 'UK';

  const address: Address = {
    street: generateStreetAddress({ country: countryUpper, includeApt }),
    city: generateCity(countryUpper),
    state: generateState(countryUpper),
    postalCode: generatePostalCode(countryUpper),
    country: countryUpper,
  };

  if (includeApt) {
    // Extract apt from street if it was generated
    const aptMatch = address.street.match(/, (Apt|Suite|Unit|#) (.+)$/);
    if (aptMatch) {
      address.apt = `${aptMatch[1]} ${aptMatch[2]}`;
      address.street = address.street.replace(/, (Apt|Suite|Unit|#) .+$/, '');
    }
  }

  return address;
}

/**
 * Format an address as a string
 */
export function formatAddress(address: Address, multiline: boolean = false): string {
  const separator = multiline ? '\n' : ', ';
  const parts = [address.street];

  if (address.apt) {
    parts[0] += `, ${address.apt}`;
  }

  parts.push(`${address.city}, ${address.state} ${address.postalCode}`);

  if (address.country && address.country !== 'US') {
    parts.push(address.country);
  }

  return parts.join(separator);
}

/**
 * Generate a PO Box address
 */
export function generatePOBox(_country: string = 'US'): string {
  const boxNumber = randomInt(1, 99999);
  return `PO Box ${boxNumber}`;
}

