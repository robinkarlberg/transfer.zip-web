import DashboardProvider, { DashboardContext } from "@/context/DashboardContext";
import QuickShareProgress from "./QuickShareProgress";
import { useServerAuth } from "@/lib/server/wrappers/auth";

export default async function ({ }) {
  const auth = await useServerAuth()

  return (
    <QuickShareProgress isLoggedIn={!!auth} />
  )
}