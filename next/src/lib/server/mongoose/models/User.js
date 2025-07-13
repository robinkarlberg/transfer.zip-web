import mongoose from 'mongoose';
import crypto from "crypto"

import WaitlistEntry from './WaitlistEntry';
import Transfer from './Transfer';
import { getMaxStorageForPlan } from "../../serverUtils";
import TransferRequest from './TransferRequest';
import { listTransfersForUser } from '../../serverUtils';
import { IS_SELFHOST } from '@/lib/isSelfHosted';

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

    // verified: { type: Boolean, default: false },
    // onboarded: { type: Boolean, default: false },

    customMaxStorageBytes: { type: Number },

    notificationSettings: { type: NotificationSettingsSchema, default: {} },

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
        isTrial: this.planStatus == "trialing",
        onboarded: this.onboarded,
        notificationSettings: this.notificationSettings.friendlyObj()
    }
}

UserSchema.methods.setPassword = function (pass) {
    this.salt = crypto.randomBytes(32)
    this.hash = hashFunc(pass, this.salt)
}

UserSchema.methods.getPlan = function () {
    if (this.planStatus == "active" || this.planStatus == "trialing") {
        return this.plan
    }
    else return "free"
}

UserSchema.methods.updateSubscription = function ({ plan, status, validUntil, cancelling }) {
    if (plan !== undefined) {
        if (!(plan == "free" || plan == "starter" || plan == "pro")) {
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

UserSchema.virtual("verified").get(function () {
    return true;
});

UserSchema.virtual("onboarded").get(function () {
    return this.getPlan() !== "free";
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export default mongoose.models.User || mongoose.model("User", UserSchema)