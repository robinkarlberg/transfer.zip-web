"use client"

import { getComputedNewLocation } from "@/lib/client/hash"
import { useQuickShare } from "@/hooks/client/useQuickShare"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HashInterceptor({ }) {

  const router = useRouter()

  const { transferDirection } = useQuickShare()

  useEffect(() => {
    if(transferDirection == "S" || transferDirection == "R") {
      console.log(getComputedNewLocation(transferDirection) + window.location.hash)
      router.replace(getComputedNewLocation(transferDirection) + window.location.hash)
    }
  }, [transferDirection])

  return undefined
}