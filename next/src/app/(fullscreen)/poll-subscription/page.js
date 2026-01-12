"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser } from "@/lib/client/Api"
import Spinner from "@/components/elements/Spinner"
import { Button } from "@/components/ui/button"

import logo from "@/img/icon.png"
import Link from "next/link"
import Image from "next/image"

export default function PollSubscriptionPage() {
  const router = useRouter()
  const [showDelayMessage, setShowDelayMessage] = useState(false)

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      while (!cancelled) {
        try {
          const res = await getUser()
          if (res.user?.plan && res.user.plan !== "free") {
            router.replace("/app")
            return
          }
        } catch (e) {
          // ignore errors and keep polling
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    const delayTimer = setTimeout(() => {
      setShowDelayMessage(true)
    }, 15000)

    poll()

    return () => {
      cancelled = true
      clearTimeout(delayTimer)
    }
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative">
      <div className="absolute top-4 left-4">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-x-1">
            <Image
              alt="Logo"
              src={logo}
              className="h-8 w-auto"
            />
            <span className='font-bold'>{process.env.NEXT_PUBLIC_SITE_NAME}</span>
          </Link>
        </div>
      </div>
      <Spinner sizeClassName="h-10 w-10" />
      <p className="mt-4 text-lg text-gray-600 fade-in-up-slow">Setting up your subscription...</p>
      {showDelayMessage && (
        <>
          <p className="mt-4 text-sm text-gray-500 fade-in-up-slow text-center">
            This is taking longer than expected. Please contact support if your subscription isn't active in a few minutes.
          </p>
          <Button size={"sm"} className={"mt-8 fade-in-up-slow"} onClick={() => {
            if (window.megadeskSendText) {
              window.megadeskSendText("I paid for my subscription, but it didn't get activated. Please open a support ticket so they can take a look.")
            }
            else {
              window.location.href = `mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`
            }
          }}>Contact Support</Button>
        </>
      )}
    </div>
  )
}