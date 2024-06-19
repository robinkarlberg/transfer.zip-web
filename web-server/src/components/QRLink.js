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
        <div className={className} style={{ position: "relative", maxWidth: "380px" }}>
            <QRCode style={{ height: "auto", maxWidth: "100%", width: "100%", padding: "24px" }}
                className={"bg-white mb-3 rounded " + (children && "opacity-0")}
                size={128}
                fgColor="#212529"
                value={link ? link : "https://transfer.zip/?542388234752394243924377293849"} />
            <div className={"input-group mb-0 " + (children && "opacity-0 pe-none d-none d-lg-flex")} >
                <input readOnly className="form-control text-body-tertiary border-0 me-1 rounded " type="url" value={link} />
                <div className="input-group-append">
                    <button onClick={() => { copyLink() }} className="btn bg-body btn-outline-primary border-0" type="button"><i className="bi bi-clipboard"></i></button>
                </div>
            </div>
            {children && (
                <div className="position-absolute left-0 top-0 w-100 h-100 z-2">
                    {children}
                </div>
            )}
        </div>

    )
}