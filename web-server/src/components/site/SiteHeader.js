import { forwardRef, useContext, useState } from "react"
import logo from "../../img/transfer-zip-logotext-cropped.png"

import { Link, useNavigate } from "react-router-dom"

import { Dropdown } from "react-bootstrap"
import { AuthContext } from "../../providers/AuthProvider"

export default function SiteHeader({ }) {
    const [navbarExpanded, setNavbarExpanded] = useState(false)
    
    const navigate = useNavigate()

    const loginSignup = (
        <div className="col-md-3 text-end" role="login">
            {/* <button type="button" className="btn btn-primary me-2">Open app</button> */}
            <Link type="button" className="btn btn-outline-primary me-2" to="/login">Login</Link>
            <Link type="button" className="btn btn-primary" to="/signup">Sign-up</Link>
        </div>
    )

    const CustomToggle = forwardRef(({ children, onClick }, ref) => (
        <a href="#" className="d-flex text-body" ref={ref} onClick={(e) => { e.preventDefault(); onClick(e) }}>
            {children}
        </a>
    ))

    const spinner = (
        <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    )

    const openApp = (
        <div>
            <Link to={`/account`} className="btn btn-outline-primary me-2">Sign up</Link>
            <Link to={"/"} className="btn btn-primary">Try transfer.zip</Link>
        </div>
    )

    let headerCallToAction = openApp

    return (
        <nav className="navbar navbar-expand-lg bg-body py-3" /* position-fixed w-100 z-2 */>
            <div style={{ maxWidth: "1300px" }} className="container-fluid px-sm-3">
                <a className="navbar-brand" href="#">
                    <img style={{ width: "140px" }} onClick={() => { navigate("/") }} className="" src={logo} />
                </a>
                <button className="navbar-toggler px-2" onClick={() => { setNavbarExpanded(!navbarExpanded) }} type="button" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={"collapse navbar-collapse " + (navbarExpanded ? "show" : "")}>
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link active" to="/">App</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="features">Features</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="pricing">Pricing</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="pricing#faq">FAQ</Link>
                        </li>
                    </ul>
                    { headerCallToAction }
                </div>

            </div>
        </nav>

    )
}