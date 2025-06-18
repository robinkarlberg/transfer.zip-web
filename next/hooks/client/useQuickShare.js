"use client"

import { tryParseQuickShareHash } from '@/lib/client/hash'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useQuickShare() {
  const params = useParams()
  const [info, setInfo] = useState({})

  useEffect(() => {
    if(typeof window === "undefined") {
      setInfo({})
    }
    else {
      setInfo(tryParseQuickShareHash(window.location.hash))
    }
  }, [params])

  const { k, remoteSessionId, transferDirection } = info
  const hasBeenSentLink = !!(k && remoteSessionId && transferDirection)

  return { ...info, hasBeenSentLink }
}
