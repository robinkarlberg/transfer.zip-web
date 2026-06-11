import "server-only"
import TeamEvent, { TEAM_EVENT } from "../models/TeamEvent"
import { logError } from "../../errors"

export { TEAM_EVENT }

// Fire-and-forget - a failure to record an activity event must never
// break the request that triggered it. Errors go to the logger.
export function logTeamEvent({ team, type, actor, data }) {
    if (!team) return
    TeamEvent.create({
        team: team._id || team,
        type,
        actor: actor ? (actor._id || actor) : undefined,
        data: data || {},
    }).catch(err => {
        logError(err).forRoute("teamEvents.logTeamEvent")
    })
}
