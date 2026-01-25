import mongoose from 'mongoose';
import crypto from "crypto"

import WaitlistEntry from './WaitlistEntry';
import Transfer from './Transfer';
import { getMaxStorageForPlan } from "../../serverUtils";
import TransferRequest from './TransferRequest';
import { listTransfersForUser } from '../../serverUtils';
import { IS_SELFHOST } from '@/lib/isSelfHosted';
import { ROLES } from '@/lib/roles';
import { isValidPlanId, hasFeature as planHasFeature, getLimit as planGetLimit, FEATURE, LIMIT } from '@/lib/pricing';

import Team from './Team';

const NotificationSettingsSchema = new mongoose.Schema({
    transferDownloaded: { type: Boolean, default: true },
    transferReceived: { type: Boolean, default: true },
    expiryWarnings: { type: Boolean, default: true },
}, { _id: false })

NotificationSettingsSchema.methods.friendlyObj = function () {
    return {
        transferDownloaded: this.transferDownloaded,
        transferReceived: this.transferReceived,
        // expiryWarnings: this.expiryWarnings
    }
}

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^([a-z0-9]+\-?[a-z0-9])+$/, 'is invalid. Only lowercase characters and numbers are allowed, with dashes (-) in between.'],
        minlength: [3, 'is too short. Minimum length is 3 characters.'],
        maxlength: [36, 'is too long. Maximum length is 36 characters.'],
        index: true,
        default: () => crypto.randomUUID(),
        unique: true
    },
    email: { type: String, lowercase: true, trim: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid.'], index: true, unique: true },

    googleId: String,

    // Password hash n salt
    hash: { type: String },
    salt: String,

    stripe_customer_id: String,

    // TODO: Fix plan shit into an object instead
    plan: { type: String, default: "free" },
    planValidUntil: { type: Date },
    planStatus: { type: String, default: "inactive" },
    planCancelling: { type: Boolean, default: false },
    planInterval: { type: String, default: "month" },
    usedFreeTrial: { type: Boolean, default: false },

    // verified: { type: Boolean, default: false },
    // onboarded: { type: Boolean, default: false },

    customMaxStorageBytes: { type: Number },

    // Custom overrides for features and limits (for enterprise/special accounts)
    customFeatures: {
        [FEATURE.CUSTOM_BRANDING]: { type: Boolean },
        [FEATURE.CUSTOM_DOMAIN]: { type: Boolean },
    },
    customLimits: {
        [LIMIT.MAX_EXPIRY_DAYS]: { type: Number },
        [LIMIT.STORAGE]: { type: Number },
    },

    notificationSettings: { type: NotificationSettingsSchema, default: {} },

    role: { type: String, enum: Object.values(ROLES), default: ROLES.OWNER },

    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },

}, { timestamps: true })

function hashFunc(pass, salt) {
    return crypto.pbkdf2Sync(pass, salt, 10000, 512, "sha512").toString('hex');
}

UserSchema.methods.validatePassword = function (pass) {
    if (!this.hash || !this.salt) return false
    // TODO: validate pass is a string (idk maybe good for security)
    return this.hash === hashFunc(pass, this.salt)
}

UserSchema.methods.friendlyObj = function () {
    return {
        id: this._id.toString(),
        email: this.email,
        plan: this.getPlan(),
        verified: this.verified,
        planValidUntil: this.planValidUntil,
        planCancelling: this.planCancelling,
        planInterval: this.planInterval,
        isTrial: this.planStatus == "trialing",
        onboarded: this.onboarded,
        notificationSettings: this.notificationSettings.friendlyObj(),
        hasPassword: this.hasPassword
    }
}

UserSchema.methods.setPassword = function (pass) {
    this.salt = crypto.randomBytes(32)
    this.hash = hashFunc(pass, this.salt)
}

UserSchema.methods.getPlan = function () {
    if(this.team) {
        return this.team.getPlan()
    }
    if (this.planStatus == "active" || this.planStatus == "trialing") {
        return this.plan
    }
    else return "free"
}

UserSchema.methods.hasFeature = function (feature) {
    // Delegate to team if user is part of one
    if (this.team && typeof this.team.hasFeature === 'function') {
        return this.team.hasFeature(feature)
    }
    // Check custom override first
    if (this.customFeatures && this.customFeatures[feature] !== undefined) {
        return this.customFeatures[feature]
    }
    return planHasFeature(this.getPlan(), feature)
}

UserSchema.methods.getLimit = function (limitKey) {
    // Delegate to team if user is part of one
    if (this.team && typeof this.team.getLimit === 'function') {
        return this.team.getLimit(limitKey)
    }
    // Check custom override first
    if (this.customLimits && this.customLimits[limitKey] !== undefined) {
        return this.customLimits[limitKey]
    }
    return planGetLimit(this.getPlan(), limitKey)
}

UserSchema.methods.updateSubscription = function ({ plan, status, validUntil, cancelling, interval }) {
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
        if (this.planStatus == "trialing") {
            this.usedFreeTrial = true
        }
    }

    if (cancelling !== undefined) {
        this.planCancelling = cancelling;
    }

    if(interval !== undefined) {
        this.planInterval = interval
    }
}
// If user is in waitlist and user is less than 30 days old, it has early offer
UserSchema.methods.hasEarlyOffer = async function () {
    // const cutoffDate = new Date(Date.UTC(2025, 1, 1));
    // if (this.createdAt >= cutoffDate) return false;

    const emailInWaitlistEntry = await WaitlistEntry.findOne({ email: this.email })
    if (emailInWaitlistEntry) {
        return new Date() - new Date(this.createdAt) < 30 * 24 * 60 * 60 * 1000;
    }
    else return false
}

UserSchema.methods.getTransfersThisMonth = async function () {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    end.setDate(1);
    end.setHours(0, 0, 0, 0);

    const transfers = await Transfer.find({ author: this._id, createdAt: { $gte: start, $lt: end } });
    return transfers.length;
}

UserSchema.methods.getStorage = async function () {
    const transfers = await listTransfersForUser(this)

    const usedStorageBytes = transfers.reduce((total, transfer) => total + transfer.size, 0)
    const maxStorageBytes = this.customMaxStorageBytes || (
        IS_SELFHOST ?
            10e12   // 10TB for good measure
            : getMaxStorageForPlan(this.getPlan())
    )

    const storagePercent = Math.floor((usedStorageBytes / maxStorageBytes) * 100)

    return {
        usedStorageBytes,
        maxStorageBytes,
        storagePercent,
        availableStorageBytes: maxStorageBytes - usedStorageBytes
    }
}

UserSchema.virtual("hasTeam").get(function () {
    return !!this.team;
});

UserSchema.virtual("verified").get(function () {
    return true;
});

UserSchema.virtual("hasPassword").get(function () {
    return !!this.hash
});

UserSchema.virtual("onboarded").get(function () {
    return this.getPlan() !== "free";
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export default mongoose.models.User || mongoose.model("User", UserSchema)