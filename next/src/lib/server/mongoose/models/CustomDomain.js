import mongoose from "mongoose"

import "./User"
import "./Team"

const CustomDomainSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", index: true },

  // Lowercased FQDN, e.g. "files.acme.com". Globally unique - if a
  // second account tries to claim the same domain we surface a
  // "this domain is already in use" error at the API layer.
  domain: { type: String, required: true, unique: true, lowercase: true, trim: true },

  // True once we've confirmed the domain's DNS resolves to our server.
  // Set by the periodic/on-demand DNS check; the Caddy `ask` endpoint
  // only returns 2xx when this is true.
  verified: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  // Last time we ran a DNS check, regardless of outcome. Used to
  // throttle verification attempts.
  lastCheckedAt: { type: Date },
}, { timestamps: true })

CustomDomainSchema.methods.toJsonAsClient = function () {
  return {
    id: this._id.toString(),
    domain: this.domain,
    verified: this.verified,
    verifiedAt: this.verifiedAt,
    createdAt: this.createdAt,
  }
}

export default mongoose.models.CustomDomain || mongoose.model("CustomDomain", CustomDomainSchema)
