import crypto from "crypto"
import mongoose from "mongoose"

import { normalizeEmail } from "@/lib/utils"

// Write-only tombstone for accounts that the user (or an admin acting for the
// user) has hard-deleted. We store a SHA-256 of the normalized email rather
// than the email itself so the tombstone cannot be re-identified - the point
// is to recognize a re-used mailbox for fraud/abuse signals, not to keep PII
// around. Normalization happens first so that +aliases and gmail dot tricks
// don't let a banned user slip past.
const DeletedAccountSchema = new mongoose.Schema({
    emailHash: { type: String, required: true, index: true },
    deletedAt: { type: Date, default: Date.now, required: true }
})

DeletedAccountSchema.statics.hashEmail = function (email) {
    return crypto.createHash("sha256").update(normalizeEmail(email)).digest("hex")
}

DeletedAccountSchema.statics.existsForEmail = async function (email) {
    return !!(await this.exists({ emailHash: this.hashEmail(email) }))
}

export default mongoose.models.DeletedAccount || mongoose.model("DeletedAccount", DeletedAccountSchema)
