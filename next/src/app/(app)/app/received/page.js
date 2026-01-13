import GenericPage from "@/components/dashboard/GenericPage"
import TransferList from "@/components/dashboard/TransferList"
import EmptySpace from "@/components/elements/EmptySpace"
import { listTransfersForUser } from "@/lib/server/serverUtils"
import { useServerAuth } from "@/lib/server/wrappers/auth"

export default async function () {
  const { user } = await useServerAuth()
  const transfers = await listTransfersForUser(user)
  // const sentTransfers = transfers.filter(transfer => !transfer.hasTransferRequest)
  const receivedTransfers = transfers.filter(transfer => transfer.transferRequest)

  return (
    <GenericPage title={"Received"}>
      <TransferList transfers={receivedTransfers.map(transfer => transfer.friendlyObj())} emptyFallback={(
        <EmptySpace title={"Your Received Transfers"} subtitle={"Received files from transfer requests will appear here."} />
      )} />
    </GenericPage>
  )
}