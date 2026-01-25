import mongoose from "mongoose"
import { ROLES } from "@/lib/roles"

const TeamInviteSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true, index: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, lowercase: true, trim: true, required: true, index: true },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.MEMBER },
  token: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now, expires: "7d" }
})

TeamInviteSchema.methods.friendlyObj = function () {
  return {
    id: this._id.toString(),
    email: this.email,
    role: this.role,
    createdAt: this.createdAt
  }
}

export default mongoose.models.TeamInvite || mongoose.model("TeamInvite", TeamInviteSchema)
