import { forwardRef, useContext } from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom"

import * as Api from "../../api/Api"
// import { AuthContext } from "../../providers/AuthProvider";

import { copyTransferLink } from "../../utils"
import { ApplicationContext } from "../../providers/ApplicationProvider";

export default function TransfersList({ transfers, maxWidth }) {
    const { removeTransfer } = useContext(ApplicationContext)

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

    const TransfersListEntry = ({ transfer }) => {
        return (
            <tr>
                <td scope="row" style={{ padding: 0 }}>
                    <Link to={"/transfers/" + transfer.id} className="list-group-item list-group-item-action p-2">
                        { transfer.isRealtime && <small className="me-2 bg-dark-subtle text-body-secondary rounded border p-1">{spinner}QUICK SHARE</small> }
                        <span className="me-2">{transfer.name || transfer.id}</span>
                        <small className="text-body-secondary">{transfer.files.length} files</small>
                    </Link>
                </td>
                <td className="text-end" style={{ padding: 0 }}>
                    {/* <small className="text-body-secondary">2024-01-02 10:23:45</small> */}
                    <button className="btn" onClick={() => copyTransferLink(transfer)}><i className="bi bi-link"></i></button>
                </td>
                <td className="text-end" style={{ padding: 0, width: "0" }}>
                    <Dropdown>
                        <Dropdown.Toggle as={CustomToggle} />

                        <Dropdown.Menu className="text-small shadow">
                            <Dropdown.Item onClick={() => copyTransferLink(transfer)}>Copy link</Dropdown.Item>
                            <Dropdown.Divider></Dropdown.Divider>
                            <Dropdown.Item className="text-danger" onClick={() => onDeleteTransfer(transfer)}>
                                Delete
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </td>
            </tr>
        )
    }

    return (
        <div className="TransfersList" style={{ maxWidth: maxWidth || "unset" }}>
            <table className="table table-hover border">
                <thead>
                    <tr>
                        <th scope="col">Transfer Name</th>
                        <th scope="col"></th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                    {transfers.length == 0 && (
                        <tr>
                            <td scope="row" className="bg-dark-subtle">
                                <small>No transfers</small>
                            </td>
                            <td className="bg-dark-subtle">
                            </td>
                            <td className="bg-dark-subtle">
                            </td>
                        </tr>
                    )}
                    {transfers.map(t => {
                        return <TransfersListEntry key={t.id} transfer={t} />
                    })}
                </tbody>
            </table>
        </div>
    )
}