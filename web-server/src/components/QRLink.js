import QRCode from "react-qr-code"

export default function QRLink({ link, className }) {

    const copyLink = (overrideLink = null) => {
        const linkToCopy = overrideLink ? overrideLink : link
        navigator.clipboard.writeText(linkToCopy).then(() => {
            console.log("Successfully copied ", linkToCopy)
        }).catch(() => {
            console.log("Couldn't copy ", linkToCopy)
        })
    }

    return (
        <div className={className} style={{ maxWidth: "380px" }}>
            <QRCode style={{ height: "auto", maxWidth: "100%", width: "100%", padding: "24px"}}
                className="bg-white mb-3 rounded"
                size={256}
                fgColor="#212529"
                value={link ? link : "https://transfer.zip/?542388234752394243924377293849"} />
            <div className="input-group mb-3">
                <input readOnly className="form-control text-body-secondary" type="url" value={link} />
                <div className="input-group-append">
                    <button onClick={() => {copyLink()}} className="btn btn-outline-secondary" type="button"><i className="bi bi-clipboard"></i></button>
                </div>
            </div>
        </div>
        
    )
}