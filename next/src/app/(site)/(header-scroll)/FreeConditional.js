import { useServerAuth } from "@/lib/server/wrappers/auth"
import { Suspense } from "react"

export async function Conditional({ free, nofree }) {
  const _auth = await useServerAuth()
  const isFree = !_auth || _auth.user.getPlan() == "free"

  return (
    isFree ?
      free
      : nofree
  )
}

export default function ({ free, nofree }) {
  return (
    <Suspense fallback={nofree}>
      <Conditional free={free} nofree={nofree} />
    </Suspense>
  )
}