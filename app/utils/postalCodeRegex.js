/**
 * POSTAL CODE REGEX BY COUNTRY
 *
 * ⚠️ CRITICAL INSTRUCTIONS FOR CLAUDE CODE (AI Assistant):
 *
 * 1. ALWAYS clean postal codes from Google Places formatted_address before saving to database
 * 2. ALWAYS use cleanPostalCode() function when processing addresses from Google Places API
 * 3. If a user reports postal codes appearing in addresses, check this file first
 *
 * 4. IF A COUNTRY IS MISSING:
 *    a) Research the postal code format: Google "{country} postal code format"
 *    b) Find real examples from the country's postal service website
 *    c) Create regex pattern: ^{pattern}\s+ (matches at start of string)
 *    d) Test with multiple real addresses
 *    e) Add to POSTAL_CODE_REGEX object below with comment showing examples
 *
 * 5. FORMAT RULES:
 *    - Pattern must match postal code at the START of address: ^pattern\s+
 *    - Must include \s+ to match the space after postal code
 *    - Use appropriate quantifiers: {4} for exact length, + for one or more
 *    - Include optional parts with ? when needed (e.g., -[A-Z]?)
 *
 * 6. TESTING:
 *    - Always test with real Google Places API responses
 *    - Verify it only removes postal code, not city names
 *    - Check edge cases (cities that start with numbers, etc.)
 *
 * Example workflow:
 * User: "Addresses in Spain show postal codes"
 * Claude: 1) Research Spain format → "28001 Madrid" (5 digits)
 *         2) Create regex → /^\d{5}\s+/
 *         3) Test with examples
 *         4) Add: ES: /^\d{5}\s+/,  // Spain: 5 digits (ej: 28001)
 */

export const POSTAL_CODE_REGEX = {
  // Argentina: 1 letter + 4 digits (ej: B1872, C1234)
  AR: /^[A-Z]\d{4}\s+/,

  // México: 5 digits (ej: 01000, 12345)
  MX: /^\d{5}\s+/,

  // Bolivia: 4 digits (ej: 0200, 1234)
  BO: /^\d{4}\s+/,

  // Colombia: 6 digits (ej: 110111, 050001)
  CO: /^\d{6}\s+/,

  // Chile: 7 digits (ej: 1234567)
  CL: /^\d{7}\s+/,

  // Perú: 5 digits or CITY + 2 digits (ej: 15001, LIMA 01)
  PE: /^([A-Z]+\s+\d{2}|\d{5})\s+/,

  // Ecuador: 6 digits (ej: 170150)
  EC: /^\d{6}\s+/,

  // Venezuela: 4 digits + optional letter (ej: 1010, 1010-A)
  VE: /^\d{4}(-[A-Z])?\s+/,

  // Uruguay: 5 digits (ej: 11000)
  UY: /^\d{5}\s+/,

  // Paraguay: 4 digits (ej: 1209)
  PY: /^\d{4}\s+/,

  // Brasil: 8 digits with hyphen (ej: 01310-100)
  BR: /^\d{5}-?\d{3}\s+/,

  // Costa Rica: 5 digits (ej: 10101)
  CR: /^\d{5}\s+/,

  // Panamá: 4 digits (ej: 0801)
  PA: /^\d{4}\s+/,

  // Guatemala: 5 digits (ej: 01001)
  GT: /^\d{5}\s+/,

  // Honduras: 5 digits (ej: 11101)
  HN: /^\d{5}\s+/,

  // El Salvador: 4 digits (ej: 1101)
  SV: /^\d{4}\s+/,

  // Nicaragua: 5 digits (ej: 10000)
  NI: /^\d{5}\s+/,

  // República Dominicana: 5 digits (ej: 10100)
  DO: /^\d{5}\s+/,

  // Cuba: 5 digits (ej: 10100)
  CU: /^\d{5}\s+/,

  // Puerto Rico: 5 digits (US format) (ej: 00901)
  PR: /^\d{5}\s+/,
};

/**
 * Clean postal code from formatted address
 * @param {string} formattedAddress - Google Places formatted_address
 * @param {string} countryCode - ISO country code (2 letters)
 * @returns {string} - Cleaned address without postal code
 */
export function cleanPostalCode(formattedAddress, countryCode) {
  const regex = POSTAL_CODE_REGEX[countryCode];

  if (!regex) {
    console.warn(`No postal code regex defined for country: ${countryCode}`);
    return formattedAddress;
  }

  return formattedAddress.replace(regex, '');
}
