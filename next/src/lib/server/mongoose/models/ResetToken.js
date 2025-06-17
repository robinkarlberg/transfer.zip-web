import mongoose from "mongoose"

const ResetTokenSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '15m' } // TTL index to expire after 15 minutes
});

export default mongoose.models.ResetToken || mongoose.model('ResetToken', ResetTokenSchema);
