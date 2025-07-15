import DashboardProvider, { DashboardContext } from "@/context/DashboardContext";
import QuickShareProgress from "./QuickShareProgress";
import { useServerAuth } from "@/lib/server/wrappers/auth";

export default async function ({ }) {

  let auth
  try {
    auth = await useServerAuth()
  }
  catch (err) { /* Its ok, just checkin' */ }

  return (
    <QuickShareProgress isLoggedIn={!!auth} />
  )
}