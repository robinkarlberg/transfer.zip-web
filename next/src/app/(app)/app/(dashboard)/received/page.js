
import { getTranslations } from "@/lib/server/language"
import GenericPage from "@/components/dashboard/GenericPage"
import TransferList from "@/components/dashboard/TransferList"
import EmptySpace from "@/components/elements/EmptySpace"
import { listTransfersForUser } from "@/lib/server/serverUtils"
import { useServerAuth } from "@/lib/server/wrappers/auth"

export default async function () {
  const t = await getTranslations()
  const { user } = await useServerAuth()
  const transfers = await listTransfersForUser(user)
  const receivedTransfers = transfers.filter(transfer => transfer.transferRequest)
  const receivedTransfersJson = await Promise.all(receivedTransfers.map(transfer => transfer.toJsonAsOwner()))

  return (
    <GenericPage title={t("Received")}>
      <TransferList transfers={receivedTransfersJson} emptyFallback={(
        <EmptySpace title={t("Your Received Transfers")} subtitle={t("Received files from transfer requests will appear here.")} />
      )} />
    </GenericPage>
  )
}