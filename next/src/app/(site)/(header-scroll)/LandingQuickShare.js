"use client"

import BIcon from "@/components/BIcon"
import FileDropOverlay from "@/components/elements/FileDropOverlay"
import FileUpload from "@/components/elements/FileUpload"
import { FileContext } from "@/context/FileProvider"
import { useFileDropZone } from "@/hooks/client/useFileDropZone"
import { useRouter } from "next/navigation"
import { useContext } from "react"

export default function () {
  const router = useRouter()

  const { setFiles } = useContext(FileContext)

  const handleFiles = (files) => {
    setFiles(files)
    router.push("/quick/progress#S", { scroll: false })
  }

  const handleReceiveClicked = e => {
    router.push("/quick/progress#R", { scroll: false })
  }

  const { isDragging } = useFileDropZone(handleFiles)

  return (
    <div>
      <FileUpload onFiles={handleFiles} onReceiveClicked={handleReceiveClicked} />
      <p className="text-center mt-2 text-xs text-gray-400"><BIcon name={"lock-fill"}/> End-to-end encrypted, files not stored.</p>
      <p className="text-center text-xs text-gray-400">Want to store your files? Sign up.</p>
      <FileDropOverlay show={isDragging} />
    </div>
  )
}
