import { useServerAuth } from "@/lib/server/wrappers/auth"
import { Suspense } from "react"

export async function Conditional({ free, nofree }) {
  let isFree = false
  let _auth
  try {
    _auth = await useServerAuth()
    if(_auth.user.getPlan() == "free") {
      isFree = true
    }
  }
  catch (err) {
    // cookie is removed or token not present
    isFree = true
  }

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