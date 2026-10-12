import { isLanguage } from "@/lib/i18n/language"
import { setLanguageCookie } from "@/lib/server/completeSignIn"
import User from "@/lib/server/mongoose/models/User";
import { resp } from "@/lib/server/serverUtils";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";

export async function PUT(req) {
  const auth = await useServerAuth()
  if (!auth) {
    return NextResponse.json(resp("Unauthorized"), { status: 401 })
  }

  const { notificationSettings, fullName, language } = await req.json()

  if (language !== undefined && !isLanguage(language)) {
    return NextResponse.json(resp("Unsupported language"), { status: 400 })
  }
  const $set = {}
  if (language !== undefined) $set.language = language
  const $unset = {}

  if (notificationSettings) {
    const allowedFields = ["transferViewed", "transferDownloaded", "transferReceived", "expiryWarnings"]
    for (const field of allowedFields) {
      if (notificationSettings[field] !== undefined) {
        $set[`notificationSettings.${field}`] = notificationSettings[field]
      }
    }
  }

  if (typeof fullName === "string") {
    const trimmed = fullName.trim()
    if (trimmed.length > 80) {
      return NextResponse.json(resp("Name is too long"), { status: 400 })
    }
    if (trimmed.length === 0) {
      $unset.fullName = 1
    } else {
      $set.fullName = trimmed
    }
  }

  const op = {}
  if (Object.keys($set).length > 0) op.$set = $set
  if (Object.keys($unset).length > 0) op.$unset = $unset

  if (Object.keys(op).length > 0) {
    await User.updateOne({ _id: auth.user._id }, op)
  }

  const response = NextResponse.json(resp({}))
  if (language !== undefined) setLanguageCookie(response, language)
  return response
}
