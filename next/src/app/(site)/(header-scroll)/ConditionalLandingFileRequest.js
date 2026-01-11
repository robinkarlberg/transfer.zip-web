import NewTransferFileRequest from "@/components/newtransfer/NewTransferFileRequest"
import NewTransferFileUploadNew from "@/components/newtransfer/NewTransferFileUploadNew"
import BrandProfile from "@/lib/server/mongoose/models/BrandProfile"
import { useServerAuth } from "@/lib/server/wrappers/auth"

export default async function ConditionalLandingFileRequest({ }) {
  const auth = await useServerAuth()

  if (!auth || auth.user.getPlan() === "free") {
    return <NewTransferFileRequest loaded={true} />
  }

  const [storage, brandProfilesDocs] = await Promise.all([
    auth.user.getStorage(),
    BrandProfile.find({ author: auth.user._id }).sort({ lastUsed: -1 }),
  ])

  const brandProfiles = brandProfilesDocs.map(profile => profile.friendlyObj())

  return (
    <NewTransferFileRequest
      loaded={true}
      user={auth.user.friendlyObj()}
      storage={storage}
      brandProfiles={brandProfiles}
    />
  )
}
