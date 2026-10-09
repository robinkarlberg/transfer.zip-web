import mongoose from 'mongoose';
import crypto from "crypto"

import BrandProfile from './BrandProfile';
import { getDownloadDomainFor } from '../helpers/customDomains';

// These keys are not protecting anything critical. It is just so that the Transfer password is
// not in plain-text in the database. We also do not want to hash it, as we need to let the user
// reveal it if they forget it.
const PASSWORD_ENC_IV = Buffer.from("K5NeL91lHm+U8QL057Q9EA==", "base64")
const PASSWORD_ENC_KEY = Buffer.from("J3x/R0ju5baxntP/qmu0TzHTwlFBmFLqxIXG/PzksFY=", "base64")

const DownloadStatistic = new mongoose.Schema({
    time: { type: Date, default: () => new Date(), required: true }
}, { _id: false })

const ViewStatistic = new mongoose.Schema({
    time: { type: Date, default: () => new Date(), required: true }
}, { _id: false })

const EmailSharedWith = new mongoose.Schema({
    time: { type: Date, default: () => new Date(), required: true },
    email: String
}, { _id: false })

const File = new mongoose.Schema({
    relativePath: String,
    name: String,
    size: Number,
    type: String
}, { _id: true })

File.methods.toJsonAsClient = function () {
    return {
        id: this._id?.toString(),
        relativePath: this.relativePath,
        name: this.name,
        size: this.size,
        type: this.type
    }
}

const TransferSchema = new mongoose.Schema({
    transferRequest: { type: mongoose.Schema.Types.ObjectId, ref: "TransferRequest", index: true },
    submission: {
        name: String,
        email: String,
        message: String,
    },
    uploadedAt: Date,
    reviewedAt: Date,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    // Set once at creation from author.team if the author is on a team.
    // Never updated - if a user later leaves the team, their existing
    // transfers stay tagged to the team they were created under.
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", index: true },
    name: String,
    description: String,
    expiresAt: { type: Date },
    secretCode: { type: String, default: () => crypto.randomUUID(), required: true, index: true },

    files: { type: [File], default: [] },

    downloads: { type: [DownloadStatistic], default: [] },
    views: { type: [ViewStatistic], default: [] },

    encryptedPassword: Buffer,
    emailsSharedWith: [EmailSharedWith],

    brandProfile: { type: mongoose.Schema.Types.ObjectId, ref: "BrandProfile" },

    encryptionKey: { type: Buffer },
    encryptionIV: { type: Buffer },

    nodeUrl: String,

    finishedUploading: { type: Boolean, default: false },
    lastDownloadEmailSentAt: Date,
}, { timestamps: true })

function encPassword(pass) {
    const cipher = crypto.createCipheriv("aes-256-cbc", PASSWORD_ENC_KEY, PASSWORD_ENC_IV)
    return Buffer.concat([cipher.update(pass, "utf-8"), cipher.final()])
}

function decPassword(pass) {
    const cipher = crypto.createDecipheriv("aes-256-cbc", PASSWORD_ENC_KEY, PASSWORD_ENC_IV)
    return Buffer.concat([cipher.update(pass), cipher.final()]).toString("utf-8")
}

TransferSchema.methods.validatePassword = function (pass) {
    // TODO: validate pass is a string (idk maybe good for security)
    return decPassword(this.encryptedPassword) === pass
}

TransferSchema.methods.hasPassword = function () {
    return !!this.encryptedPassword
}

TransferSchema.methods.setPassword = function (pass) {
    this.encryptedPassword = encPassword(pass)
}

TransferSchema.methods.getPassword = function () {
    return this.hasPassword() ? decPassword(this.encryptedPassword) : null
}

TransferSchema.methods.clearPassword = function () {
    this.encryptedPassword = null
}

// Atomic $push rather than save(): save() re-validates every file subdoc, which takes
// seconds on transfers with tens of thousands of files
TransferSchema.methods.logDownload = function () {
    return this.constructor.updateOne({ _id: this._id }, { $push: { downloads: {} } })
}

TransferSchema.methods.logView = function () {
    return this.constructor.updateOne({ _id: this._id }, { $push: { views: {} } })
}

// store an email address that this transfer will be shared with
TransferSchema.methods.addSharedEmail = function (email) {
    this.emailsSharedWith.push({ email })
}

TransferSchema.methods.registerFile = function (fileInfo) {
    const { relativePath, name, size, type } = fileInfo

    this.files.push({
        relativePath,
        name,
        size,
        type
    })
}

// TODO: Fix this mess
TransferSchema.methods.toJsonAsOwner = async function () {
    const { _id, name, description, expiresAt, secretCode, emailsSharedWith, createdAt, downloads, views, files, size } = this
    return {
        id: _id.toString(),
        name: name || "Untitled Transfer",
        description,
        expiresAt,
        secretCode,
        downloadUrl: await this.getDownloadLink(),
        hasPassword: this.hasPassword(),
        password: this.getPassword(),
        emailsSharedWith: emailsSharedWith.map(entry => ({ time: entry.time, email: entry.email })),
        statistics: {
            downloads: { length: downloads?.length },
            views: { length: views?.length },
        },
        files: this.files.map(file => file.toJsonAsClient()),
        size,
        createdAt,
        uploadedAt: this.uploadedAt || null,
        hasName: !!name,
        hasTransferRequest: !!this.transferRequest,
        transferRequestId: this.transferRequest ? this.transferRequest._id.toString() : null,
        finishedUploading: this.finishedUploading,
        nodeUrl: this.nodeUrl,
        brandProfileId: this.brandProfile ? this.brandProfile.toString() : undefined,
        brandProfile: (this.brandProfile && typeof this.brandProfile.toJsonAsClient === 'function') ? this.brandProfile.toJsonAsClient() : undefined
    }
}

TransferSchema.methods.toJsonAsRequestOwner = function () {
    return {
        id: this._id.toString(),
        secretCode: this.secretCode,
        submission: {
            name: this.submission.name || "",
            email: this.submission.email || "",
            message: this.submission.message || "",
        },
        receivedAt: this.uploadedAt || this.createdAt,
        expiresAt: this.expiresAt || null,
        reviewedAt: this.reviewedAt || null,
        size: this.size,
        files: this.files.map(file => file.toJsonAsClient()),
    }
}

// Variant for team Owner/Admin viewing transfers across the team.
// Omits the plaintext password (we don't want a team admin browsing
// other members' download passwords) but includes author identity so
// the UI can show "uploaded by X". The author must be populated.
TransferSchema.methods.toJsonAsTeamAdmin = async function () {
    const { _id, name, description, expiresAt, secretCode, createdAt, downloads, views, files, size } = this
    return {
        id: _id.toString(),
        name: name || "Untitled Transfer",
        description,
        expiresAt,
        secretCode,
        downloadUrl: await this.getDownloadLink(),
        hasPassword: this.hasPassword(),
        statistics: {
            downloads: { length: downloads?.length },
            views: { length: views?.length },
        },
        files: this.files.map(file => file.toJsonAsClient()),
        size,
        createdAt,
        hasName: !!name,
        hasTransferRequest: !!this.transferRequest,
        finishedUploading: this.finishedUploading,
        nodeUrl: this.nodeUrl,
        author: this.author && typeof this.author === "object" && this.author._id ? {
            id: this.author._id.toString(),
            email: this.author.email,
            fullName: this.author.fullName,
        } : undefined,
    }
}

// TransferSchema.methods.toJsonAsDownloader = function () {
//     const { _id, name, description, expiresAt, secretCode, files, size } = this
//     return {
//         id: _id.toString(),
//         name: name || "Untitled Transfer",
//         description,
//         expiresAt,
//         secretCode,
//         hasPassword: this.hasPassword(),
//         files: this.files.map(file => file.toJsonAsClient()),
//         size,
//         hasName: !!name,
//         finishedUploading: this.finishedUploading,
//         nodeUrl: this.nodeUrl,
//         brandProfileId: this.brandProfile ? this.brandProfile.toString() : undefined
//     }
// }

TransferSchema.methods.getDownloadLink = async function () {
    const customDomain = await getDownloadDomainFor({ team: this.team, user: this.author?._id || this.author })
    if (customDomain) {
        return `https://${customDomain}/${this.secretCode}`
    }
    if (process.env.NEXT_PUBLIC_DL_DOMAIN) {
        return `https://${process.env.NEXT_PUBLIC_DL_DOMAIN}/${this.secretCode}`
    }
    return `${process.env.SITE_URL}/transfer/${this.secretCode}`
}

// Add a virtual field for transfer.size
TransferSchema.virtual('size').get(function () {
    return this.files.reduce((total, file) => total + (file.size || 0), 0)
})

TransferSchema.virtual('authorEmail').get(function () {
    return this.author?.email
})

// Make sure the virtuals are included in JSON outputs
TransferSchema.set('toJSON', { virtuals: true });
TransferSchema.set('toObject', { virtuals: true });

// MONGOOSE DOCUMENTATION KAN SUGA MIN BALLE
// TransferSchema.pre("deleteOne", async function (next) {
//     const transfer = await this.model.findOne(this.getFilter())
//     try {
//         console.log(`Transfer deleteOne: ${transfer._id}`)
//         await controlTransferDelete(transfer.nodeUrl, transfer._id.toString())
//         next()
//     } catch (err) {
//         console.error(`Error deleting transfer: ${transfer._id}`, err);
//         next();
//     }
// });

export default mongoose.models.Transfer || mongoose.model("Transfer", TransferSchema)
