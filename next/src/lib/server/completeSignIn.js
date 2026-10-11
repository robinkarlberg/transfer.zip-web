import User from "./mongoose/models/User"
import { LANGUAGE_COOKIE, languageCookieOptions } from "@/lib/i18n/language"

/** @param {import("./mongoose/models/User").default} user */
export async function completeSignIn(user, language) {
  const firstSignIn = await User.updateOne(
    { _id: user._id, registrationPending: true },
    { $unset: { registrationPending: 1 } }
  )
  if (!user.language) {
    user.language = language
    await User.updateOne({ _id: user._id }, { $set: { language } })
  }
  return { language: user.language, authEvent: firstSignIn.modifiedCount ? "Account created" : "Sign-in completed" }
}

/** @param {import("next/server").NextResponse} response */
export function setLanguageCookie(response, language) {
  response.cookies.set(LANGUAGE_COOKIE, language, languageCookieOptions)
}
