import { useServerAuth } from "@/lib/server/wrappers/auth"
import LandingQuickShare from "./LandingQuickShare"
import LandingTransferCarousel from "./LandingTransferCarousel"

export default async function () {

  let auth
  try {
    auth = await useServerAuth()
  }
  catch (err) {
    // cookie is removed or token not present
  }

  return (
    auth && auth.user.getPlan() != "free" ?
      <LandingTransferCarousel user={auth.user.friendlyObj()} storage={await auth.user.getStorage()}/>
      : <LandingQuickShare />
  )
}