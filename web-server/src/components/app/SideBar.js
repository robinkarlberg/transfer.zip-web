import { Link, useLocation } from "react-router-dom"
import logo from "../../img/transfer-zip-logotext-cropped.png"
import { ProgressBar } from "react-bootstrap"
import { useContext } from "react"
import { AuthContext } from "../../providers/AuthProvider"
import { ApplicationContext } from "../../providers/ApplicationProvider"

export default function SideBar({ className }) {

    const { setShowUnlockFeatureModal } = useContext(ApplicationContext)
    const { user, isGuestOrFreeUser, isGuestUser, isFreeUser } = useContext(AuthContext)

    const disable = user == null || isGuestUser()

    const currentPage = useLocation().pathname

    const NavLink = ({ to, children, disable, className, override }) => {
        let _to = disable ? "#" : to
        const activeClass = to == "/" ? (currentPage == "/" ? "text-white " : "text-body-secondary ") : (currentPage.startsWith(to) ? "text-white " : "text-body-secondary ")
        let onClick = undefined
        if(!override && user) {
            if(isGuestUser()) {
                // _to = `${window.origin}/signup`
                _to = "#"
                onClick = () => setShowUnlockFeatureModal(true)
            }
            // else if(isGuestOrFreeUser()) {
            //     _to = `${window.origin}/upgrade`
            // }
        }
        return (
            <Link onClick={onClick} className={"w-100 p-2 px-3 d-inline-block link-underline link-underline-opacity-0 " + activeClass + className} to={_to}>
                {children}
            </Link>
        )
    }

    return (
        <div className={"d-flex flex-column flex-shrink-0 text-bg-dark shadow bg-body border-end " + className} style={{ minWidth: "210px" }}>
            <Link to="/" style={{ height: "60px" }} className="d-flex align-items-center m-3 my-2 text-white text-decoration-none">
                <img className="bi" src={logo} style={{ height: "40px" }}></img>
                {/* <span className="fs-4">Sidebar</span> */}
            </Link>
            {/* <hr /> */}
            <div className="px-4 mb-3">
                <NavLink to="/quick-share" className={"btn text-start rounded-pill border border-secondary"} override={true}>
                    <div className="d-flex flex-row justify-content-between">
                        Quick Share<i className="bi bi-lightning-fill"></i>
                    </div>
                </NavLink>
            </div>
            <ul className="d-flex flex-column align-items-stretch list-unstyled px-2">
                <li>
                    <NavLink to="/dashboard" disable={disable}>
                        <i className="bi bi-house me-2"></i>Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/transfers" disable={disable}>
                        <i className="bi bi-arrow-down-up me-2"></i>Transfers
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/statistics" disable={disable}>
                        <i className="bi bi-graph-up me-2"></i>Statistics
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/files" disable={disable}>
                        <i className="bi bi-file-earmark me-2"></i>Files
                    </NavLink>
                </li>
            </ul>
            <div className="px-3 mb-auto d-flex flex-column gap-2">
                { user && isGuestOrFreeUser() &&
                    (
                        <Link className="btn btn-primary rounded-pill w-100" to={"/signup"}>
                            {!user ? ("...") : (isGuestUser() ? "Sign up" : "Upgrade")}
                        </Link>
                    )
                }
                { user && isGuestUser() &&
                    (
                        <Link className="btn btn-outline-primary rounded-pill w-100" to={"/login"}>
                            Login
                        </Link>
                    )
                }
            </div>
            <hr />
            <ul className="nav nav-pills flex-column px-2">
                <li>
                    <NavLink to="/account" override={true}>
                        <i className="bi bi-person-fill me-2"></i>Account
                        {/* <div className="d-flex align-items-center text-white text-decoration-none">
                            <img src="https://avatars.githubusercontent.com/u/10927692?v=4" alt="" width="32" height="32" className="rounded-circle me-2" />
                            <strong>{user.username}</strong>
                        </div> */}
                    </NavLink>
                </li>
            </ul>
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