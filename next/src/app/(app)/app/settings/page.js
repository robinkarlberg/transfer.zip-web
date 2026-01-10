import { useServerAuth } from "@/lib/server/wrappers/auth";
import SettingsPage from "./SettingsPage";
import GenericPage from "@/components/dashboard/GenericPage";

export default async function () {

  const auth = await useServerAuth()

  const { user } = auth

  const storage = await user.getStorage()

  return (
    <GenericPage title={"Account"}>
      <SettingsPage user={user.friendlyObj()} storage={storage} />
    </GenericPage>
  )
}