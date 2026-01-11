import NewTransferFileUploadNew from "@/components/newtransfer/NewTransferFileUploadNew"
import BrandProfile from "@/lib/server/mongoose/models/BrandProfile"
import { useServerAuth } from "@/lib/server/wrappers/auth"

export default async function ConditionalLandingFileUpload({  }) {
  const auth = await useServerAuth()

  if (!auth || auth.user.getPlan() === "free") {
    return <NewTransferFileUploadNew loaded={true} />
  }

  const [storage, brandProfilesDocs] = await Promise.all([
    auth.user.getStorage(),
    BrandProfile.find({ author: auth.user._id }).sort({ lastUsed: -1 }),
  ])

  const brandProfiles = brandProfilesDocs.map(profile => profile.friendlyObj())

  return (
    <NewTransferFileUploadNew
      loaded={true}
      user={auth.user.friendlyObj()}
      storage={storage}
      brandProfiles={brandProfiles}
    />
  )
}
