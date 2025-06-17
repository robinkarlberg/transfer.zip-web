import mongoose from 'mongoose';
import crypto from "crypto"

const SessionSchema = new mongoose.Schema({
    token: { type: String, default: () => crypto.randomUUID(), required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }
}, { timestamps: true })

export default mongoose.models.Session || mongoose.model("Session", SessionSchema)