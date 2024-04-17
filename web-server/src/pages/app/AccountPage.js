import { useContext } from "react";
import { AuthContext } from "../../providers/AuthProvider"
import { API_URL } from "../../api/Api";
import { useNavigate } from "react-router-dom"
import AppGenericPage from "../../components/app/AppGenericPage";

export default function AccountPage({ }) {
    const { user, logout } = useContext(AuthContext)

    const navigate = useNavigate()

    if (user == null) {
        return <></>
    }

    return (
        <AppGenericPage title="Account" className={"AccountPage"}>
            <div style={{ maxWidth: "700px" }} className="">
                <div className="mb-3 row">
                    <label htmlFor="staticEmail" className="col-sm-4 col-form-label"><b>Email</b></label>
                    <div className="col-sm-8">
                        <input type="email" readOnly={true} className="form-control" defaultValue={user.email} />
                    </div>
                </div>
                <div className="mb-3 row">
                    <label htmlFor="inputPassword" className="col-sm-4 col-form-label"><b>Change password</b></label>
                    <div className="col-sm-4 mb-2">
                        <input type="password" className="form-control" placeholder="New password" />
                    </div>
                    <div className="col-sm-4">
                        <input type="password" className="form-control" placeholder="Confirm password" />
                    </div>
                </div>
                <div className="mb-3 row">
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
                <div className="mb-3 row">
                    <div className="col-auto">
                        <button type="submit" className="btn btn-primary mb-3">Update details</button>
                    </div>
                </div>
            </div>
        </AppGenericPage>
    )
}