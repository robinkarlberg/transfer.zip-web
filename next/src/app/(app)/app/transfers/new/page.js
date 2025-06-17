import { useServerAuth } from "@/lib/server/wrappers/auth";
import NewTransferPage from "./NewTransferPage";

export default async function () {
  const { user } = await useServerAuth()
  const storage = await user.getStorage()
  return <NewTransferPage user={user.friendlyObj()} storage={storage} />
}