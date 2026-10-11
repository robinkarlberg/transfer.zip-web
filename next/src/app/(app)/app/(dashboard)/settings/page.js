
import { getTranslations } from "@/lib/server/language"
import { useServerAuth } from "@/lib/server/wrappers/auth";
import SettingsPage from "./SettingsPage";
import GenericPage from "@/components/dashboard/GenericPage";

export default async function () {
  const t = await getTranslations()

  const auth = await useServerAuth()

  const { user } = auth

  const storage = await user.getStorage()
  const team = user.team ? user.team.toJsonAsClient() : null

  return (
    <GenericPage title={t("Account")}>
      <SettingsPage user={user.toJsonAsClient()} storage={storage} team={team} />
    </GenericPage>
  )
}