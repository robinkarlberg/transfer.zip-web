// ----------------------------------------------
// 1) European countries & territories (complete)
// ----------------------------------------------
export const EUROPE = new Set([
  // Sovereign states
  'AD', 'AL', 'AT', 'BA', 'BE', 'BG', 'BY', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
  'FR', 'GB', 'GR', 'HR', 'HU', 'IE', 'IS', 'IT', 'LI', 'LT', 'LU', 'LV', 'MC', 'MD', 'ME',
  'MK', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'RS', 'RU', 'SE', 'SI', 'SK', 'SM', 'UA', 'VA',
  // States with European territory
  'AM', 'AZ', 'GE', 'TR', 'KZ',
  // Small territories generally treated as Europe
  'FO', 'GI', 'GG', 'IM', 'JE', 'SJ', 'XK'
]);

// -------------------------------------------------
// 2) Countries we treat as “US” (nearest Americas)
// -------------------------------------------------
export const AMERICAS = new Set([
  'US', 'CA', 'MX', 'GL',
  'BM', 'PM', 'KY', 'BS', 'VG', 'BQ', 'CW', 'MF', 'SX', 'AI', 'BB', 'GD', 'VC', 'KN', 'LC',
  'TT', 'TC', 'JM', 'HT', 'PR', 'DO', 'CU',
  'BZ', 'CR', 'SV', 'GT', 'HN', 'NI', 'PA',
  'AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'FK', 'GF', 'GY',
  'PE', 'PY', 'SR', 'UY', 'VE'
]);

// ----------------------------------------------
// 3) Asian countries & territories (complete)
// ----------------------------------------------
export const ASIA = new Set([
  'AF', 'BH', 'BD', 'BT', 'BN', 'KH', 'CN', 'HK', 'MO', 'IN', 'ID', 'IR', 'IQ', 'IL', 'JP',
  'JO', 'KW', 'KG', 'LA', 'LB', 'MY', 'MV', 'MN', 'MM', 'NP', 'KP', 'OM', 'PK', 'PH', 'QA',
  'SA', 'SG', 'KR', 'LK', 'SY', 'TW', 'TJ', 'TH', 'TL', 'TM', 'AE', 'UZ', 'VN', 'YE'
]);

// -------------------------------------------------
// Helper: ISO country → "EU" | "US" | "OTHER"
// -------------------------------------------------
export function toLargeRegion(iso2) {
  if (EUROPE.has(iso2)) return 'EU';
  if (AMERICAS.has(iso2)) return 'US';
  if (ASIA.has(iso2)) return 'EU'; // change to 'AS' later if needed
  return 'EU';
}
