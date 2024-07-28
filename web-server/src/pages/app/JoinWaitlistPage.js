import { useContext, useRef, useState } from "react";
import OnePageForm from "../../components/app/OnePageForm";
import { Link, useNavigate } from "react-router-dom";

import * as Api from "../../api/Api";
import MaxWidthContainer from "../../components/MaxWidthContainer";
import Checkmark from "../../components/app/Checkmark";

export default function JoinWaitlistPage({ }) {
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)
    const [successEmail, setSuccessEmail] = useState(null)

    const emailFieldRef = useRef()

    const getParams = new URLSearchParams(window.location.search)

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const onSubmit = async () => {
        setErrorMsg(null)
        setLoading(true)
        await sleep(1000)
        try {
            const res = await Api.joinWaitlist(emailFieldRef.current.value)
            if (res.success) {
                setSuccessEmail(emailFieldRef.current.value)
            }
        }
        catch (err) {
            setErrorMsg(err.message)
        }
        finally {
            setLoading(false)
        }
    }

    // const additionalFooter = <Link to={"/signup"}>Forgot password?</Link>

    const successPage = (
        <div className="min-vh-100 d-flex flex-column bg-body-tertiary justify-content-center">
            <MaxWidthContainer className="" maxWidth={"500px"}>
                <main className="w-100 m-auto p-3 text-center">
                    <Checkmark className={"text-success mb-4"}/>
                    <p className="fs-5">{successEmail} was added to the waitlist.</p>
                    <p className="text-center text-body-secondary">Stay tuned for updates! When new features are available, you will be the first to know. </p>
                </main>
            </MaxWidthContainer>
        </div>
    )

    return (!successEmail ? (
        <OnePageForm errorMsg={errorMsg} buttonText="Join" loading={loading} onSubmit={onSubmit} back={getParams.get("back")} >
            <h1 className="h3 mb-3 fw-normal">Join Waitlist</h1>
            <p className="text-body-secondary">When new features are available, you will be the first to know.</p>
            <div className="form-floating">
                <input style={{
                    marginBottom: "10px"
                }} type="email" className="form-control" placeholder="name@example.com" ref={emailFieldRef} />
                <label htmlFor="floatingInput">Email address</label>
            </div>
        </OnePageForm>
    ) : successPage)
}