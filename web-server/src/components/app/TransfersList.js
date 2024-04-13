import { forwardRef, useContext } from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom"

import * as Api from "../../api/Api"
import { ApiContext } from "../../providers/ApiProvider";

import { copyTransferLink } from "../../utils"

export default function TransfersList({ transfers }) {
    const { refreshTransfers } = useContext(ApiContext)

    const CustomToggle = forwardRef(({ children, onClick }, ref) => (
        <button className="btn" ref={ref} onClick={(e) => { e.preventDefault(); onClick(e) }}>
            <i className="bi bi-three-dots-vertical"></i>
        </button>
    ))

    const onDeleteTransfer = async (transferId) => {
        await Api.deleteTransfer(transferId)
        await refreshTransfers()
    }

    const TransfersListEntry = ({ transfer }) => {
        return (
            <tr>
                <td scope="row" style={{ padding: 0 }}>
                    <Link to={"/transfers/" + transfer.id} className="list-group-item list-group-item-action p-2">
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
                            <Dropdown.Item className="text-danger" onClick={() => onDeleteTransfer(transfer.id)}>
                                Delete
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </td>
            </tr>
        )
    }

    return (
        <div className="TransfersList" style={{ maxWidth: "800px" }}>
            <table className="table table-hover border">
                <thead>
                    <tr>
                        <th scope="col">Name</th>
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