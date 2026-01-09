import GenericPage from "@/components/dashboard/GenericPage"
import TransferList from "@/components/dashboard/TransferList"
import { listTransfersForUser } from "@/lib/server/serverUtils"
import { useServerAuth } from "@/lib/server/wrappers/auth"

export default async function () {
  const { user } = await useServerAuth()
  const transfers = await listTransfersForUser(user)

  // const sentTransfers = transfers.filter(transfer => !transfer.hasTransferRequest)
  const receivedTransfers = transfers.filter(transfer => transfer.hasTransferRequest)

  return (
    <GenericPage title={"Received"}>
      <TransferList transfers={receivedTransfers.map(transfer => transfer.friendlyObj())} />
    </GenericPage>
  )
}