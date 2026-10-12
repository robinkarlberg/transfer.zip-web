import mongoose from "mongoose"

const EmailJobSchema = new mongoose.Schema({
  _id: String,
  message: {
    from: String,
    to: String,
    subject: String,
    html: String,
  },
  transfer: { type: mongoose.Schema.Types.ObjectId, ref: "Transfer" },
  quotaEmail: String,
  state: { type: String, enum: ["pending", "sent", "failed", "cancelled"], default: "pending" },
  attempts: { type: Number, default: 0 },
  nextAttemptAt: { type: Date, default: Date.now },
  firstAttemptAt: Date,
  lease: String,
  lockedUntil: Date,
  sentAt: Date,
  lastError: String,
  expiresAt: Date,
}, { timestamps: true })

EmailJobSchema.index({ state: 1, nextAttemptAt: 1, lockedUntil: 1 })
EmailJobSchema.index({ quotaEmail: 1, firstAttemptAt: 1 })
EmailJobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.EmailJob || mongoose.model("EmailJob", EmailJobSchema)
