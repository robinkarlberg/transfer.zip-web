import { useServerAuth } from "@/lib/server/wrappers/auth";
import NewTransferFileUpload from "../../../../../../components/dashboard/NewTransferFileUpload";

export default async function () {
  const { user } = await useServerAuth()
  const storage = await user.getStorage()
  return (
    <div className="min-h-screen flex flex-col items-stretch sm:bg-gray-50 rounded-4xl">
      <div className="">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center mt-8 sm:mt-12 mb-8">New Transfer</h1>
        <NewTransferFileUpload user={user.friendlyObj()} storage={storage} />
      </div>
    </div>
  )
}