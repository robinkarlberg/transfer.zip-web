"use client"

import FileUpload from "@/components/elements/FileUpload"
import { useRouter } from "next/navigation"

export default function () {
  const router = useRouter()

  const handleFiles = (files) => {
    router.push("/quick-share/progress", {
      state: {
        files,
        transferDirection: "S"
      }
    })
  }

  const handleReceiveClicked = e => {
    router.push("/quick-share/progress", {
      state: {
        transferDirection: "R"
      }
    })
  }

  return <FileUpload onFiles={handleFiles} onReceiveClicked={handleReceiveClicked} />
}