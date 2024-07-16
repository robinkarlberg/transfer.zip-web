import QRCode from "react-qr-code"

export default function QRLink({ link, className, children }) {

    const copyLink = (overrideLink = null) => {
        const linkToCopy = overrideLink ? overrideLink : link
        navigator.clipboard.writeText(linkToCopy).then(() => {
            console.log("Successfully copied ", linkToCopy)
        }).catch(() => {
            console.log("Couldn't copy ", linkToCopy)
        })
    }

    return (
        <div className={className} style={{ position: "relative", minWidth: "283px", maxWidth: "380px" }}>
            <QRCode style={{ height: "auto", maxWidth: "100%", width: "100%", padding: "24px" }}
                className={"bg-white mb-3 rounded " + ((!!children || !link) && "opacity-0")}
                size={128}
                fgColor="#212529"
                value={link ? link : "https://transfer.zip/?542388234752394243924377293849"} />
            <div className={"input-group mb-0 " + (!!children && "opacity-0 pe-none d-none d-lg-flex")} >
                <input readOnly className="form-control text-body-tertiary border-0 me-1 rounded " type="url" value={link} />
                <div className="input-group-append">
                    <button onClick={() => { copyLink() }} disabled={!link} className="btn bg-body btn-outline-primary border-0" type="button"><i className="bi bi-clipboard"></i></button>
                </div>
            </div>
            {!children && link == null && (
                <div className="position-absolute left-0 top-0 w-100 z-2 d-flex justify-content-center align-items-center bg-body rounded" style={{ position: "relative", aspectRatio: "1/1" }}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
            {!!children && (
                <div className="position-absolute left-0 top-0 w-100 h-100 z-2">
                    {children}
                </div>
            )}
        </div>

    )
}