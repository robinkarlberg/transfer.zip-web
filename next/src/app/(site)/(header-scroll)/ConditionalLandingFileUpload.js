import { useServerAuth } from "@/lib/server/wrappers/auth"
import LandingQuickShare from "./LandingQuickShare"
import { sleep } from "@/lib/utils"
import NewTransferFileUpload from "@/components/dashboard/NewTransferFileUpload"

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
      <div className="lg:-mt-60">
        <NewTransferFileUpload user={auth.user.friendlyObj()} storage={await auth.user.getStorage()} />
      </div>
      : <LandingQuickShare />
  )
}