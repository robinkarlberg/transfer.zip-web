"use client"

import { getDownloadToken, registerTransferDownloaded } from "@/lib/client/Api"
import { sleep } from "@/lib/utils"
import { ArrowDownIcon, EyeIcon, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

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
      toast.error(err.message)
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
      <div className="mt-4 flex gap-2">
        <button disabled type="button" className="inline-flex h-12 items-center gap-2 rounded-full px-5 font-semibold text-gray-400 ring-1 ring-gray-200">
          <EyeIcon size={18} /> Preview
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={handleDownloadClicked}
          className="inline-flex h-12 grow items-center justify-center gap-2 rounded-full bg-primary font-semibold text-white transition hover:bg-primary-light active:scale-[0.99] disabled:bg-primary-light"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowDownIcon size={18} />}
          {loading ? "Starting download" : "Download"}
        </button>
      </div>
    </>
  )
}