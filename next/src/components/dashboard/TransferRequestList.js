"use client"

import { ApplicationContext } from "@/context/ApplicationContext"
import { useParams, useRouter } from "next/navigation"
import { useContext, useMemo } from "react"
import EmptySpace from "../elements/EmptySpace"
import { toast } from "sonner"
import { cn, tryCopyToClipboard } from "@/lib/utils"
import { activateTransferRequest, deactivateTransferRequest, getTransferRequestUploadLink } from "@/lib/client/Api"
import BIcon from "../BIcon"
import Link from "next/link"
import { Link2OffIcon, LinkIcon } from "lucide-react"

const Entry = ({ transferRequest }) => {
  const router = useRouter()

  
  const { transferId: displayedTransferId } = useParams()

  const uploadLink = useMemo(() => getTransferRequestUploadLink(transferRequest), [transferRequest])

  const { active, id, name } = transferRequest

  const isSelected = id === displayedTransferId

  const handleCopy = async e => {
    if (await tryCopyToClipboard(uploadLink)) {
      toast.success("Copied Link", { description: "The request link was successfully copied to the clipboard!" })
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

  const handleActivate = async e => {
    e.stopPropagation()
    await activateTransferRequest(id)
    router.refresh()
  }

  const handleDeactivate = async e => {
    e.stopPropagation()
    await deactivateTransferRequest(id)
    router.refresh()
  }

  const handleClicked = async e => {
    // navigate("/app", { replace: true, state: { tabIndex: 2 } })
  }

  return (
    <div onClick={handleClicked} className={`hover:cursor-default group text-start shadow-xs rounded-xl border border-gray-200 ${isSelected ? "bg-gray-50" : "bg-white"} px-5 py-4 group`}>
      <div className="flex gap-4">
        <div className={cn(
          "w-12 aspect-square flex items-center justify-center text-center text-white rounded-lg",
          active ? "bg-primary-500" : "bg-gray-300"
        )}>
          {active ? <LinkIcon/> : <Link2OffIcon/>}
        </div>
        <div>
          <h3 className={`text-lg font-bold mb-0.5 me-1 text-nowrap ${isSelected ? "text-black" : "text-gray-800"}`}>{name}</h3>
          <div className="text-sm text-gray-600 font-medium group-hover:hidden">
            <span className="">
              {
                active ?
                  (
                    transferRequest.receivedTransfersCount == 0 ?
                      <>Request link is active</>
                      :
                      <><BIcon name={"arrow-down"} /> {transferRequest.receivedTransfersCount} transfer{transferRequest.receivedTransfersCount != 1 && "s"} received</>
                  )
                  :
                  <><BIcon name={"stop-fill"} /> Inactive</>
              }

            </span>
            {/* {transfer.statistics.downloads.length > 1 ?
              <span><BIcon name="dot" /><i className="bi bi-arrow-down-circle-fill me-1"></i>{transfer.statistics.downloads.length} downloads</span>
              :
              transfer.statistics.downloads.length == 1 ?
                <span><BIcon name="dot" /><i className="bi bi-arrow-down-circle me-1"></i>Downloaded</span>
                :
                transfer.statistics.views.length >= 1 ?
                  <span><BIcon name="dot" /><i className="bi bi-eye me-1"></i>Viewed</span>
                  :
                  <span></span>
            } */}
            {/* {expiryDate && <span>
              <BIcon name="dot" />
              <i className="bi bi-clock me-1"></i>{humanTimeUntil(expiryDate)}
            </span>} */}
          </div>
          <div className="text-sm text-gray-600 font-medium hidden group-hover:block">
            {/* <Link className="underline hover:text-primary">View Files</Link>
            <BIcon name="dot" /> */}
            {
              active && (
                <>
                  <button onClick={handleCopyLinkClicked} className="underline hover:text-primary">Copy Link</button>
                  <BIcon name="dot" />
                </>
              )
            }
            <button
              onClick={active ? handleDeactivate : handleActivate}
              className={`underline ${active ? "hover:text-red-600" : "hover:text-primary"}`}
            >
              {active ? "Deactivate" : "Reactivate"} Link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TransferRequestList({ transferRequests }) {
  const router = useRouter()

  const activeRequests = useMemo(() => transferRequests.filter(transferRequest => transferRequest.active), [transferRequests]);
  const inactiveRequests = useMemo(() => transferRequests.filter(transferRequest => !transferRequest.active), [transferRequests]);

  return (
    <div className="">
      {transferRequests.length == 0 && (
        <EmptySpace onClick={() => router.push("/app/receive")} buttonText={"Create Request Link"} title={"Your request links will appear here"} subtitle={"You can view or revoke invdividual links."} />
      )}
      <div className={`grid grid-cols-1 gap-3 mb-2`}>
        {activeRequests.map((transferRequest, index) => <Entry key={transferRequest.id} transferRequest={transferRequest} />)}
      </div>
      {inactiveRequests.length > 0 && <h3 className="font-semibold mb-1 text-white">Inactive Links</h3>}
      <div className={`grid grid-cols-1 gap-3`}>
        {inactiveRequests.map((transferRequest, index) => <Entry key={transferRequest.id} transferRequest={transferRequest} />)}
      </div>
    </div>
  )
}