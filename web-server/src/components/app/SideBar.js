import { Link, useLocation } from "react-router-dom"
import logo from "../../img/transfer-zip-logotext-cropped.png"
import { ProgressBar } from "react-bootstrap"
import { useContext } from "react"
import { AuthContext } from "../../providers/AuthProvider"
import { ApplicationContext } from "../../providers/ApplicationProvider"
import { isSelfHosted } from "../../utils"

export default function SideBar({ className }) {

    const { setShowUnlockFeatureModal } = useContext(ApplicationContext)
    const { user, isGuestOrFreeUser, isGuestUser, isFreeUser } = useContext(AuthContext)

    const disable = user == null || isGuestUser()
    const disableStatistics = user == null || isGuestOrFreeUser()

    const currentPage = useLocation().pathname

    const NavLink = ({ to, children, disable, className, override, reloadDocument }) => {
        let _to = to
        const activeClass = (currentPage.startsWith(to) ? "text-white " : "text-body-secondary ")
        let onClick = undefined
        if (!override && disable) {
            onClick = (e) => { e.preventDefault(); setShowUnlockFeatureModal(true) }
        }
        return (
            <Link onClick={onClick} reloadDocument={reloadDocument} className={"fw-medium w-100 p-2 px-3 d-inline-block link-underline link-underline-opacity-0 " + activeClass + className} to={_to}>
                {children}
            </Link>
        )
    }

    return (
        <div className={"d-flex flex-column flex-shrink-0 text-bg-dark shadow bg-body border-end " + className} style={{ minWidth: "210px" }}>
            <Link to="/" reloadDocument={true} style={{ height: "60px" }} className="d-flex align-items-center m-3 my-2 text-white text-decoration-none">
                <img className="m-auto" src={logo} style={{ height: "35px" }}></img>
                {/* <span className="fs-4">Sidebar</span> */}
            </Link>
            {/* <hr /> */}
            <div className="px-4 mb-3">
                <button className="fw-medium btn btn-primary rounded-pill w-100">
                    Transfer<i className="ms-2 bi bi-send-fill"></i>
                </button>
            </div>
            {!isSelfHosted() && <small className="text-secondary ms-3">FILE TRANSFERS</small>}
            {!isSelfHosted() && (
                <ul className="d-flex flex-column align-items-stretch list-unstyled px-2 mb-2">
                    <li>
                        <NavLink to="/app/dashboard" disable={disable}>
                            <i className="bi bi-house-fill me-2"></i>Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/app/transfers" disable={disable}>
                            <i className="bi bi-send-fill me-2"></i>Transfers
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/app/files" disable={disable}>
                            <i className="bi bi-database-fill me-2"></i>Storage
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/app/statistics" disable={disableStatistics}>
                            <i className="bi bi-bar-chart-line-fill me-2"></i>Statistics
                        </NavLink>
                    </li>
                </ul>
            )}
            <small className="text-secondary ms-3">TOOLS</small>
            <ul className="d-flex flex-column align-items-stretch list-unstyled px-2 mb-2">
                <li>
                    <NavLink to="/app/zip-files">
                        <i className="bi bi-file-earmark-zip me-2"></i>Create Zip
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/app/unzip-files">
                        <i className="bi bi-file-earmark-zip me-2"></i>View Zip
                    </NavLink>
                </li>
            </ul>
            <div className="px-3 mb-auto d-flex flex-column gap-2">
                {!isSelfHosted() && user && isGuestUser() &&
                    (
                        <Link className="btn btn-primary rounded-pill w-100" to={"/signup"} reloadDocument>
                            Sign Up
                        </Link>
                    )
                }
                {!isSelfHosted() && user && isGuestOrFreeUser() &&
                    (
                        <Link className="btn btn-outline-primary rounded-pill w-100" to={(isGuestUser() ? "/login" : "/upgrade")} reloadDocument>
                            {!user ? ("...") : (isGuestUser() ? "Login" : "Upgrade")}
                        </Link>
                    )
                }
            </div>
            {!isSelfHosted() && (
                <div>
                    <hr />
                    <ul className="nav nav-pills flex-column px-2">
                        <li>
                            <NavLink to={isGuestUser() ? "/signup" : "/app/account"} reloadDocument={isGuestUser()} override={true}>
                                <i className="bi bi-person-fill me-2"></i>Account
                                {/* <div className="d-flex align-items-center text-white text-decoration-none">
                                <img src="https://avatars.githubusercontent.com/u/10927692?v=4" alt="" width="32" height="32" className="rounded-circle me-2" />
                                <strong>{user.username}</strong>
                            </div> */}
                            </NavLink>
                        </li>
                    </ul>
                </div>
            )}
            <hr className="mb-1" />
            <div className="d-flex justify-content-between p-3">
                <small className="text-body-secondary">&copy; 2024 Robin K</small>
                <div>
                    <a className="text-body-secondary" href="https://github.com/robinkarlberg/transfer.zip-web"><i className="bi bi-github"></i></a>
                </div>
            </div>
            {/* <div>
                <ProgressBar className="mt-1" style={{ height: "8px" }} />
                <small className="text-body-secondary">1/200GB</small>
            </div> */}
        </div>
    )
}