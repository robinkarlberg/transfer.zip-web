import { getTranslations } from "@/lib/server/language"
import { redirect } from "next/navigation"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { FEATURE } from "@/lib/pricing"
import OnboardingProPage from "./OnboardingProPage"

export async function generateMetadata() {
  const t = await getTranslations()
  return { title: t("Welcome to Transfer.zip") }
}

export default async function () {
  const auth = await useServerAuth()
  if (!auth) return redirect("/signin")

  const { user } = auth

  if (user.getPlan() === "free") return redirect("/onboarding")
  if (user.hasTeam) return redirect("/app")
  if (user.onboarded !== false) return redirect("/app")

  return (
    <OnboardingProPage
      user={user.toJsonAsClient()}
      canBrand={user.hasFeature(FEATURE.CUSTOM_BRANDING)}
    />
  )
}
