"use client"

import { useParams, useRouter, useSelectedLayoutSegment, useSelectedLayoutSegments } from "next/navigation"
import EmptySpace from "../elements/EmptySpace"
import { ApplicationContext } from "@/context/ApplicationContext"
import { useContext, useMemo } from "react"
import { DashboardContext } from "@/context/DashboardContext"
import { deleteTransfer, getTransferDownloadLink, sendTransferByEmail } from "@/lib/client/Api"
import { humanTimeUntil, parseTransferExpiryDate, sleep, tryCopyToClipboard } from "@/lib/utils"
import BIcon from "../BIcon"
import Link from "next/link"

const Entry = ({ transfer }) => {
  const router = useRouter()

  const { transferId: displayedTransferId } = useParams()

  const { displayNotification, hideSidebar, showSidebar } = useContext(DashboardContext)

  const transferLink = useMemo(() => getTransferDownloadLink(transfer), [transfer])

  const { id, name, files, expiresAt, hasTransferRequest, finishedUploading } = transfer
  const expiryDate = parseTransferExpiryDate(expiresAt)
  const isSelected = id === displayedTransferId

  const disabled = !finishedUploading || hasTransferRequest

  const handleCopy = async e => {
    if (await tryCopyToClipboard(transferLink)) {
      displayNotification("success", "Copied Link", "The Transfer link was successfully copied to the clipboard!")
    }
  }

  const handleDownloadClicked = async e => {
    e.stopPropagation()
    window.open(getTransferAttachmentLink(transfer) + "/zip", "_blank")
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
    if(displayedTransferId === id) {
      router.replace(".")
      router.refresh()
    }
    else {
      router.refresh()
    }
  }

  const handleClicked = async e => {
    if (disabled) {

    }
    else {
      isSelected ? router.replace(".") : router.push(`/app/${id}`)
    }
  }

  const expiresSoon = expiryDate && (expiryDate - new Date() <= 3 * 24 * 60 * 60 * 1000)

  return (
    <div onClick={handleClicked} className={`group text-start shadow-xs rounded-xl border border-gray-200 ${isSelected ? "bg-gray-50" : "bg-white"} px-5 py-4 group ${disabled ? "hover:cursor-default" : "hover:cursor-pointer hover:bg-gray-50"}`}>
      <div className="">
        <div>
          <div className="flex">
            <h3 className={`text-lg font-bold mb-0.5 me-1 text-nowrap ${isSelected ? "text-black" : "text-gray-800"}`}>{name}</h3>
            {hasTransferRequest && <div className="ms-1">
              <span className="text-xs bg-gray-400 text-white font-semibold rounded-full px-1.5 py-0.5">Requested</span>
            </div>}
          </div>
          <div className="text-sm text-gray-600 font-medium group-hover:hidden">
            <span className="">
              {!finishedUploading ?
                (!hasTransferRequest ? <><BIcon name={"cloud-slash"} /> Incomplete</> : <><BIcon name={"hourglass-split"} /> Waiting for files...</>)
                :
                <>{!hasTransferRequest ? <>Sent</> : <><BIcon name={"arrow-down"} /> Received</>} {files.length} file{files.length != 1 ? "s" : ""}</>
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
                    <button className="underline hover:text-primary">Resume Upload</button>
                    <BIcon name="dot" />
                    <button onClick={handleDelete} className="underline hover:text-destructive">Delete</button>
                  </>
                )
            }

          </div>
        </div>
        {/* <div className="flex items-center gap-2">
          {
            disabled ?
              <Link onClick={handleDelete} className="text-sm text-red-500 bg-white border px-2.5 py-1.5 rounded-lg hover:bg-gray-50 hidden group-hover:inline-block">
                <BIcon name={"trash"} />
              </Link>
              :
              (
                hasTransferRequest && finishedUploading ?
                  <Link onClick={handleDownloadClicked} className={`font-medium text-sm px-2.5 py-1.5 rounded-lg ${transfer.statistics.downloads.length > 0 ? "hover:bg-gray-50 text-primary bg-white border hidden group-hover:inline-block" : "hover:bg-primary-light text-white bg-primary"}`}>
                    Download {transfer.statistics.downloads.length > 0 && "Again"}
                  </Link>
                  :
                  <Link onClick={handleCopyLinkClicked} className="text-sm text-primary bg-white border px-2.5 py-1.5 rounded-lg hover:bg-gray-50 hidden group-hover:inline-block">
                    <BIcon name={"copy"} /> Copy Link
                  </Link>
              )
          }
        </div> */}
      </div>
    </div >
  )
}

export default function TransferList({ transfers }) {
  return (
    <div className="">
      <div className={`grid grid-cols-1 gap-3`}>
        {transfers.map((transfer, index) => <Entry key={transfer.id} transfer={transfer} />)}
      </div>
      {transfers.length == 0 && (
        <EmptySpace title={"Your transfers will appear here"} subtitle={"You can see views and download statistics, edit, send or delete them."} />
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