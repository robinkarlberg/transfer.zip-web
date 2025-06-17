import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema({
    lightUrl: String,
    darkUrl: String,
    campaignHTML: String,
    validFrom: { type: Date }
}, { })

CampaignSchema.methods.friendlyObj = function () {
    const { lightUrl, darkUrl, campaignHTML } = this
    return {
        lightUrl,
        darkUrl,
        campaignHTML
    }
}

export default mongoose.models.Campaign || mongoose.model("Campaign", CampaignSchema)