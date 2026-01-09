import GenericPage from "@/components/dashboard/GenericPage"
import TransferRequestList from "@/components/dashboard/TransferRequestList"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"
import { useServerAuth } from "@/lib/server/wrappers/auth"

export default async function () {
  const { user } = await useServerAuth()

  const transferRequests = await TransferRequest.find({ author: user._id }).sort({ createdAt: -1 })
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

  return (
    <GenericPage title={"Requests"}>
      <TransferRequestList transferRequests={transferRequestsWithCount} />
    </GenericPage>
  )
}