import { useServerAuth } from "@/lib/server/wrappers/auth"
import TransferSidebar from "./TransferSidebar"
import Transfer from "@/lib/server/mongoose/models/Transfer"

export default async function ({ params }) {
  const { transferId } = await params

  const auth = await useServerAuth()

  const transfer = await Transfer.findOne({ author: auth.user._id, _id: transferId })

  return (
    // <div></div>
    <TransferSidebar user={auth.user.friendlyObj()} transfer={transfer.friendlyObj()}/>
  )
}