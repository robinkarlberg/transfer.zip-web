

export default function UploadOptionsButton({ onClick, icon, title, description, selected }) {
    const divClass = selected ? "border" : "text-body-secondary"
    const spanClass = selected ? "text-secondary-emphasis" : "text-secondary"

    return (
        <div onClick={onClick} className={"p-3 py-3 w-100 bg-body-tertiary btn mb-2 " + divClass}>
            <div className="d-flex flex-row">
                <div className={"d-flex flex-column align-items-start"}>
                    <span><i className={"bi me-2 " + icon}></i>{ title }</span>
                    <small><span className={spanClass}>{ description }</span></small>
                </div>
            </div>
        </div>
    )
}