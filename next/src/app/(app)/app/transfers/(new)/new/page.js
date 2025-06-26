import { useServerAuth } from "@/lib/server/wrappers/auth";
import NewTransferFileUpload from "./NewTransferFileUpload";

export default async function () {
  const { user } = await useServerAuth()
  const storage = await user.getStorage()
  return (
    <div className="min-h-screen flex flex-col items-stretch sm:bg-gray-50 rounded-4xl">
      <div className="">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center mt-4 mb-2 sm:mt-12 sm:mb-8">New Transfer</h1>
        <NewTransferFileUpload user={user.friendlyObj()} storage={storage} />
      </div>
    </div>
  )
}