import { Link } from "react-router-dom"
import logo_small from "../../img/transfer-zip-logo-transparent.png"

export default function SiteFooter({ }) {
    return (
        <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top mx-3 mb-0">
            <div className="col-md-4 d-flex align-items-center">
                <Link to="/" className="mb-3 me-2 mb-md-0 text-body-secondary text-decoration-none lh-1">
                    <img style={{ width: "50px" }} src={logo_small}></img>
                </Link>
                <span className="mb-3 mb-md-0 text-body-secondary">&copy; 2024 Robin K</span>
            </div>
            <div className="d-flex text-center flex-column flex-sm-row gap-2">
                <Link className="link-secondary" to="legal/terms-and-conditions">Terms</Link>
                <Link className="link-secondary" to="legal/privacy-policy">Privacy</Link>
            </div>
            <ul className="nav col-md-4 justify-content-end list-unstyled d-flex fs-3">
                <li className="ms-3"><a className="text-body-secondary" href="https://github.com/robinkarlberg/transfer.zip-web/"><i className="bi bi-github"></i></a></li>
                <li className="ms-3"><a className="text-body-secondary" href="https://twitter.com/transfer_zip"><i className="bi bi-twitter"></i></a></li>
                <li className="ms-3"><a className="text-body-secondary" href="https://instagram.com/transfer.zip"><i className="bi bi-instagram"></i></a></li>
                <li className="ms-3"><a className="text-body-secondary" href="https://tiktok.com/@transfer.zip"><i className="bi bi-tiktok"></i></a></li>
            </ul>
        </footer>
    )
}