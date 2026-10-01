export const LANDING_LANGUAGE_HEADER = "x-transferzip-language"

export const LANDING_PATHS = { en: "/", sv: "/sv" }
export const RECEIVE_PATHS = { en: "/receive", sv: "/sv/ta-emot" }

export function getLandingLanguage(pathname) {
  return pathname === LANDING_PATHS.sv || pathname.startsWith(`${LANDING_PATHS.sv}/`) ? "sv" : "en"
}

export const LANDING_ALTERNATES = {
  en: LANDING_PATHS.en,
  sv: LANDING_PATHS.sv,
  "x-default": LANDING_PATHS.en,
}

export const RECEIVE_ALTERNATES = {
  ...RECEIVE_PATHS,
  "x-default": RECEIVE_PATHS.en,
}
