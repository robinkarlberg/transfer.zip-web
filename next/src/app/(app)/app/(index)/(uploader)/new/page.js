import { useServerAuth } from "@/lib/server/wrappers/auth";
import NewTransferFileUpload from "../../../../../../components/dashboard/NewTransferFileUpload";
import BrandProfile from "@/lib/server/mongoose/models/BrandProfile";

import "./bg.css"

export default async function () {
  const { user } = await useServerAuth()
  const storage = await user.getStorage()
  const brandProfiles = await BrandProfile.find({ author: user._id }).sort({ lastUsed: -1 })
  return (
    <div className="min-h-screen flex flex-col items-stretch bg-white new-transfer-background">
      <div className="">
        {/* <h1 className="text-3xl sm:text-6xl font-bold tracking-tight text-center mt-8 sm:mt-12 mb-8">New Transfer</h1> */}
        <div className="mx-auto max-w-xl mb-4 sm:mb-16 px-4">
          <h1 className={`text-center text-4xl sm:text-6xl font-bold mt-8 sm:mt-12 tracking-tight text-gray-800`}>
            New Transfer
          </h1>
          <p className="text-center text-gray-500 mt-4 text-base sm:text-xl">
            Easily send your files, or request others to send files to you. 
          </p>
        </div>
        <NewTransferFileUpload user={user.friendlyObj()} storage={storage} brandProfiles={brandProfiles.map(profile => profile.friendlyObj())} />
      </div>
    </div>
  )
}