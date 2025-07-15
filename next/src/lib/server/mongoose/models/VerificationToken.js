import mongoose from "mongoose"

const VerificationTokenSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '30d' } // TTL index to expire after 30 days
});

export default mongoose.models.VerificationToken || mongoose.model('VerificationToken', VerificationTokenSchema);