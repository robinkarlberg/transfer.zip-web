
import { getTranslations } from "@/lib/server/language"
import GenericPage from "@/components/dashboard/GenericPage"
import TransferList from "@/components/dashboard/TransferList"
import { listTransfersForUser } from "@/lib/server/serverUtils"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import EmptySpace from "@/components/elements/EmptySpace"

export default async function ({ children }) {
  const t = await getTranslations()
  const { user } = await useServerAuth()
  const transfers = await listTransfersForUser(user)
  const sentTransfers = transfers.filter(transfer => !transfer.transferRequest)
  const sentTransfersJson = await Promise.all(sentTransfers.map(transfer => transfer.toJsonAsOwner()))

  return (
    <GenericPage title={t("Sent")}>
      <TransferList transfers={sentTransfersJson} emptyFallback={(
        <EmptySpace title={t("Your Sent Transfers")} subtitle={t("Transfers you have sent will appear here. Go ahead and send some files!")} />
      )} />
      {children}
    </GenericPage>
  )
}