import { useServerAuth } from "@/lib/server/wrappers/auth"
import { Suspense } from "react"

export async function Conditional({ auth, noauth }) {
  let _auth
  try {
    _auth = await useServerAuth()
  }
  catch (err) {
    // cookie is removed or token not present
  }

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