import moment from "moment-timezone"

/**
 * Get the user's country based on their time zone.
 * @param {string} userTimeZone - The user's time zone.
 * @returns {string} The user's country or the original time zone if not found.
 */
function getCountryByTimeZone(userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  // Get a list of countries from moment-timezone
  const countries = moment.tz.countries();

  // Iterate through the countries and check if the time zone is associated with any country
  for (const country of countries) {
      const timeZones = moment.tz.zonesForCountry(country);

      if (timeZones.includes(userTimeZone)) {
          // Use Intl.DisplayNames to get the full country name
          // const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(country);
          return country;
      }
  }

  // Return the original time zone if no matching country is found
  return null;
}

/**
 * Check if the user's time zone is within an EU country.
 * @returns {boolean} True if the user is in the EU, false otherwise.
 */
export function isInEU() {
  const euCountries = [
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
      'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
      'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'EU'
  ];

  const country = getCountryByTimeZone();
  return euCountries.includes(country);
}

export function getLuminance(color) {
  // Remove the hash if present
  color = color.replace(/^#/, '');

  // Parse r, g, b values
  let r = parseInt(color.substring(0, 2), 16) / 255;
  let g = parseInt(color.substring(2, 4), 16) / 255;
  let b = parseInt(color.substring(4, 6), 16) / 255;

  // Apply sRGB gamma correction
  r = (r <= 0.03928) ? r / 12.92 : Math.pow(((r + 0.055) / 1.055), 2.4);
  g = (g <= 0.03928) ? g / 12.92 : Math.pow(((g + 0.055) / 1.055), 2.4);
  b = (b <= 0.03928) ? b / 12.92 : Math.pow(((b + 0.055) / 1.055), 2.4);

  // Calculate luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}