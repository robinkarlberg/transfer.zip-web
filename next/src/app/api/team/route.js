import { getTranslations } from "@/lib/server/language"
import { NextResponse } from "next/server"
import dbConnect from "@/lib/server/mongoose/db"
import Team from "@/lib/server/mongoose/models/Team"
import { useTeamAdminAuth } from "@/lib/server/wrappers/teamAdminAuth"
import { resp } from "@/lib/server/serverUtils"
import { logTeamEvent, TEAM_EVENT } from "@/lib/server/mongoose/helpers/teamEvents"

const NAME_MIN = 1
const NAME_MAX = 60

export async function PUT(req) {
  await dbConnect()
  const admin = await useTeamAdminAuth()
  if (!admin) return NextResponse.json(resp("Forbidden"), { status: 403 })

  const body = await req.json().catch(() => ({}))
  const name = typeof body.name === "string" ? body.name.trim() : null

  if (name === null) {
    return NextResponse.json(resp("name is required"), { status: 400 })
  }
  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    const t = await getTranslations()
    return NextResponse.json(resp(t("Team name must be {min}-{max} characters", { min: NAME_MIN, max: NAME_MAX })), { status: 400 })
  }

  const team = await Team.findById(admin.team._id)
  if (!team) return NextResponse.json(resp("Team not found"), { status: 404 })

  const previousName = team.name
  if (previousName === name) {
    return NextResponse.json(resp({ team: team.toJsonAsClient() }))
  }

  team.name = name
  await team.save()

  logTeamEvent({
    team,
    type: TEAM_EVENT.TEAM_RENAMED,
    actor: admin.user,
    data: { from: previousName, to: name },
  })

  return NextResponse.json(resp({ team: team.toJsonAsClient() }))
}
