import { useServerAuth } from "@/lib/server/wrappers/auth";
import NewTransferFileUpload from "../../../../../../components/dashboard/NewTransferFileUpload";
import BrandProfile from "@/lib/server/mongoose/models/BrandProfile";

export default async function () {
  const { user } = await useServerAuth()
  const storage = await user.getStorage()
  const brandProfiles = await BrandProfile.find({ author: user._id }).sort({ lastUsed: -1 })
  return (
    <div className="min-h-screen flex flex-col items-stretch bg-gray-50">
      <div className="">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center mt-8 sm:mt-12 mb-8">New Transfer</h1>
        <NewTransferFileUpload user={user.friendlyObj()} storage={storage} brandProfiles={brandProfiles.map(profile => profile.friendlyObj())} />
      </div>
    </div>
  )
}