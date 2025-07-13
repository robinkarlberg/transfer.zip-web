import mongoose from "mongoose"
import "./User"

const BrandProfileSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  name: { type: String, required: true },
  iconUrl: { type: String },
  backgroundUrl: { type: String },
  domain: { type: String },
  lastUsed: { type: Date }
}, { timestamps: true })

BrandProfileSchema.methods.friendlyObj = function () {
  return {
    name: this.name,
    iconUrl: this.iconUrl,
    backgroundUrl: this.backgroundUrl,
    lastUsed: this.lastUsed
    // TODO: custom domains
    // domain: this.domain
  }
}

export default mongoose.models.BrandProfile || mongoose.model("BrandProfile", BrandProfileSchema)