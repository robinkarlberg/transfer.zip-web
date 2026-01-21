import mongoose from 'mongoose';

import User from './User';

const TeamSchema = new mongoose.Schema({
  users: { type: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }] },
  name: { type: String, required: true },

  // TODO: Fix plan shit into an object instead
  plan: { type: String, default: "free" },
  planValidUntil: { type: Date },
  planStatus: { type: String, default: "inactive" },
  planCancelling: { type: Boolean, default: false },
  planInterval: { type: String, default: "month" },

  

}, { timestamps: true });

TeamSchema.methods.friendlyObj = function () {
  return {
    name: this.name
  }
}

export default mongoose.models.Team || mongoose.model("Team", TeamSchema)