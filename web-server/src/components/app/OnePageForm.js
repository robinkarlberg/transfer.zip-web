import { Link } from "react-router-dom";
import MaxWidthContainer from "./MaxWidthContainer";

import logo from "../../img/transfer-zip-logotext-cropped.png"

export default function OnePageForm({ children, errorMsg, buttonText, loading, onSubmit, back }) {

    const _onSubmit = async (e) => {
        e.preventDefault()
        onSubmit()
    }

    const spinner = (
        <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    )

    const errorMsgElement = (
        <div className="text-danger pb-2">
            {errorMsg}
        </div>
    )

    const _back = back || "/"
    // const

    return (
        <div className="OnePageForm min-vh-100 d-flex flex-column bg-body-tertiary justify-content-center">
            <MaxWidthContainer className="" maxWidth={"330px"}>
                <main className="form-signin w-100 m-auto p-3">
                    <form onSubmit={_onSubmit}>
                        <div className="d-flex flex-row justify-content-between align-items-center mb-4">
                            <Link to={_back} >
                                <i style={{ fontSize: "25px" }} className="btn bi bi-arrow-left-circle-fill"></i>
                            </Link>
                            <img className="me-4" style={{ maxWidth: "220px" }} src={logo} alt="transfer.zip logo" />
                        </div>
                        { children }

                        {/* <div className="form-check text-start my-3">
                                <input className="form-check-input" type="checkbox" value="remember-me" />
                                <label className="form-check-label" htmlFor="flexCheckDefault">
                                    Remember me
                                </label>
                            </div> */}
                        {errorMsg && errorMsgElement}
                        <button className="btn btn-primary w-100 py-2 mt-1" type="submit" disabled={loading}>
                            {buttonText} {loading && spinner}
                        </button>
                        <p className="mt-5 mb-3 text-body-secondary">&copy; 2024 Robin K</p>
                    </form>
                </main>
            </MaxWidthContainer>
        </div>
    )
}