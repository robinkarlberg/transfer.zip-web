import { getTranslations } from "@/lib/server/language"
import { redirect } from "next/navigation"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { ROLES } from "@/lib/roles"
import TeamPausedPage from "./TeamPausedPage"

export async function generateMetadata() {
  const t = await getTranslations()
  return { title: t("Team paused") }
}

export default async function () {
  const auth = await useServerAuth()
  if (!auth) return redirect("/signin")

  const { user, team } = auth

  if (!team) return redirect("/onboarding")
  if (team.isActive()) return redirect("/app")

  return (
    <TeamPausedPage
      user={user.toJsonAsClient()}
      team={team.toJsonAsClient()}
      isOwner={user.role === ROLES.OWNER}
      previousSeats={team.seats || 0}
    />
  )
}
