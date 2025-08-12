import mongoose from 'mongoose';

import User from './User';

const ErrorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    identifier: { type: String, required: true },
    url: String,
    platform: Object,
    error: Object,
    meta: Object,
}, { timestamps: true });

ErrorSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });     // expires after 30 days

export default mongoose.models.Error || mongoose.model("Error", ErrorSchema)