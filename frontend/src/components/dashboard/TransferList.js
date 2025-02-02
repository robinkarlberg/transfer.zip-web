import { humanTimeUntil, parseTransferExpiryDate } from "../../utils"
import BIcon from "../BIcon"

export default function TransferList({ transfers }) {

  const Entry = ({ transfer }) => {
    const { title, files, expiresAt } = transfer
    const expiryDate = parseTransferExpiryDate(expiresAt)
    return (
      <button className="w-full max-w-96 text-start rounded-xl border border-gray-200 bg-white px-4 py-3 group hover:bg-gray-50">
        <div>
          <h3 className="text-xl font-bold me-1">{title}</h3>
          <div className="text-sm text-gray-600 font-semibold">
            <span className="">{files.length} file{files.length > 1 ? "s" : ""}</span>
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
      </button>
    )
  }

  return (
    <div className="">
      {transfers.map((transfer, index) => <Entry transfer={transfer} />)}
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