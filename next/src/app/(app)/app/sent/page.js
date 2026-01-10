import GenericPage from "@/components/dashboard/GenericPage"
import TransferList from "@/components/dashboard/TransferList"
import { listTransfersForUser } from "@/lib/server/serverUtils"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import DefaultLayout from "../_old_(index)/layout"

export default async function ({ children }) {
  const { user } = await useServerAuth()
  const transfers = await listTransfersForUser(user)

  const sentTransfers = transfers.filter(transfer => !transfer.transferRequest)
  // const receivedTransfers = transfers.filter(transfer => transfer.hasTransferRequest)

  return (
    <GenericPage title={"Sent"}>
      <TransferList transfers={sentTransfers.map(transfer => transfer.friendlyObj())} />
      {children}
    </GenericPage>
  )
}