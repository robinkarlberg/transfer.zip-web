import { useContext, useRef, useState } from "react";
import OnePageForm from "../../components/app/OnePageForm";
import { Link, useLocation, useNavigate } from "react-router-dom";

import * as Api from "../../api/Api";
import { Helmet } from "react-helmet";

export default function Login({ }) {

    const { state } = useLocation()
    const prevState = state?.prevState
    const prevStatePath = state?.prevStatePath

    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)

    const emailFieldRef = useRef()
    const passwordFieldRef = useRef()

    const getParams = new URLSearchParams(window.location.search)

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const onSubmit = async () => {
        setErrorMsg(null)
        setLoading(true)
        await sleep(1000)
        try {
            const res = await Api.login(emailFieldRef.current.value, passwordFieldRef.current.value)
            if (res.success) {
                if (prevStatePath) {
                    navigate(prevStatePath, { state: prevState })
                }
                else {
                    window.location.href = (getParams.get("success") || "/app")
                }
            }
        }
        catch (err) {
            setErrorMsg(err.message)
        }
        finally {
            setLoading(false)
        }
    }

    const additionalFooter = <Link to={"/reset-password"}>Forgot password?</Link>

    return (
        <>
            <Helmet>
                <title>Login | Transfer.zip - Send large files with no signup, no size limit, for free</title>
            </Helmet>
            <div className="d-block bg-warning-subtle text-warning-emphasis text-center p-2">
                <span><b>Maintenance:</b> logins and permanent transfers are unavailable from today until 2/10</span>
            </div>
            <OnePageForm errorMsg={errorMsg} buttonText="Sign in" loading={loading} onSubmit={onSubmit} back={getParams.get("back")} additionalFooter={additionalFooter} >
                <h1 className="h3 mb-3 fw-normal">Please sign in</h1>

                <div className="form-floating">
                    <input style={{
                        marginBottom: "-1px",
                        borderBottomRightRadius: 0,
                        borderBottomLeftRadius: 0,
                    }} type="email" className="form-control" placeholder="name@example.com" ref={emailFieldRef} />
                    <label htmlFor="floatingInput">Email address</label>
                </div>
                <div className="form-floating">
                    <input style={{
                        marginBottom: "10px",
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                    }} type="password" className="form-control" placeholder="Password" ref={passwordFieldRef} />
                    <label htmlFor="floatingPassword">Password</label>
                </div>
            </OnePageForm>
        </>
    )
}