import { Link, useNavigate, useRevalidator } from "react-router-dom"
import { humanTimeUntil, parseTransferExpiryDate, tryCopyToClipboard } from "../../utils"
import BIcon from "../BIcon"
import { useContext, useMemo } from "react"
import { DashboardContext } from "../../routes/dashboard/Dashboard"
import { ApplicationContext } from "../../providers/ApplicationProvider"
import EmptySpace from "../elements/EmptySpace"
import { activateTransferRequest, deactivateTransferRequest, getTransferRequestUploadLink } from "../../Api"

const Entry = ({ transferRequest }) => {
  const revalidator = useRevalidator()
  const navigate = useNavigate()

  const { displayNotification } = useContext(ApplicationContext)
  const { displayedTransferId, setSelectedTransferId, hideSidebar, showSidebar } = useContext(DashboardContext)

  const uploadLink = useMemo(() => getTransferRequestUploadLink(transferRequest), [transferRequest])

  const { active, id, name } = transferRequest

  const isSelected = id === displayedTransferId

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

  const handleActivate = async e => {
    e.stopPropagation()
    await activateTransferRequest(id)
    revalidator.revalidate()
  }

  const handleDeactivate = async e => {
    e.stopPropagation()
    await deactivateTransferRequest(id)
    revalidator.revalidate()
  }

  const handleClicked = async e => {
    // navigate("/app/transfers", { replace: true, state: { tabIndex: 2 } })
  }

  return (
    <button onClick={handleClicked} className={`group text-start shadow-sm rounded-xl border border-gray-200 ${isSelected ? "bg-gray-50" : "bg-white"} px-4 py-3 group hover:bg-gray-50`}>
      <div className="">
        <div>
          <h3 className={`text-lg font-bold me-1 text-nowrap ${isSelected ? "text-black" : "text-gray-800"}`}>{name}</h3>
          <div className="text-sm text-gray-600 font-medium group-hover:hidden">
            <span className="">
              {
                active ?
                  (
                    transferRequest.receivedTransfersCount == 0 ?
                      <><BIcon name={"hourglass-split"} /> Waiting for files...</>
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
                  <Link onClick={handleCopyLinkClicked} className="underline hover:text-primary">Copy Link</Link>
                  <BIcon name="dot" />
                </>
              )
            }
            <Link
              onClick={active ? handleDeactivate : handleActivate}
              className={`underline ${active ? "hover:text-red-600" : "hover:text-primary"}`}
            >
              {active ? "Deactivate" : "Reactivate"} Link
            </Link>
          </div>
        </div>
      </div>
    </button >
  )
}

export default function TransferRequestList({ transferRequests }) {
  const navigate = useNavigate()

  const activeRequests = useMemo(() => transferRequests.filter(transferRequest => transferRequest.active), [transferRequests]);
  const inactiveRequests = useMemo(() => transferRequests.filter(transferRequest => !transferRequest.active), [transferRequests]);

  return (
    <div className="">
      <div className={`grid grid-cols-1 gap-2 mb-2`}>
        {activeRequests.map((transferRequest, index) => <Entry key={transferRequest.id} transferRequest={transferRequest} />)}
      </div>
      {inactiveRequests.length > 0 && <h3 className="font-semibold mb-1 text-gray-500">Inactive Links</h3>}
      <div className={`grid grid-cols-1 gap-2`}>
        {inactiveRequests.map((transferRequest, index) => <Entry key={transferRequest.id} transferRequest={transferRequest} />)}
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