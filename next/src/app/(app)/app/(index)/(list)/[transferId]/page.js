import { useServerAuth } from "@/lib/server/wrappers/auth"
import TransferSidebar from "./TransferSidebar"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import { redirect } from "next/navigation"

export default async function ({ params }) {
  const { transferId } = await params

  const auth = await useServerAuth()

  const transfer = await Transfer.findOne({ author: auth.user._id, _id: transferId })
  if (!transfer) {
    return redirect('/app/transfers')
  }

  return (
    <TransferSidebar
      key={transferId}
      user={auth.user.friendlyObj()}
      transfer={transfer.friendlyObj()}
    />
  )
}