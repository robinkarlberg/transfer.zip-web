import GenericPage from "@/components/dashboard/GenericPage";
import Stats from "./Stats";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import Transfer from "@/lib/server/mongoose/models/Transfer";
import { getMaxStorageForPlan } from "@/lib/utils";

export default async function ({ }) {
  let auth = await useServerAuth();

  const _user = auth.user.friendlyObj()

  const transfers = await Transfer.find({ author: auth.user._id })

  const usedStorageBytes = transfers.reduce((total, transfer) => total + transfer.size, 0)
  const maxStorageBytes = getMaxStorageForPlan(auth.user.getPlan())

  const storagePercent = Math.floor((usedStorageBytes / maxStorageBytes)) * 100

  return (
    <GenericPage title={"Overview"}>
      <div className="mb-4">
        {/* <h3 className="text-base font-semibold leading-6 text-gray-900">Statistics</h3> */}
        <Stats user={_user} transfers={transfers.map(transfer => transfer.friendlyObj())} storagePercent={storagePercent} />
      </div>
      <h3 className="font-semibold mb-1 text-gray-500">Recent</h3>
      {/* <TransferList transfers={recentTransfers} /> */}
    </GenericPage>
  )
}