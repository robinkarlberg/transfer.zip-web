import mongoose from 'mongoose';

const WaitlistEntrySchema = new mongoose.Schema({
    email: { type: String, required: true },
}, { timestamps: true })

export default mongoose.models.WaitlistEntry || mongoose.model("WaitlistEntry", WaitlistEntrySchema)