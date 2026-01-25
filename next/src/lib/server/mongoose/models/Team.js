import mongoose from 'mongoose';
import { isValidPlanId, hasFeature as planHasFeature, getLimit as planGetLimit, FEATURE, LIMIT } from '@/lib/pricing';

import User from './User';

const TeamSchema = new mongoose.Schema({
  users: { type: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }] },
  name: { type: String },

  // TODO: Fix plan shit into an object instead
  plan: { type: String, default: "free" },
  planValidUntil: { type: Date },
  planStatus: { type: String, default: "inactive" },
  planCancelling: { type: Boolean, default: false },
  planInterval: { type: String, default: "month" },

  stripe_customer_id: String,

  // Custom overrides for features and limits (for enterprise/special accounts)
  customFeatures: {
    [FEATURE.CUSTOM_BRANDING]: { type: Boolean },
    [FEATURE.CUSTOM_DOMAIN]: { type: Boolean },
  },
  customLimits: {
    [LIMIT.MAX_EXPIRY_DAYS]: { type: Number },
    [LIMIT.STORAGE]: { type: Number },
  },

  // Pending owner, so we can add this user to the team when the subscription starts
  pendingOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

}, { timestamps: true });

TeamSchema.methods.getPlan = function () {
    if (this.planStatus == "active") {
        return this.plan
    }
    else return "free"
}

TeamSchema.methods.hasFeature = function (feature) {
    // Check custom override first
    if (this.customFeatures && this.customFeatures[feature] !== undefined) {
        return this.customFeatures[feature]
    }
    return planHasFeature(this.getPlan(), feature)
}

TeamSchema.methods.getLimit = function (limitKey) {
    // Check custom override first
    if (this.customLimits && this.customLimits[limitKey] !== undefined) {
        return this.customLimits[limitKey]
    }
    return planGetLimit(this.getPlan(), limitKey)
}

TeamSchema.methods.updateSubscription = function ({ plan, status, validUntil, cancelling, interval }) {
    if (plan !== undefined) {
        if (!isValidPlanId(plan)) {
            throw new Error("plan " + plan + " is invalid!");
        }
        this.plan = plan;
    }

    if (validUntil !== undefined) {
        this.planValidUntil = new Date(validUntil * 1000);
    }

    if (status !== undefined) {
        this.planStatus = status;
    }

    if (cancelling !== undefined) {
        this.planCancelling = cancelling;
    }

    if (interval !== undefined) {
        this.planInterval = interval
    }
}

TeamSchema.methods.friendlyObj = function () {
  return {
    name: this.name
  }
}

export default mongoose.models.Team || mongoose.model("Team", TeamSchema)