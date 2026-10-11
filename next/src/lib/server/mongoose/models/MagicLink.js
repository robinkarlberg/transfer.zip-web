import mongoose from "mongoose"
import crypto from "crypto"

const MagicLinkSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Secret token in the email URL; only the device that opens the email knows it.
    token: { type: String, required: true, index: true },
    // 6-digit verification code shown on the magic-link page when it's opened on
    // a different browser than the one that requested the link. The user reads
    // this off their phone and types it into the original browser to complete
    // sign-in on the original device.
    code: { type: String, required: true },
    // Cookie value placed on the requesting browser so we can recognize it
    // later. Same-browser clicks (cookie matches) auto-log-in. Cross-device
    // clicks (cookie absent/mismatched) trigger the code flow.
    requestSecret: { type: String, required: true, index: true },
    language: { type: String, enum: ["en", "sv"], default: "en" },
    opened: { type: Boolean, default: false },
    openedSameBrowser: { type: Boolean, default: false },
    consumed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: '15m' } // TTL index to expire after 15 minutes
});

MagicLinkSchema.statics.generateCode = function () {
    // 6 random digits, zero-padded. crypto.randomInt is uniform.
    return crypto.randomInt(0, 1000000).toString().padStart(6, "0")
}

export default mongoose.models.MagicLink || mongoose.model('MagicLink', MagicLinkSchema);
