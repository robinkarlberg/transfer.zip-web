import { useContext } from "react";
import { AuthContext } from "../../providers/AuthProvider"
import { API_URL } from "../../api/Api";
import { Link, Navigate, useNavigate } from "react-router-dom"
import AppGenericPage from "../../components/app/AppGenericPage";

const SITE_URL = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? "http://localhost:3001" : (process.env.REACT_APP_SITE_URL)

export default function AccountPage({ }) {
    const { user, logout, isGuestUser } = useContext(AuthContext)

    const navigate = useNavigate()

    if (isGuestUser()) {
        return window.location.href = `${SITE_URL}/signup?back=${window.location.origin}&success=${window.location}`
        // return <Navigate to={`${SITE_URL}/signup`}/>
    }

    if (user == null) {
        return <></>
    }

    const AccountCard = ({ children, title }) => {
        return (
            <div style={{ maxWidth: "700px" }} className="bg-body rounded p-4 border mb-3">
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
                <div className="row">
                    <label htmlFor="staticEmail" className="col-sm-4 col-form-label"><b>Plan</b></label>
                    <div className="col-sm-8">
                        <div className="d-flex align-items-center">
                            <input type="text" readOnly={true} className="form-control-plaintext" value={user.plan} />
                            {
                                user.plan == "free" ? (
                                    <button className="btn btn-link" type="submit" onClick={() => { navigate("/pricing") }}>Upgrade</button>
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
                        <Link to="/" style={{ textDecoration: "none" }}>Change password<i className="bi bi-arrow-right-short"></i></Link>
                    </div>
                </div>
            </AccountCard>
        </AppGenericPage>
    )
}