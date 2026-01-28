import QuickShareProgress from "./QuickShareProgress";
import { useServerAuth } from "@/lib/server/wrappers/auth";

export default async function ({ }) {
  const auth = await useServerAuth()

  let isPayingUser = false
  if(auth) {
    isPayingUser = auth.user.getPlan() != "free"
  }

  return (
    <QuickShareProgress isLoggedIn={!!auth} isPayingUser={isPayingUser} />
  )
}