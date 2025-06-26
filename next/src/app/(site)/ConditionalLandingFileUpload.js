import { useServerAuth } from "@/lib/server/wrappers/auth"
import NewTransferFileUpload from "../(app)/app/transfers/(new)/new/NewTransferFileUpload"
import LandingQuickShare from "./LandingQuickShare"
import { sleep } from "@/lib/utils"

export default async function () {

  let auth
  try {
    auth = await useServerAuth()
  }
  catch (err) {
    // cookie is removed or token not present
  }

  return (
    auth ?
      <div className="lg:-mt-52">
        <NewTransferFileUpload variant={"compact"} user={auth.user.friendlyObj()} storage={await auth.user.getStorage()} />
      </div>
      : <LandingQuickShare />
  )
}