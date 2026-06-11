import mongoose from "mongoose"

export const TEAM_EVENT = {
    INVITE_SENT: "invite_sent",
    INVITE_REVOKED: "invite_revoked",
    INVITE_ACCEPTED: "invite_accepted",
    MEMBER_REMOVED: "member_removed",
    ROLE_CHANGED: "role_changed",
    SEAT_PURCHASED: "seat_purchased",
    SEAT_REDUCED: "seat_reduced",
    TRANSFER_CREATED: "transfer_created",
    TRANSFER_DELETED: "transfer_deleted",
    TRANSFER_REQUEST_ACTIVATED: "transfer_request_activated",
    TRANSFER_REQUEST_DEACTIVATED: "transfer_request_deactivated",
    TRANSFER_REQUEST_DELETED: "transfer_request_deleted",
    TEAM_RENAMED: "team_renamed",
}

const TeamEventSchema = new mongoose.Schema({
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    type: { type: String, enum: Object.values(TEAM_EVENT), required: true },
    // Who triggered the event. Optional because some events (Stripe webhook
    // promoting the pending owner, etc.) aren't initiated by a user action.
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Free-form payload - what's interesting differs per event type
    // (e.g. invited email, target user id, transfer id, role values).
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true })

// 90-day TTL - this is an in-app activity feed, not an audit log.
TeamEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 })

TeamEventSchema.methods.toJsonAsClient = function () {
    return {
        id: this._id.toString(),
        type: this.type,
        data: this.data || {},
        actor: this.actor && typeof this.actor === "object" && this.actor._id ? {
            id: this.actor._id.toString(),
            email: this.actor.email,
            fullName: this.actor.fullName,
        } : undefined,
        createdAt: this.createdAt,
    }
}

export default mongoose.models.TeamEvent || mongoose.model("TeamEvent", TeamEventSchema)
