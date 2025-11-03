import mongoose from 'mongoose';

import "./User"

const SentEmailSchema = new mongoose.Schema({
    userEmail: { type: String, required: true, index: true },
    to: { type: [String], required: true },
    createdAt: { type: Date, default: Date.now, expires: "1d" }    // expire after 1d
})

export default mongoose.models.SentEmail || mongoose.model("SentEmail", SentEmailSchema)