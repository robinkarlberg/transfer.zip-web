import { useServerAuth } from "@/lib/server/wrappers/auth";
import SettingsPage from "./SettingsPage";
import GenericPage from "@/components/dashboard/GenericPage";

export default async function () {

  const auth = await useServerAuth()

  const { user } = auth

  return (
    <GenericPage title={"Settings"}>
      <SettingsPage user={user.friendlyObj()} />
    </GenericPage>
  )
}