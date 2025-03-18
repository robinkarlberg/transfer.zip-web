import { Link, useNavigate, useRevalidator } from "react-router-dom"
import { humanTimeUntil, parseTransferExpiryDate, tryCopyToClipboard } from "../../utils"
import BIcon from "../BIcon"
import { useContext, useMemo } from "react"
import { DashboardContext } from "../../routes/dashboard/Dashboard"
import { ApplicationContext } from "../../providers/ApplicationProvider"
import EmptySpace from "../elements/EmptySpace"
import { deleteTransferRequest, getTransferRequestUploadLink } from "../../Api"

const Entry = ({ transferRequest }) => {
  const revalidator = useRevalidator()

  const { displayNotification } = useContext(ApplicationContext)
  const { displayedTransferId, setSelectedTransferId, hideSidebar, showSidebar } = useContext(DashboardContext)

  const uploadLink = useMemo(() => getTransferRequestUploadLink(transferRequest), [transferRequest])

  const { id, name, files, expiresAt, hasTransferRequest, finishedUploading } = transferRequest
  const expiryDate = parseTransferExpiryDate(expiresAt)
  const isSelected = id === displayedTransferId

  const disabled = !hasTransferRequest && !finishedUploading

  const handleCopy = async e => {
    if (await tryCopyToClipboard(uploadLink)) {
      displayNotification("Copied Link", "The request link was successfully copied to the clipboard!")
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
    await deleteTransferRequest(id)
    revalidator.revalidate()
  }

  const handleClicked = async e => {
    if (disabled) {

    }
    else {

    }
  }

  return (
    <button onClick={handleClicked} className={`group text-start shadow-sm rounded-xl border border-gray-200 ${isSelected ? "bg-gray-50" : "bg-white"} px-4 py-3 group hover:bg-gray-50`}>
      <div className="">
        <div>
          <h3 className={`text-lg font-bold me-1 text-nowrap ${isSelected ? "text-black" : "text-gray-800"}`}>{name}</h3>
          <div className="text-sm text-gray-600 font-medium group-hover:hidden">
            <span className="">
              <><BIcon name={"hourglass-split"} /> Waiting for files...</>
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
            <Link onClick={handleCopyLinkClicked} className="underline hover:text-primary">Copy Link</Link>
            <BIcon name="dot" />
            <Link onClick={handleDelete} className="underline hover:text-primary">Delete Link</Link>
          </div>
        </div>
      </div>
    </button >
  )
}

export default function TransferRequestList({ transferRequests }) {
  const navigate = useNavigate()

  return (
    <div className="">
      <div className={`grid grid-cols-1 gap-2`}>
        {transferRequests.map((transferRequest, index) => <Entry key={transferRequest.id} transferRequest={transferRequest} />)}
      </div>
      {transferRequests.length == 0 && (
        <EmptySpace onClick={() => navigate("/app/transfers/new", { state: { direction: "receive" } })} buttonText={"Create Request Link"} title={"Your request links will appear here"} subtitle={"You can view or revoke invdividual links."} />
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