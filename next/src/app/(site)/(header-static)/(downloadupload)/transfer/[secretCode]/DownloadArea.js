"use client"

import BIcon from "@/components/BIcon"
import { getDownloadToken, registerTransferDownloaded, signTransferDownload } from "@/lib/client/Api"
import { sleep } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

export default function DownloadArea({ secretCode }) {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState(undefined)

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
    if(formData) {
      formRef.current.submit()
    }
  }, [formData])

  return (
    <>
      <form method={"POST"} action={formData?.url} ref={formRef} className="hidden">
        <input hidden name="token" value={formData?.token ?? ""} readOnly/>
      </form>
      <div className="flex gap-2">
        <button disabled type="button" className="text-gray-400 bg-white border shadow rounded-lg px-3 py-1 grow-0"><BIcon name={"search"} /> Preview</button>
        <button disabled={loading} onClick={handleDownloadClicked} className="text-white bg-primary shadow rounded-lg px-3 py-1 grow hover:bg-primary-light disabled:bg-primary-light">Download</button>
      </div>
    </>
  )
}