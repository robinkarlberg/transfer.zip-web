export const LANGUAGE_COOKIE = "language"
export const LANGUAGE_HEADER = "x-transferzip-language"
export const PATH_HEADER = "x-transferzip-path"
export const LANGUAGES = ["en", "sv"]

export function isLanguage(value) {
  return LANGUAGES.includes(value)
}

export function fixedLanguage(pathname) {
  if (pathname === "/sv" || pathname.startsWith("/sv/")) return "sv"
  if (pathname === "/" || pathname === "/receive" || pathname === "/about-us") return "en"
  return null
}

/** @param {string | null} acceptLanguage */
export function browserLanguage(acceptLanguage) {
  const languages = (acceptLanguage || "").split(",").map(entry => {
    const [tag, quality = "q=1"] = entry.trim().split(";")
    return { language: tag.toLowerCase().split("-")[0], quality: Number(quality.split("=")[1]) }
  })
  return languages.filter(entry => isLanguage(entry.language) && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality)[0]?.language || "en"
}

export function localizedLink(href, language) {
  const url = new URL(href, "https://transfer.zip")
  url.searchParams.set("lang", language)
  return href.startsWith("/") ? `${url.pathname}${url.search}${url.hash}` : url.toString()
}

export const languageCookieOptions = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
}
