import { useServerAuth } from "@/lib/server/wrappers/auth"
import { Suspense } from "react"

export async function Conditional({ auth, noauth }) {
  const _auth = await useServerAuth()

  return (
    _auth ?
      auth
      : noauth
  )
}

export default function ({ auth, noauth }) {
  return (
    <Suspense fallback={noauth}>
      <Conditional auth={auth} noauth={noauth} />
    </Suspense>
  )
}