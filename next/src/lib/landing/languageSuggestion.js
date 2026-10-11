export const LANGUAGE_SUGGESTION_COOKIE = "language-suggestion-dismissed"

/** @param {readonly string[]} languages */
export function shouldSuggestSwedish(languages, region, dismissed) {
  const preferredLanguage = languages
    .map(language => language.toLowerCase().split("-")[0])
    .find(language => language === "sv" || language === "en")

  return !dismissed && (preferredLanguage === "sv" || region === "SE")
}
