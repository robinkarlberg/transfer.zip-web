import "server-only"
import Team from "../models/Team"
import TeamInvite from "../models/TeamInvite"
import User from "../models/User"
import { userHasLiveStripeSubscription } from "../../stripe"
import { purchaseSeats } from "../../teamSeats"
import { logTeamEvent, TEAM_EVENT } from "./teamEvents"
import { sendTeamInviteAccepted, sendTeamSeatCapacityReached } from "../../mail/mail"
import { logError } from "../../errors"
import { ROLES } from "@/lib/roles"

export class InviteRedemptionError extends Error {
  constructor(message, { status = 409, code } = {}) {
    super(message)
    this.name = "InviteRedemptionError"
    this.status = status
    this.code = code
  }
}

// Atomically attach the given user to the team for the given invite. Used by
// both the explicit "Accept invite" button (already-signed-in invitee) and
// the magic-link consume path. The caller must have verified that `user` is
// the correct identity for `invite.email` - we don't re-check that here.
export async function redeemTeamInviteForUser(invite, user) {
  const team = await Team.findById(invite.team)
  if (!team) {
    throw new InviteRedemptionError("Team not found", { status: 404 })
  }

  if (team.users.some(u => u.equals(user._id))) {
    throw new InviteRedemptionError("You are already in this team")
  }
  if (user.team) {
    throw new InviteRedemptionError("You are already a member of another team")
  }
  if (await userHasLiveStripeSubscription(user)) {
    throw new InviteRedemptionError(
      "You have an active subscription. Cancel it before joining a team."
    )
  }

  // Capacity may have been eroded between invite send and accept (Stripe
  // downgrade, a concurrent acceptance, etc). Auto-purchase the seat needed
  // to honor this invite rather than rejecting a user who was legitimately
  // invited.
  let seatsPurchasedOnAccept = 0
  if (team.users.length >= (team.seats || 0)) {
    try {
      seatsPurchasedOnAccept = (team.users.length + 1) - (team.seats || 0)
      await purchaseSeats(team, seatsPurchasedOnAccept)
    } catch (err) {
      logError(err).forRoute("teamInvites.redeemTeamInviteForUser")
      throw new InviteRedemptionError(
        "This team has no available seats. Ask an owner or admin to free up a seat."
      )
    }
  }

  user.team = team._id
  user.role = invite.role
  await user.save()

  team.users.push(user._id)
  await team.save()

  await TeamInvite.deleteOne({ _id: invite._id })

  logTeamEvent({
    team,
    type: TEAM_EVENT.INVITE_ACCEPTED,
    actor: user,
    data: { email: user.email, role: user.role },
  })

  if (seatsPurchasedOnAccept > 0) {
    logTeamEvent({
      team,
      type: TEAM_EVENT.SEAT_PURCHASED,
      data: { count: seatsPurchasedOnAccept, reason: "accept", email: user.email },
    })
  }

  const owner = await User.findOne({ _id: { $in: team.users }, role: ROLES.OWNER })
  if (owner) {
    const manageLink = `${process.env.SITE_URL}/app/admin/members`
    sendTeamInviteAccepted(owner.email, {
      teamName: team.name,
      memberEmail: user.email,
      link: manageLink,
    }).catch(err => logError(err).forRoute("teamInvites.redeemTeamInviteForUser"))

    if (team.users.length >= (team.seats || 0)) {
      sendTeamSeatCapacityReached(owner.email, {
        teamName: team.name,
        seats: team.seats || 0,
        link: manageLink,
      }).catch(err => logError(err).forRoute("teamInvites.redeemTeamInviteForUser"))
    }
  }

  return { team, seatsPurchasedOnAccept }
}
