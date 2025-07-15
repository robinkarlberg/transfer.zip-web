"use client"

import BIcon from "@/components/BIcon"
import FileUpload from "@/components/elements/FileUpload"
import QuestionCircle from "@/components/elements/QuestionCircle"
import { FileContext } from "@/context/FileProvider"
import { useQuickShare } from "@/hooks/client/useQuickShare"
import { getComputedNewLocation } from "@/lib/client/hash"
import { useRouter } from "next/navigation"
import { useContext, useEffect } from "react"

export default function ({ stars }) {

  const { setFiles } = useContext(FileContext)
  const { hasBeenSentLink, k, remoteSessionId, transferDirection } = useQuickShare()

  const router = useRouter()

  const handleFiles = (files) => {
    setFiles(files)
    if (hasBeenSentLink) {
      router.push("/quick/progress" + window.location.hash, { scroll: false })
    }
    else {
      router.push("/quick/progress#S", { scroll: false })
    }
  }

  const onReceiveClicked = e => {
    router.push("/quick/progress#R", { scroll: false })
  }

  useEffect(() => {
    if (transferDirection == "R") {
      // console.log(getComputedNewLocation(transferDirection) + window.location.hash)
      router.replace(getComputedNewLocation(transferDirection) + window.location.hash, { scroll: false })
    }
  }, [transferDirection])

  return (
    <div className="w-full max-w-96 text-center">
      <div className={hasBeenSentLink ? "mb-2" : "mb-28"}>
        <h1 className="font-extrabold text-4xl tracking-tight md:text-5xl mb-2 text-gray-800">{hasBeenSentLink ? "Send Files" : "Quick Transfer"}</h1>
        <h2 className="text-gray-600 mb-4 md:text-lg">
          {hasBeenSentLink ?
            "Someone has requested you to send files!"
            :
            "Temporary file sharing, with no size limit."
          }
          {" "}
          <div className="hidden sm:inline">
            <QuestionCircle text={"Link expires when tab is closed. Both of you need to be online at the same time."} />
          </div>
        </h2>
      </div>
      <FileUpload onFiles={handleFiles} onReceiveClicked={hasBeenSentLink ? undefined : onReceiveClicked} />
      <p className="text-gray-500 text-xs mt-2">
        We do not use cookies. Your files are protected with end-to-end encryption, meaning they remain unreadable by anyone but you.<br /><a href="https://github.com/robinkarlberg/transfer.zip-web" className="text-primary hover:underline">GitHub {stars && <span>({stars} <BIcon name={"star"} />)</span>} </a>
      </p>
    </div>
  )
}