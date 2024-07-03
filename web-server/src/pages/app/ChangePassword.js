import { useContext, useRef, useState } from "react";
import OnePageForm from "../../components/app/OnePageForm";
import { Link, Navigate, useNavigate } from "react-router-dom";

import * as Api from "../../api/Api";

export default function ChangePassword({ }) {
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)

    const passwordFieldRef = useRef()
    const passwordConfirmFieldRef = useRef()

    const encodedToken = window.location.hash ? window.location.hash.slice(1) : null

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const onSubmit = async () => {
        setErrorMsg(null)
        setLoading(true)
        await sleep(300)
        try {
            const [email, token] = atob(encodedToken).split(" ")
            if(passwordFieldRef.current.value.length < 8) {
                throw new Error("Password needs to be at least 8 characters long!")
            }
            if(passwordFieldRef.current.value !== passwordConfirmFieldRef.current.value) {
                throw new Error("Passwords do not match!")
            }
            await sleep(700)
            const res = await Api.doPasswordReset(email, token, passwordFieldRef.current.value)
            if(res.success) {
                window.location.href = "/login"
            }
        }
        catch (err) {
            setErrorMsg(err.message)
        }
        finally {
            setLoading(false)
        }
    }

    // const additionalFooter = <Link to={"/reset-password"}>Forgot password?</Link>

    if(!encodedToken) return <Navigate to={"/"}/>

    return (
        <OnePageForm errorMsg={errorMsg} buttonText="Change" loading={loading} onSubmit={onSubmit} back={"#"}>
            <h1 className="h3 mb-3 fw-normal">Change password</h1>

            <div className="form-floating">
                <input style={{
                    marginBottom: "-1px",
                    borderBottomRightRadius: 0,
                    borderBottomLeftRadius: 0,
                }} type="password" className="form-control" placeholder="Password" ref={passwordFieldRef} />
                <label htmlFor="floatingInput">Password</label>
            </div>
            <div className="form-floating">
                <input style={{
                    marginBottom: "10px",
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                }} type="password" className="form-control" placeholder="Confirm password" ref={passwordConfirmFieldRef} />
                <label htmlFor="floatingPassword">Confirm password</label>
            </div>
        </OnePageForm>
    )
}