import { useContext } from "react";
import { AuthContext } from "../../providers/AuthProvider"
import { API_URL, logout } from "../../api/Api";
import { Link, Navigate, useNavigate } from "react-router-dom"
import AppGenericPage from "../../components/app/AppGenericPage";

const SITE_URL = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? "http://localhost:3001" : (process.env.REACT_APP_SITE_URL)

export default function AccountPage({ }) {
    const { user, isGuestUser, refreshUser } = useContext(AuthContext)

    const navigate = useNavigate()

    if (isGuestUser()) {
        // return window.location.replace(`${SITE_URL}/login?back=${window.location.origin}&success=${window.location}`)
        return <Navigate to={"/login"} replace={true}/>
    }

    const doLogout = async () => {
        await logout()
        window.location.href = "/"
    }

    if (user == null) {
        return <></>
    }

    const AccountCard = ({ children, title }) => {
        return (
            <div style={{ maxWidth: "700px" }} className="bg-body rounded-4 p-4 mb-3">
                <h4 className="mb-3">{title}</h4>
                {children}
            </div>
        )
    }

    return (
        <AppGenericPage title="Account" className={"AccountPage"}>
            <AccountCard title={"General"}>
                <div className="mb-3 row">
                    <label htmlFor="staticEmail" className="col-sm-4 col-form-label"><b>Email</b></label>
                    <div className="col-sm-8">
                        <div className="d-flex align-items-center">
                            {/* <input type="email" readOnly={true} className="form-control" defaultValue={user.email} /> */}
                            <input type="text" readOnly={true} className="form-control-plaintext" value={user.email} />
                            <button className="btn btn-link" type="submit" onClick={() => { navigate("/pricing") }}>Change</button>
                        </div>
                    </div>
                </div>
                <div className="mb-3 row">
                    <label htmlFor="staticEmail" className="col-sm-4 col-form-label"><b>Plan</b></label>
                    <div className="col-sm-8">
                        <div className="d-flex align-items-center">
                            <input type="text" readOnly={true} className="form-control-plaintext" value={user.plan} />
                            {
                                user.plan == "free" ? (
                                    <Link className="btn btn-link" type="submit" to={"/about/pricing"}>Upgrade</Link>
                                ) : (
                                    <form action={API_URL + "/create-customer-portal-session"} method="POST">
                                        <button className="btn btn-link" type="submit">Manage</button>
                                    </form>
                                )
                            }
                        </div>
                    </div>
                </div>
                {/* <hr></hr> */}
                {/* <div className="mb-3 row">
                    <div className="col-auto">
                        <button type="submit" className="btn btn-primary mb-3">Update password</button>
                    </div>
                </div> */}
                <Link onClick={doLogout} className="" style={{ textDecoration: "none" }}>Log out<i className="bi bi-arrow-right-short"></i></Link>
            </AccountCard>
            <AccountCard title={"Security"}>
                {/* <div className="mb-3 row">
                    <label htmlFor="inputPassword" className="col-sm-4 col-form-label"><b>Change password</b></label>
                    <div className="col-sm-4 mb-2">
                        <input type="password" className="form-control" placeholder="New password" />
                    </div>
                    <div className="col-sm-4">
                        <input type="password" className="form-control" placeholder="Confirm password" />
                    </div>
                </div> */}
                {/* <hr></hr> */}
                <div className="row">
                    <div className="col-auto">
                        {/* <button type="submit" className="btn btn-primary mb-3">Change password</button> */}
                        <Link to="/reset-password" style={{ textDecoration: "none" }}>Change password<i className="bi bi-arrow-right-short"></i></Link>
                    </div>
                </div>
            </AccountCard>
            <Link onClick={doLogout} className="link-danger" style={{ textDecoration: "none" }}>Delete account<i className="bi bi-arrow-right-short"></i></Link>
        </AppGenericPage>
    )
}