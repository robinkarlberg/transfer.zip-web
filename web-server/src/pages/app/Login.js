import { useContext, useRef, useState } from "react";
import OnePageForm from "../../components/app/OnePageForm";
import { Link, useNavigate } from "react-router-dom";

import * as Api from "../../api/Api";
import { Helmet } from "react-helmet";

export default function Login({ }) {
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
                window.location.href = (getParams.get("success") || "/app")
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
                <title>Login | TransferZip - Send large files with no signup, no size limit, for free</title>
            </Helmet>
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