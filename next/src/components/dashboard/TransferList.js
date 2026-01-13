"use client"

import { useParams, useRouter, useSelectedLayoutSegment, useSelectedLayoutSegments } from "next/navigation"
import EmptySpace from "../elements/EmptySpace"
import { ApplicationContext } from "@/context/ApplicationContext"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { DashboardContext } from "@/context/DashboardContext"
import { deleteTransfer, getDownloadToken, getTransferDownloadLink, registerTransferDownloaded, sendTransferByEmail } from "@/lib/client/Api"
import { humanTimeUntil, parseTransferExpiryDate, sleep, tryCopyToClipboard } from "@/lib/utils"
import BIcon from "../BIcon"
import Link from "next/link"
import { SelectedTransferContext } from "@/context/SelectedTransferProvider"
import { Separator } from "../ui/separator"
import { ArrowDownIcon, ArrowUpIcon, SendIcon } from "lucide-react"

const Entry = ({ transfer }) => {
  const router = useRouter()

  const { selectedTransferId } = useContext(SelectedTransferContext)

  const { displayNotification, hideSidebar, showSidebar } = useContext(DashboardContext)

  const transferLink = useMemo(() => getTransferDownloadLink(transfer), [transfer])

  const { id, name, files, expiresAt, hasTransferRequest, finishedUploading, secretCode } = transfer
  const expiryDate = parseTransferExpiryDate(expiresAt)
  const isSelected = id === selectedTransferId

  const disabled = !finishedUploading || hasTransferRequest

  const handleCopy = async e => {
    if (await tryCopyToClipboard(transferLink)) {
      displayNotification("success", "Copied Link", "The Transfer link was successfully copied to the clipboard!")
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
    // await sleep(1000)
    // router.refresh()
    if (selectedTransferId === id) {
      // router.refresh()
      // router.push(".")
      // NextJS can suck my fucking balls https://github.com/vercel/next.js/discussions/70786
      window.location.replace(".")
    }
    else {
      router.refresh()
    }
  }

  const handleClicked = async e => {
    if (disabled) {

    }
    else {
      isSelected ? router.replace(".") : router.push(hasTransferRequest ? `/app/received/${id}` : `/app/sent/${id}`)
    }
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
      displayNotification("error", "Error", err.message)
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
    <div onClick={handleClicked} className={`border border-gray-200 group text-start rounded-xl ${isSelected ? "bg-gray-100" : "bg-white"} px-5 py-4 group ${disabled ? "hover:cursor-default" : "hover:cursor-pointer hover:bg-gray-100"} shadow-xs`}>
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
            <h3 className={`text-lg font-bold mb-0.5 me-1 text-nowrap ${isSelected ? "text-black" : "text-gray-800"}`}>{name}</h3>
            {hasTransferRequest && <div className="ms-1">
              <span className="text-xs bg-gray-400 text-white font-semibold rounded-full px-1.5 py-0.5">Received</span>
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
                <span className="text-red-500"><i className="bi bi-clock-fill me-1"></i>Expires in {humanTimeUntil(expiryDate)}</span>
                :
                <><i className="bi bi-clock me-1"></i>{humanTimeUntil(expiryDate)}</>
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