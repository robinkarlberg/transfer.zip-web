import mongoose from 'mongoose';
import crypto from "crypto"

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

File.methods.friendlyObj = function () {
    return {
        id: this._id?.toString(),
        relativePath: this.relativePath,
        name: this.name,
        size: this.size,
        type: this.type
    }
}

const TransferSchema = new mongoose.Schema({
    transferRequest: { type: mongoose.Schema.Types.ObjectId, ref: "TransferRequest" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    name: String,
    description: String,
    expiresAt: { type: Date },
    secretCode: { type: String, default: () => crypto.randomUUID(), required: true, index: true },

    files: { type: [File], default: [] },

    downloads: { type: [DownloadStatistic], default: [] },
    views: { type: [ViewStatistic], default: [] },

    encryptedPassword: Buffer,
    emailsSharedWith: [EmailSharedWith],

    encryptionKey: { type: Buffer },
    encryptionIV: { type: Buffer },

    storageLocation: String, // deprecated, still used for a few transfers (maybe migrate?)
    nodeUrl: String,

    finishedUploading: { type: Boolean, default: false },
    lastDownloadEmailSentAt: Date
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

TransferSchema.methods.logDownload = function (count = 1) {
    for (let i = 0; i < count; i++) {
        this.downloads.push({})
    }
}

TransferSchema.methods.logView = function (count = 1) {
    for (let i = 0; i < count; i++) {
        this.views.push({})
    }
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

TransferSchema.methods.friendlyObj = function () {
    const { _id, name, description, expiresAt, secretCode, emailsSharedWith, createdAt, downloads, views, files, size } = this
    return {
        id: _id.toString(),
        name: name || "Untitled Transfer",
        description,
        expiresAt,
        secretCode,
        hasPassword: this.hasPassword(),
        password: this.getPassword(),
        emailsSharedWith: emailsSharedWith.map(entry => ({ time: entry.time, email: entry.email })),
        statistics: {
            downloads: { length: downloads?.length },
            views: { length: views?.length },
        },
        files: this.files.map(file => file.friendlyObj()),
        size,
        createdAt,
        hasName: !!name,
        hasTransferRequest: !!this.transferRequest,
        finishedUploading: this.finishedUploading,
        nodeUrl: this.nodeUrl
    }
}

TransferSchema.methods.downloadObj = function () {
    const { _id, name, description, expiresAt, secretCode, files, size } = this
    return {
        id: _id.toString(),
        name: name || "Untitled Transfer",
        description,
        expiresAt,
        secretCode,
        hasPassword: this.hasPassword(),
        files: this.files.map(file => file.friendlyObj()),
        size,
        hasName: !!name,
        finishedUploading: this.finishedUploading,
        nodeUrl: this.nodeUrl
    }
}

TransferSchema.methods.getDownloadLink = function () {
    return `${process.env.SITE_URL}/transfer/${this.secretCode}`
}

// Add a virtual field for transfer.size
TransferSchema.virtual('size').get(function () {
    return this.files.reduce((total, file) => total + (file.size || 0), 0)
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