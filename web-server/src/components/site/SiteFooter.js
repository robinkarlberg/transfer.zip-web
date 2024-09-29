import { Link } from "react-router-dom"
import logo_small from "../../img/transfer-zip-logo-transparent.png"
import { useRef, useState } from "react"
import { sleep } from "../../utils"
import { joinWaitlist } from "../../api/Api"

export default function SiteFooter({ }) {
    const [loading, setLoading] = useState(false)
    const [successEmail, setSuccessEmail] = useState(null)
    const emailFieldRef = useRef()

    const spinner = (
        <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    )

    const onSubmit = async () => {
        setLoading(true)
        await sleep(1000)
        try {
            const res = await joinWaitlist(emailFieldRef.current.value)
            if (res.success) {
                setSuccessEmail(emailFieldRef.current.value)
            }
        }
        catch (err) {

        }
        finally {
            setLoading(false)
        }
    }

    const _onSubmit = (e) => {
        e.preventDefault()
        onSubmit()
    }

    return (
        <footer className="mt-5">
            <div className="row mx-3">
                <div className="col-6 col-md-2 mb-3">
                    <h5>Tools</h5>
                    <ul className="nav flex-column">
                        <li className="nav-item mb-2"><Link to="/tools/zip-files-online" className="nav-link p-0 text-body-secondary">Zip Files Online</Link></li>
                        <li className="nav-item mb-2"><Link to="/tools/unzip-files-online" className="nav-link p-0 text-body-secondary">Unzip File Online</Link></li>
                        {/* <li className="nav-item mb-2"><Link to="/tools/send-zip-file" className="nav-link p-0 text-body-secondary">Send Zip File</Link></li> */}
                        {/* <li className="nav-item mb-2"><Link to="/tools/share-100gb-file" className="nav-link p-0 text-body-secondary">Share 100GB File</Link></li> */}
                        {/* <li className="nav-item mb-2"><Link to="/tools/share-big-video-file" className="nav-link p-0 text-body-secondary">Share big video file</Link></li> */}
                        {/* <li className="nav-item mb-2"><Link to="#" className="nav-link p-0 text-body-secondary">About</Link></li> */}
                    </ul>
                </div>
                <div className="col-6 col-md-2 mb-3">
                    <h5>Blog</h5>
                    <ul className="nav flex-column">
                        <li className="nav-item mb-2"><Link to="https://blog.transfer.zip/posts/best-mediafire-alternatives-to-store-files-in-2024/" className="nav-link p-0 text-body-secondary">Mediafire alternatives</Link></li>
                        <li className="nav-item mb-2"><Link to="https://blog.transfer.zip/posts/how-send-100gb-files-for-free/" className="nav-link p-0 text-body-secondary">Send 100GB files for free</Link></li>
                        <li className="nav-item mb-2"><Link to="https://blog.transfer.zip/posts/how-to-send-large-audio-files/" className="nav-link p-0 text-body-secondary">Send large audio files</Link></li>
                        <li className="nav-item mb-2"><Link to="https://blog.transfer.zip/" className="nav-link p-0 text-body-secondary">Blog</Link></li>
                    </ul>
                </div>

                <div className="col-6 col-md-2 mb-3">
                    <h5>Resources</h5>
                    <ul className="nav flex-column">
                        <li className="nav-item mb-2"><Link to="/pricing" className="nav-link p-0 text-body-secondary">Pricing</Link></li>
                        <li className="nav-item mb-2"><Link to="/pricing#faq" className="nav-link p-0 text-body-secondary">FAQ</Link></li>
                        <li className="nav-item mb-2"><Link to="https://privacypolice.ai/policy/Transfer.zip" className="nav-link p-0 text-body-secondary">Privacy Policy</Link></li>
                        <li className="nav-item mb-2"><Link to="/legal/terms-and-conditions" className="nav-link p-0 text-body-secondary">Terms and Conditions</Link></li>
                    </ul>
                </div>

                <div className="col-md-5 offset-md-1 mb-3">
                    <form onSubmit={_onSubmit}>
                        <h5>Join the waitlist</h5>
                        <p>Earn discounts for the up and coming subscription plans.</p>
                        <div className="d-flex flex-column flex-sm-row w-100 gap-2">
                            <label htmlFor="newsletter" className="visually-hidden">Email address</label>
                            <input disabled={successEmail} ref={emailFieldRef} id="newsletter" value={successEmail ? "Thank you! :-)" : undefined} type="email" className="form-control" placeholder="Email address" />
                            <button disabled={loading || successEmail} className="btn btn-primary" type="submit">{successEmail ? <i className="bi bi-check-lg"></i> : (loading ? spinner : "Subscribe")}</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top mx-3 mb-0">
                <div className="col-md-4 d-flex align-items-center">
                    <Link to="/" className="mb-3 me-2 mb-md-0 text-body-secondary text-decoration-none lh-1">
                        <img style={{ width: "50px" }} src={logo_small}></img>
                    </Link>
                    <span className="mb-3 mb-md-0 text-body-secondary">&copy; 2024 Robin K</span>
                </div>
                <div className="d-none d-sm-flex text-center flex-row flex-sm-row gap-2 mb-2">
                    <a style={{ textDecoration: "none" }} href="#"><span className="text-body-secondary">Made with <small><i className="bi bi-heart-fill text-danger"></i></small> in 🇸🇪</span></a>
                </div>
                <ul className="nav col-md-4 justify-content-end list-unstyled d-flex fs-3 mb-2">
                    <li className="ms-3"><a className="text-body-secondary" href="https://github.com/robinkarlberg/transfer.zip-web/"><i className="bi bi-github"></i></a></li>
                    <li className="ms-3"><a className="text-body-secondary" href="https://discord.gg/ZeZqtDdkqj"><i className="bi bi-discord"></i></a></li>
                    <li className="ms-3"><a className="text-body-secondary" href="https://twitter.com/transfer_zip"><i className="bi bi-twitter"></i></a></li>
                    <li className="ms-3"><a className="text-body-secondary" href="https://instagram.com/go.transfer.zip"><i className="bi bi-instagram"></i></a></li>
                    <li className="ms-3"><a className="text-body-secondary" href="https://tiktok.com/@transfer.zip"><i className="bi bi-tiktok"></i></a></li>
                </ul>
            </div>
        </footer>
    )
}