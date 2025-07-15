import GenericPage from "@/components/dashboard/GenericPage";
import Stats from "./Stats";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import Transfer from "@/lib/server/mongoose/models/Transfer";
import TransferList from "@/components/dashboard/TransferList";
import { listTransfersForUser } from "@/lib/server/serverUtils";

export default async function ({ }) {
  let auth = await useServerAuth();

  const _user = auth.user.friendlyObj()

  const transfers = await listTransfersForUser(auth.user)

  const { storagePercent } = await auth.user.getStorage()

  return (
    <GenericPage title={"Overview"}>
      <div className="mb-4">
        {/* <h3 className="text-base font-semibold leading-6 text-gray-900">Statistics</h3> */}
        <Stats user={_user} transfers={transfers.map(transfer => transfer.friendlyObj())} storagePercent={storagePercent} />
      </div>
      <h3 className="font-semibold mb-1 text-gray-500">Recent</h3>
      <TransferList transfers={transfers.slice(0, 5).map(transfer => transfer.friendlyObj())} />
    </GenericPage>
  )
}