import { forwardRef, useContext } from "react";
import { Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom"

import * as Api from "../../api/Api"
// import { AuthContext } from "../../providers/AuthProvider";

import { copyTransferLink } from "../../utils"
import { ApplicationContext } from "../../providers/ApplicationProvider";

const TRANSFER_LIMIT = 5

export default function TransfersList({ transfers, maxWidth }) {
    const { removeTransfer } = useContext(ApplicationContext)
    const navigate = useNavigate()

    const CustomToggle = forwardRef(({ children, onClick }, ref) => (
        <button className="btn" ref={ref} onClick={(e) => { e.preventDefault(); onClick(e) }}>
            <i className="bi bi-three-dots-vertical"></i>
        </button>
    ))

    const onDeleteTransfer = (transfer) => {
        removeTransfer(transfer)
    }

    const spinner = (
        <div class="spinner-grow spinner-grow-sm text-danger me-2" role="status">
            <span class="visually-hidden">Realtime...</span>
        </div>
    )

    // const TransfersListEntryOld = ({ transfer }) => {
    //     return (
    //         <tr>
    //             <td scope="row" style={{ padding: 0 }}>
    //                 <Link to={"" + transfer.id} className="list-group-item list-group-item-action p-2">
    //                     {transfer.isRealtime && <small className="me-2 bg-dark-subtle text-body-secondary rounded border p-1">{spinner}QUICK SHARE</small>}
    //                     <span className="me-2">{transfer.name || transfer.id}</span>
    //                     <small className="text-body-secondary">{transfer.files.length} files</small>
    //                 </Link>
    //             </td>
    //             <td className="text-end" style={{ padding: 0 }}>
    //                 {/* <small className="text-body-secondary">2024-01-02 10:23:45</small> */}
    //                 <button className="btn" onClick={() => copyTransferLink(transfer)}><i className="bi bi-link"></i></button>
    //             </td>
    //             <td className="text-end" style={{ padding: 0, width: "0" }}>
    //                 <Dropdown>
    //                     <Dropdown.Toggle as={CustomToggle} />

    //                     <Dropdown.Menu className="text-small shadow">
    //                         <Dropdown.Item onClick={() => copyTransferLink(transfer)}>Copy link</Dropdown.Item>
    //                         <Dropdown.Divider></Dropdown.Divider>
    //                         <Dropdown.Item className="text-danger" onClick={() => onDeleteTransfer(transfer)}>
    //                             Delete
    //                         </Dropdown.Item>
    //                     </Dropdown.Menu>
    //                 </Dropdown>
    //             </td>
    //         </tr>
    //     )
    // }

    const TransfersListEntry = ({ transfer }) => {

        // console.log(transfer)
        return (
            <div className="HoverButton px-3 py-2 d-flex flex-row justify-content-between bg-body-tertiary rounded-4 btn text-start w-100"
                style={{ maxWidth: "350px" }}
                onClick={() => navigate("/app/transfers/" + transfer.id)}
            >
                {/*
                overflow-hidden required for text-truncate to work:
                https://stackoverflow.com/questions/43809612/prevent-a-child-element-from-overflowing-its-parent-in-flexbox
                 */}
                <div className="d-flex flex-column overflow-hidden">
                    <div className="text-truncate">
                        <span className="fw-semibold">{transfer.name || transfer.id + transfer.id}</span>
                    </div>
                    <div className="text-body-secondary">
                        <span>{transfer.files.length} files</span>
                        {transfer.statistics.downloads.length > 1 ?
                            <span><i className="bi bi-dot"></i><i className="bi bi-arrow-down-circle-fill me-1"></i>{transfer.statistics.downloads.length} downloads</span>
                            :
                            transfer.statistics.downloads.length == 1 ?
                                <span><i className="bi bi-dot"></i><i className="bi bi-arrow-down-circle me-1"></i>Downloaded</span>
                                :
                                transfer.statistics.views.length >= 1 ?
                                    <span><i className="bi bi-dot"></i><i className="bi bi-eye me-1"></i>Viewed</span>
                                    :
                                    <span></span>
                        }

                    </div>
                </div>
                <div className="d-flex flex-column justify-content-center">
                    <i className="bi bi-chevron-right"></i>
                </div>
            </div>
        )
    }

    return (
        <div className="TransfersList mb-3">
            <div className="d-flex flex-row flex-wrap gap-2">
                {transfers.map(t => {
                    return <TransfersListEntry key={t.id} transfer={t} />
                })}
            </div>
        </div>
    )
}