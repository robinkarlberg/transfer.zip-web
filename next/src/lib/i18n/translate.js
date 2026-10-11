import { swedishMessages } from "./sv"

export function getTranslator(language) {
  /** @param {Record<string, string | number>} values */
  return (message, values = {}) => {
    const translated = language === "sv" && Object.hasOwn(swedishMessages, message) ? swedishMessages[message] : message
    return translated.replace(/\{(\w+)\}/g, (match, key) => values[key] === undefined ? match : String(values[key]))
  }
}
