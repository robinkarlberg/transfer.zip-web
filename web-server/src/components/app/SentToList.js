import { forwardRef } from "react";
import { Dropdown } from "react-bootstrap"
import { Link } from "react-router-dom"

export default function SentToList({ sentTo, onAction, primaryActions, redActions, ...props }) {

    const CustomToggle = forwardRef(({ children, onClick }, ref) => (
        <button className="btn" ref={ref} onClick={(e) => { e.preventDefault(); onClick(e) }}>
            <i className="bi bi-three-dots-vertical"></i>
        </button>
    ))

    const prettify = (str) => {
        return str[0].toUpperCase() + str.slice(1)
    }

    const SentToListEntry = ({ sentTo }) => {
        return (
            <tr>
                <td scope="row" style={{ padding: 0 }}>
                    <Link className="list-group-item list-group-item-action p-2" onClick={() => onAction("click", sentTo)}>
                        {sentTo.email}
                    </Link>
                </td>
                
                <td>
                    { sentTo.time }
                </td>
                <td className="text-end" style={{ padding: 0 }}>
                    <Dropdown>
                        { (primaryActions?.length || redActions?.length) && <Dropdown.Toggle as={CustomToggle} /> }

                        <Dropdown.Menu className="text-small shadow">
                            {primaryActions?.map(action => (
                                <Dropdown.Item onClick={() => { onAction(action, sentTo) }}>{prettify(action)}</Dropdown.Item>
                            ))}

                            {primaryActions?.length && redActions.length && (
                                <Dropdown.Divider></Dropdown.Divider>
                            )}

                            {redActions?.length && (
                                <>
                                    {redActions.map(action => (
                                        <Dropdown.Item className="text-danger" onClick={() => { onAction(action, sentTo) }}>
                                            {prettify(action)}
                                        </Dropdown.Item>
                                    ))}
                                </>
                            )}

                        </Dropdown.Menu>
                    </Dropdown>
                </td>
            </tr>
        )
    }

    return (
        <div className="SentToList" {...props}>

            <table className="table table-hover table-responsive border">
                <thead>
                    <tr>
                        <th scope="col">Email</th>
                        <th scope="col">Time</th>
                    </tr>
                </thead>
                <tbody>
                    {!sentTo || sentTo.length == 0 && (
                        <tr>
                            <td scope="row" className="bg-dark-subtle">
                                <small>Not shared by email yet</small>
                            </td>
                            <td className="bg-dark-subtle">
                            </td>
                        </tr>
                    )}
                    {sentTo.map(x => {
                        return <SentToListEntry key={x.email} sentTo={x} />
                    })}
                </tbody>
            </table>
        </div>
    )
}