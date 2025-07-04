import mongoose from 'mongoose';
import crypto from "crypto"

const EmailSharedWith = new mongoose.Schema({
    time: { type: Date, default: () => new Date(), required: true },
    email: String
}, { _id: false })

const TransferRequestSchema = new mongoose.Schema({
    active: { type: Boolean, default: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    name: String,
    description: String,
    secretCode: { type: String, default: () => crypto.randomUUID(), required: true, index: true },

    emailsSharedWith: [EmailSharedWith]
}, { timestamps: true })

// store an email address that this request was shared with
TransferRequestSchema.methods.addSharedEmail = function (email) {
    this.emailsSharedWith.push({ email })
}

TransferRequestSchema.methods.friendlyObj = function () {
    const { _id, active, name, description, secretCode, emailsSharedWith, createdAt } = this
    return {
        id: _id.toString(),
        active,
        name: name || "Untitled Request",
        description,
        secretCode,
        emailsSharedWith,
        createdAt,
        hasName: !!name,
    }
}

TransferRequestSchema.methods.uploadObj = function () {
    const { _id, name, description, secretCode } = this
    return {
        id: _id,
        name: name || "Untitled Request",
        description,
        secretCode,
        hasName: !!name,
    }
}

TransferRequestSchema.methods.getUploadLink = function () {
    return `${process.env.SITE_URL}/upload/${this.secretCode}`
}

export default mongoose.models.TransferRequest || mongoose.model("TransferRequest", TransferRequestSchema)