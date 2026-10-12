export const LANDING_LANGUAGE_HEADER = "x-transferzip-language"

export const LANDING_PATHS = { en: "/", sv: "/sv" }
export const RECEIVE_PATHS = { en: "/receive", sv: "/sv/ta-emot" }
export const ABOUT_PATHS = { en: "/about-us", sv: "/sv/om-oss" }
export const QUICK_PATHS = { en: "/quick", sv: "/sv/snabb" }

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

export const ABOUT_ALTERNATES = {
  ...ABOUT_PATHS,
  "x-default": ABOUT_PATHS.en,
}

export const QUICK_ALTERNATES = {
  ...QUICK_PATHS,
  "x-default": QUICK_PATHS.en,
}

