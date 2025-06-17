"use client"

import FileUpload from "@/components/elements/FileUpload"
import { FileContext } from "@/context/FileProvider"
import { useRouter } from "next/navigation"
import { useContext } from "react"

export default function () {
  const router = useRouter()

  const { setFiles } = useContext(FileContext)

  const handleFiles = (files) => {
    setFiles(files)
    router.push("/quick-share/progress?dir=S")
  }

  const handleReceiveClicked = e => {
    router.push("/quick-share/progress?dir=R")
  }

  return <FileUpload onFiles={handleFiles} onReceiveClicked={handleReceiveClicked} />
}