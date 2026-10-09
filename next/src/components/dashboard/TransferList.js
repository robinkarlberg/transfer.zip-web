"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import EmptySpace from "../elements/EmptySpace"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { deleteTransfer, getDownloadToken, registerTransferDownloaded } from "@/lib/client/Api"
import { humanTimeSince, humanTimeUntil, parseTransferExpiryDate, sleep, tryCopyToClipboard } from "@/lib/utils"
import BIcon from "../BIcon"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

const Entry = ({ transfer }) => {
  const router = useRouter()

  const transferLink = transfer.downloadUrl

  const { id, name, files, expiresAt, createdAt, hasTransferRequest, finishedUploading, secretCode } = transfer
  const expiryDate = parseTransferExpiryDate(expiresAt)
  const receivedAt = transfer.uploadedAt || createdAt ? new Date(transfer.uploadedAt || createdAt) : null

  const disabled = !finishedUploading
  const detailUrl = hasTransferRequest ? `/app/requests/${transfer.transferRequestId}?submission=${id}` : `/app/sent/${id}`

  const handleCopy = async e => {
    if (await tryCopyToClipboard(transferLink)) {
      toast.success("Copied Link", { description: "The Transfer link was successfully copied to the clipboard!" })
    }
  }

  const handleCopyLinkClicked = async e => {
    e.stopPropagation()
    handleCopy()
  }

  const handleSendByEmailClicked = async e => {
    e.stopPropagation()
    // send by email
    // await sendTransferByEmail(id, )
  }

  const handleDelete = async e => {
    e.stopPropagation()
    await deleteTransfer(id)
    router.refresh()
  }

  const handleClicked = async e => {
    if (disabled) return
    router.push(detailUrl)
  }

  const expiresSoon = expiryDate && (expiryDate - new Date() <= 2 * 24 * 60 * 60 * 1000)

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(undefined)
  const formRef = useRef(null)

  const handleDownloadClicked = async e => {
    e.stopPropagation()
    setLoading(true)

    try {
      const { nodeUrl, token } = await getDownloadToken(secretCode)

      await registerTransferDownloaded(secretCode)
      setFormData({
        url: nodeUrl + "/download",
        token
      })
    }
    catch (err) {
      console.error(err)
      toast.error("Error", { description: err.message })
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
    <div onClick={handleClicked} className={`border border-gray-200 group text-start rounded-xl bg-white px-5 py-4 group ${disabled ? "hover:cursor-default" : "hover:cursor-pointer hover:bg-gray-100"} shadow-xs`}>
      {hasTransferRequest && (
        <form method={"POST"} action={formData?.url} ref={formRef} className="hidden">
          <input hidden name="token" value={formData?.token ?? ""} readOnly />
        </form>
      )}
      <div className="flex gap-4">
        <div className="w-12 aspect-square flex items-center justify-center text-center bg-primary-500 text-white rounded-lg">
          {hasTransferRequest ? <ArrowDownIcon /> : <ArrowUpIcon />}
        </div>
        <div>
          <div className="flex">
            <h3 className="text-lg font-bold mb-0.5 me-1 text-nowrap text-gray-800">{disabled ? name : <Link href={detailUrl} onClick={e => e.stopPropagation()}>{name}</Link>}</h3>
            {hasTransferRequest && <div className="ms-1">
              <span className="text-xs bg-gray-400 text-white font-semibold rounded-full px-1.5 py-0.5">
                {receivedAt ? `Received ${humanTimeSince(receivedAt)} ago` : "Received"}
              </span>
            </div>}
          </div>
          <div className="text-sm text-gray-600 font-medium group-hover:hidden">
            <span className="">
              {!finishedUploading ?
                <><BIcon name={"cloud-slash"} /> Incomplete</>
                :
                <>{files.length} file{files.length != 1 ? "s" : ""}</>
              }
            </span>
            {transfer.statistics.downloads.length > 1 ?
              <span><BIcon name="dot" /><i className="bi bi-arrow-down-circle-fill me-1"></i>{transfer.statistics.downloads.length} downloads</span>
              :
              transfer.statistics.downloads.length == 1 ?
                <span><BIcon name="dot" /><i className="bi bi-arrow-down-circle me-1"></i>Downloaded</span>
                :
                transfer.statistics.views.length >= 1 ?
                  <span><BIcon name="dot" /><i className="bi bi-eye me-1"></i>Viewed</span>
                  :
                  <span></span>
            }
            {expiryDate && <span>
              <BIcon name="dot" />
              {expiresSoon ?
                <span className="text-red-500">Expires in {humanTimeUntil(expiryDate)}</span>
                :
                <>Expires in {humanTimeUntil(expiryDate)}</>
              }
            </span>}
          </div>
          <div className="text-sm text-gray-600 font-medium hidden group-hover:block">
            {
              transfer.finishedUploading ?
                transfer.hasTransferRequest ?
                  <>
                    <button onClick={handleDownloadClicked} className="underline hover:text-primary">Download Files</button>
                    <BIcon name="dot" />
                    <button onClick={handleDelete} className="underline hover:text-red-600">Delete</button>
                  </>
                  :
                  <>
                    <button className="underline hover:text-primary">Edit</button>
                    <BIcon name="dot" />
                    <button onClick={handleCopyLinkClicked} className="underline hover:text-primary">Copy Link</button>
                  </>
                :
                (
                  <>
                    <button onClick={handleDelete} className="underline hover:text-destructive">Delete</button>
                  </>
                )
            }
          </div>
        </div>
      </div>
    </div >
  )
}

export default function TransferList({ transfers, emptyFallback }) {
  return (
    <div className="">
      <div className={`grid grid-cols-1 gap-3`}>
        {transfers.map((transfer, index) => <Entry key={transfer.id} transfer={transfer} />)}
      </div>
      {transfers.length == 0 && (
        emptyFallback || (
          <EmptySpace title={"Empty"} subtitle={"Nothing to display here! *Crickets*"} />
        )
        // <EmptySpace title={"Your transfers will appear here"} subtitle={"You can see views and download statistics, edit, send or delete them."} buttonText={"Create My First Transfer"} onClick={() => router.push("/app/new")} />
        // <div className="text-center py-16 rounded-xl border-dashed border-2">
        //   <h3 className="font-semibold text-2xl mb-1">Your transfers will appear here</h3>
        //   <p className="text-gray-600">
        //     You can see views and download statistics, edit, send or delete them.
        //   </p>
        // </div>
      )}
    </div>
  )
}
