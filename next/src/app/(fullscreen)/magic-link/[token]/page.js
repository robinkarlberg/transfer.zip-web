"use client"

import { useMagicLink } from "@/lib/client/Api"
import { useParams } from "next/navigation"
import { useEffect } from "react"

export default function () {

  const { token } = useParams()

  const handleToken = async () => {
    try {
      const res = await useMagicLink(token)
      window.location.href = "/app"
    }
    catch(err) {
      window.location.href = "/"
    }
  }

  useEffect(() => {
    handleToken()
  }, [])

  return (
    <div>
      Logging in...
    </div>
  )
}