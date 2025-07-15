"use client"

import { getDownloadToken, registerTransferDownloaded } from "@/lib/client/Api"
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"

export default DownloadTransferHandler = forwardRef(function (
  { secretCode },
  ref
) {

  const [formData, setFormData] = useState(undefined)
  const formRef = useRef(null)

  const download = async () => {
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

  useImperativeHandle(ref, () => ({ download }))

  return (
    <form method={"POST"} action={formData?.url} ref={formRef} className="hidden">
      <input hidden name="token" value={formData?.token ?? ""} readOnly />
    </form>
  )
})