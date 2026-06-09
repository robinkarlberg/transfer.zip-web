"use client"

import BIcon from "@/components/BIcon"
import { getDownloadToken, registerTransferDownloaded } from "@/lib/client/Api"
import { sleep } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"
import TransferPreviewDialog from "./TransferPreviewDialog"

export default function DownloadArea({ secretCode, transfer }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(undefined)
  const [previewOpen, setPreviewOpen] = useState(false)
  const formRef = useRef(null)

  const handleDownloadClicked = async () => {
    setLoading(true)

    try {
      const { nodeUrl, token } = await getDownloadToken(secretCode)

      // const res = await signTransferDownload(nodeUrl, token)

      await registerTransferDownloaded(secretCode)
      setFormData({
        url: nodeUrl + "/download",
        token
      })
    }
    catch (err) {

    }
    finally {
      await sleep(6000)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (formData) {
      formRef.current.submit()
    }
  }, [formData])

  return (
    <>
      <form method={"POST"} action={formData?.url} ref={formRef} className="hidden">
        <input hidden name="token" value={formData?.token ?? ""} readOnly />
      </form>
      <div className="flex gap-2">
        <button
          disabled={!transfer.previewable}
          onClick={() => setPreviewOpen(true)}
          type="button"
          className="bg-white border shadow rounded-lg px-3 py-1 grow-0 text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:hover:bg-white"
        ><BIcon name={"search"} /> Preview</button>
        <button disabled={loading} onClick={handleDownloadClicked} className="text-white bg-primary shadow rounded-lg px-3 py-1 grow hover:bg-primary-light disabled:bg-primary-light">Download</button>
      </div>
      {transfer.previewable && (
        <TransferPreviewDialog transfer={transfer} open={previewOpen} onOpenChange={setPreviewOpen} />
      )}
    </>
  )
}