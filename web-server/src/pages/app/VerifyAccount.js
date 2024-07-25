import { useContext, useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import * as Api from "../../api/Api";
import MaxWidthContainer from "../../components/MaxWidthContainer";
import Checkmark from "../../components/app/Checkmark";
import Cross from "../../components/app/Cross";

export default function VerifyAccount({ }) {
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState(null)
    const [success, setSuccess] = useState(false)
    const [linkSent, setLinkSent] = useState(false)

    const encodedToken = window.location.hash ? window.location.hash.slice(1) : null

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const onResendClicked = async () => {
        const res = await Api.requestVerification()
        if (res.success) {
            setLinkSent(true)
        }
    }

    const onLoad = () => {
        const af = async () => {
            await sleep(300)

            try {
                const [email, token] = atob(encodedToken).split(" ")
                const res = await Api.doVerification(email, token)
                if (res.success) {
                    setSuccess(true)
                }
            }
            catch (err) {
                setErrorMsg(err.message)
            }
            finally {
                setLoading(false)
            }
        }

        const [email, token] = atob(encodedToken).split(" ")
        if (token === "sendnew") {
            setLinkSent(true)
            onResendClicked()
        }
        else {
            af()
        }
    }

    useEffect(onLoad, [])

    // const additionalFooter = <Link to={"/reset-password"}>Forgot password?</Link>

    if (!encodedToken) return <Navigate to={"/"} />

    const [email, token] = atob(encodedToken).split(" ")

    const successPage = (
        <div className="min-vh-100 d-flex flex-column bg-body-tertiary justify-content-center">
            <MaxWidthContainer className="" maxWidth={"500px"}>
                <main className="w-100 m-auto p-3 text-center">
                    <Checkmark className={"text-success mb-4"} />
                    <p className="fs-5">Your account has been verified!</p>
                    <p className="text-center text-body-secondary"><a href="/dashboard">Start transferring</a></p>
                </main>
            </MaxWidthContainer>
        </div>
    )

    const linkSentPage = (
        <div className="min-vh-100 d-flex flex-column bg-body-tertiary justify-content-center">
            <MaxWidthContainer className="" maxWidth={"500px"}>
                <main className="w-100 m-auto p-3 text-center">
                    <Checkmark className={"text-success mb-4"} />
                    <p className="fs-5">Verification link sent</p>
                    <p className="text-center text-body-secondary">Another verification link has been sent to {email}. Check your email and spam folder.</p>
                </main>
            </MaxWidthContainer>
        </div>
    )

    const errorPage = (
        <div className="min-vh-100 d-flex flex-column bg-body-tertiary justify-content-center">
            <MaxWidthContainer className="" maxWidth={"500px"}>
                <main className="w-100 m-auto p-3 text-center">
                    <Cross className={"text-danger mb-4"} />
                    <p className="fs-5">Error while verifying account!</p>
                    <p className="text-center text-body-secondary">Maybe the link has expired? <a href="#" onClick={onResendClicked}>Try sending a new verification link.</a></p>
                </main>
            </MaxWidthContainer>
        </div>
    )

    if (linkSent) {
        return linkSentPage
    }
    else if (success) {
        return successPage
    }
    else if (errorMsg) {
        return errorPage
    }
    else {
        return (
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        )
    }
}