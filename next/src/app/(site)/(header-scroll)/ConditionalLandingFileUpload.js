import { useServerAuth } from "@/lib/server/wrappers/auth"
import LandingQuickShare from "./LandingQuickShare"
import LandingTransferCarousel from "./LandingTransferCarousel"
import BrandProfile from "@/lib/server/mongoose/models/BrandProfile"

export default async function () {

  let auth
  try {
    auth = await useServerAuth()
  }
  catch (err) {
    // cookie is removed or token not present
  }

  let brandProfiles = auth
    ? await BrandProfile.find({ author: auth.user._id }).sort({ lastUsed: -1 })
    : undefined

  return (
    auth && auth.user.getPlan() != "free" ?
      <LandingTransferCarousel user={auth.user.friendlyObj()} storage={await auth.user.getStorage()} brandProfiles={brandProfiles.map(profile => profile.friendlyObj())} />
      : <LandingQuickShare />
  )
}