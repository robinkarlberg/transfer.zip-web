import GenericPage from "@/components/dashboard/GenericPage"
import TransferRequestList from "@/components/dashboard/TransferRequestList"
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"
import { enrichTransferRequests, INACTIVE_PAGE_SIZE } from "@/lib/server/mongoose/helpers/transferRequests"
import { useServerAuth } from "@/lib/server/wrappers/auth"

export default async function () {
  const { user } = await useServerAuth()

  // Active links are always rendered in full - there shouldn't be many.
  // Inactive links can be huge over time, so we paginate them.
  const [activeDocs, inactiveFirstPageDocs] = await Promise.all([
    TransferRequest.find({ author: user._id, active: true }).sort({ createdAt: -1 }),
    TransferRequest.find({ author: user._id, active: false }).sort({ createdAt: -1 }).limit(INACTIVE_PAGE_SIZE + 1),
  ])

  const hasMoreInactive = inactiveFirstPageDocs.length > INACTIVE_PAGE_SIZE
  const inactiveSlice = hasMoreInactive ? inactiveFirstPageDocs.slice(0, INACTIVE_PAGE_SIZE) : inactiveFirstPageDocs

  const [activeRequests, initialInactiveRequests] = await Promise.all([
    enrichTransferRequests(activeDocs),
    enrichTransferRequests(inactiveSlice),
  ])

  return (
    <GenericPage title={"Requests"}>
      <TransferRequestList
        activeRequests={activeRequests}
        initialInactiveRequests={initialInactiveRequests}
        hasMoreInactive={hasMoreInactive}
      />
    </GenericPage>
  )
}
