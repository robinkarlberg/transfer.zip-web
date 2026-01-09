import BrandProfile from "@/lib/server/mongoose/models/BrandProfile";
import { useServerAuth } from "@/lib/server/wrappers/auth";

import NewTransferFileRequest from "@/components/newtransfer/NewTransferFileRequest";

export default async function () {
  const { user } = await useServerAuth()
  const storage = await user.getStorage()
  const brandProfiles = await BrandProfile.find({ author: user._id }).sort({ lastUsed: -1 })
  return (
    <div className="mb-16">
      <div className="mx-auto max-w-xl mb-4 sm:mb-16 px-4">
        <h1 className="mx-auto text-center max-w-2xl text-4xl font-bold tracking-tight text-white mb-20">
          Let's{" "}
          <span className="relative">
            <span className="relative z-10">receive</span>
            <svg
              className="absolute left-0 bottom-[0.08em] w-full text-primary-100"
              style={{ height: "0.15em" }}
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 15 C 20 22, 40 5, 60 12 S 90 18, 98 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ vectorEffect: "non-scaling-stroke" }}
              />
            </svg>
          </span>
          {" "}some files.
        </h1>
      </div>
      <div className="flex">
        <NewTransferFileRequest isDashboard={true} loaded={true} user={user.friendlyObj()} storage={storage} brandProfiles={brandProfiles.map(x => x.friendlyObj())} />
      </div>
    </div>
  )
}