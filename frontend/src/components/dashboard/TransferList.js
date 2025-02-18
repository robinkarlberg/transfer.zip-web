import { Link } from "react-router-dom"
import { humanTimeUntil, parseTransferExpiryDate, tryCopyToClipboard } from "../../utils"
import BIcon from "../BIcon"
import { useContext, useMemo } from "react"
import { DashboardContext } from "../../routes/dashboard/Dashboard"
import { getTransferDownloadLink } from "../../Api"
import { ApplicationContext } from "../../providers/ApplicationProvider"

const Entry = ({ transfer }) => {
  const { displayNotification } = useContext(ApplicationContext)
  const { displayedTransferId, setSelectedTransferId, hideSidebar, showSidebar } = useContext(DashboardContext)

  const transferLink = useMemo(() => getTransferDownloadLink(transfer), [transfer])

  const { id, name, files, expiresAt } = transfer
  const expiryDate = parseTransferExpiryDate(expiresAt)
  const isSelected = id === displayedTransferId

  const handleCopy = async e => {
    if (await tryCopyToClipboard(transferLink)) {
      displayNotification("Copied Link", "The Transfer link was successfully copied to the clipboard!")
    }
  }

  const handleCopyLinkClicked = async e => {
    e.stopPropagation()
    handleCopy()
  }

  return (
    <button onClick={() => isSelected ? hideSidebar() : setSelectedTransferId(id)} className={`group text-start shadow-sm rounded-xl border border-gray-200 ${isSelected ? "bg-gray-50" : "bg-white"} px-4 py-3 group hover:bg-gray-50`}>
      <div className="flex flex-row justify-between">
        <div>
          <h3 className={`text-xl font-bold me-1 text-nowrap ${isSelected ? "text-black" : "text-gray-800"}`}>{name}</h3>
          <div className="text-sm text-gray-600 font-semibold">
            <span className="">{files.length} file{files.length != 1 ? "s" : ""}</span>
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
              <i className="bi bi-clock me-1"></i>{humanTimeUntil(expiryDate)}
            </span>}
          </div>
        </div>
        <div className="items-center hidden group-hover:flex">
          <button onClick={handleCopyLinkClicked} className="text-sm text-primary bg-white border px-2.5 py-1.5 rounded-lg hover:bg-gray-50">
            <BIcon name={"copy"} /> Copy Link
          </button>
        </div>
      </div>
    </button>
  )
}

export default function TransferList({ transfers }) {

  const { displayedTransferId, setSelectedTransferId, hideSidebar, showSidebar } = useContext(DashboardContext)

  return (
    <div className="">
      <div key={"asndasundas"} className={`grid grid-cols-1 gap-2`}>
        {transfers.map((transfer, index) => <Entry key={transfer.id} transfer={transfer} />)}
      </div>
      {transfers.length == 0 && (
        <div className="text-center py-16 rounded-xl border-dashed border-2">
          <h3 className="font-semibold text-2xl mb-1">Your transfers will appear here</h3>
          <p className="text-gray-600">
            You can see views and download statistics, edit, send or delete them.
          </p>
        </div>
      )}
    </div>
  )
}