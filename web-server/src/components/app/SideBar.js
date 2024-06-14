import { Link } from "react-router-dom"
import logo from "../../img/transfer-zip-logotext-cropped.png"
import { ProgressBar } from "react-bootstrap"
import { useContext } from "react"
import { AuthContext } from "../../providers/AuthProvider"

export default function SideBar({ }) {

    const { user, isGuestOrFreeUser, isGuestUser } = useContext(AuthContext)

    const disable = user == null || isGuestOrFreeUser()

    const currentPage = window.location.pathname

    const NavLink = ({ to, children, disable }) => {
        const disableClass = disable ? "disabled" : "text-white"
        return (
            <Link className={"nav-link " + (currentPage.startsWith(to) ? "active " : "") + disableClass} to={to}>
                {children}
            </Link>
        )
    }

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark shadow bg-body-tertiary border-end" style={{ minWidth: "230px" }}>
            <Link to="/" style={{ height: "60px" }} className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <img className="bi" src={logo} style={{ height: "45px" }}></img>
                {/* <span className="fs-4">Sidebar</span> */}
            </Link>
            <hr />
            <ul className="nav nav-pills flex-column mb-auto">
                <li>
                    <NavLink to="/home">
                        <b>Home</b>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/quick-share/new">
                        Quick Share
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/transfers" disable={disable}>
                        Transfers
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/statistics" disable={disable}>
                        Statistics
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/files" disable={disable}>
                        Files
                    </NavLink>
                </li>
            </ul>
            <hr />
            <ul className="nav nav-pills flex-column">
                <li>
                    <NavLink to="/account">
                        { isGuestUser() ? "Sign up" : "Account" }
                        {/* <div className="d-flex align-items-center text-white text-decoration-none">
                            <img src="https://avatars.githubusercontent.com/u/10927692?v=4" alt="" width="32" height="32" className="rounded-circle me-2" />
                            <strong>user</strong>
                        </div> */}
                    </NavLink>
                </li>
            </ul>
            <hr/>
            <div>
                <small className="text-body-secondary">&copy; 2024 Robin K</small>
            </div>
            {/* <div>
                <ProgressBar className="mt-1" style={{ height: "8px" }} />
                <small className="text-body-secondary">1/200GB</small>
            </div> */}
        </div>
    )
}