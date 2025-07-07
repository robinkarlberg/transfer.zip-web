import BIcon from "@/components/BIcon"
import GenericPage from "@/components/dashboard/GenericPage"
import Link from "next/link"
import TransfersPage from "./TransfersPage"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"
import { listTransfersForUser } from "@/lib/server/serverUtils"
import TransferSidebar from "./TransferSidebar"
import { isValidObjectId } from "mongoose"
import { redirect } from "next/navigation"
import TransferSidebarWrapper from "./TransferSidebarWrapper"

export default async function ({ params }) {
  const auth = await useServerAuth()
  const transfers = await listTransfersForUser(auth.user)

  const transferRequests = await TransferRequest.find({ author: auth.user._id }).sort({ createdAt: -1 })
  const transferRequestsWithCount = await Promise.all(transferRequests.map(async request => {
    // Count the transfers related to each transferRequest
    const receivedTransfersCount = await Transfer.countDocuments({
      transferRequest: request._id,
      'files.0': { $exists: true }
    });

    return {
      ...request.friendlyObj(),
      receivedTransfersCount
    };
  }));

  const { transferIdSlug } = await params

  let selectedTransfer
  if (transferIdSlug && transferIdSlug.length > 0) {
    const transferId = transferIdSlug[0]
    if (!isValidObjectId(transferId)) {
      redirect("/app")
    }
    selectedTransfer = await Transfer.findOne({ author: auth.user._id, _id: transferId })
  }

  return (
    <GenericPage title={"My Transfers"}>
      <div className="md:hidden flex gap-2 mb-3">
        <Link href="/app/new" className="bg-primary text-white text-sm rounded-lg py-1.5 px-3 shadow hover:bg-primary-light"><BIcon name={"plus-lg"} className={"me-2"} />New Transfer</Link>
      </div>
      <TransfersPage
        transfers={transfers.map(transfer => transfer.friendlyObj())}
        transferRequests={transferRequestsWithCount}
      />
      <TransferSidebarWrapper user={auth.user.friendlyObj()} transfer={selectedTransfer?.friendlyObj()} />
    </GenericPage>
  )
}