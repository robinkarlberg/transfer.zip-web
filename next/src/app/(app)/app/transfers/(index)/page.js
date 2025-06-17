import BIcon from "@/components/BIcon"
import GenericPage from "@/components/dashboard/GenericPage"
import Link from "next/link"
import TransfersPage from "./TransfersPage"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"

export default async function ({ }) {
  const auth = await useServerAuth()
  const transfers = await Transfer.find({ author: auth.user._id })
  const transferRequests = await TransferRequest.find({ author: auth.user._id })

  return (
    <GenericPage title={"Transfers"}>
      <div className="md:hidden flex gap-2 mb-3">
        <Link href="new" className="bg-primary text-white text-sm rounded-lg py-1.5 px-3 shadow hover:bg-primary-light"><BIcon name={"plus-lg"} className={"me-2"} />New Transfer</Link>
      </div>
      <TransfersPage
        transfers={transfers.map(transfer => transfer.friendlyObj())}
        transferRequests={transferRequests.map(tr => tr.friendlyObj())}
      />
    </GenericPage>
  )
}