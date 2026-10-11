import { getTranslations } from "@/lib/server/language"
import { redirect } from "next/navigation"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import TeamInvite from "@/lib/server/mongoose/models/TeamInvite"
import { ROLES } from "@/lib/roles"
import OnboardingTeamPage from "./OnboardingTeamPage"

export async function generateMetadata() {
  const t = await getTranslations()
  return { title: t("Set up your team") }
}

export default async function () {
  const auth = await useServerAuth()
  if (!auth) return redirect("/signin")

  const { user, team } = auth

  if (!team || user.role !== ROLES.OWNER) return redirect("/app")
  if (team.onboarded) return redirect("/app/admin")

  const pendingInviteCount = await TeamInvite.countDocuments({ team: team._id })
  const memberCount = team.users.length
  const availableSeats = Math.max(0, (team.seats || 0) - memberCount - pendingInviteCount)

  return (
    <OnboardingTeamPage
      team={team.toJsonAsClient()}
      availableSeats={availableSeats}
    />
  )
}
