import { useContext } from "react"
import { useLocation } from "react-router-dom"
import { AuthContext } from "../../providers/AuthProvider"
import MaxWidthContainer from "../../components/MaxWidthContainer"
import { Accordion } from "react-bootstrap"
import { API_URL } from "../../api/Api"


export default function PricingPage({ }) {
    const checkMark = <i className="bi bi-check2"></i>

    const { state } = useLocation()
    const { user } = useContext(AuthContext)

    const newSignUp = state?.newSignUp

    const isFree = user?.plan == "free"
    const isPro = user?.plan == "pro"
    const isPremium = user?.plan == "premium"
    const hasPlan = isPro || isPremium

    const buttonText = user || newSignUp ? (hasPlan ? (isPremium ? "Change" : "Upgrade") : "Upgrade") : "Sign up"
    const formUrl = API_URL + (hasPlan ? "/create-customer-portal-session" : "/create-checkout-session")

    const mark = <small className="ms-1 bg-warning-subtle rounded border border-warning p-1 text-warning fs-5">Current</small>

    const cards = (
        <main>
            {
                newSignUp ? (
                    <div className="pricing-header p-2 pb-md-4 mx-auto text-center">
                        <h1 className="display-4 fw-normal text-body-emphasis fw-bold">Thank you! <i className="bi bi-heart-fill"></i></h1>
                        <p className="fs-5 text-body-secondary">
                            Take a moment to review our plans. By supporting transfer.zip, you get access to new features and also contribute to a more secure and private web!
                        </p>
                    </div>
                ) :
                    (
                        <div className="pricing-header p-3 pb-md-4 mx-auto text-center">
                            <h1 className="display-4 fw-normal text-body-emphasis fw-bold">Plans</h1>
                            <p className="fs-5 text-body-secondary">
                                Take a moment to review our plans. By supporting transfer.zip, you get access to new features and also contribute to a more secure and private web!
                            </p>
                        </div>
                    )
            }


            <div className="row row-cols-1 row-cols-md-3 mb-3 text-center m-auto">
                <div className="col">
                    <div className="card mb-4 rounded-3 shadow-sm">
                        <div className="card-header py-3">
                            <h4 className="my-0 fw-normal">Free {isFree && mark}</h4>
                        </div>
                        <div className="card-body">
                            <h1 className="card-title pricing-card-title">$0<small className="text-body-secondary fw-light">/mo</small></h1>
                            <ul className="list-unstyled mt-3 mb-4">
                                <li>No file size limit<i className="ms-1 bi bi-question-circle"></i></li>
                                {/* <li>Progressive Web App for mobile</li> */}
                                {/* <li>Transfer files in realtime</li> */}
                                <li>Share by QR code or link</li>
                                <li><u>No account required</u></li>
                            </ul>
                            <a type="button" href={process.env.REACT_APP_APP_URL} className="w-100 btn btn-lg btn-outline-primary">Open app</a>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card mb-4 rounded-3 shadow-sm">
                        <div className="card-header py-3">
                            <h4 className="my-0 fw-normal">Pro {isPro && mark}</h4>
                        </div>
                        <div className="card-body">
                            <h1 className="card-title pricing-card-title">$6<small className="text-body-secondary fw-light">/mo</small></h1>
                            <ul className="list-unstyled mt-3 mb-4">
                                <li>No file size limit<i className="ms-1 bi bi-question-circle"></i></li>
                                <li>Transfer statistics</li>
                                <li>200GB storage</li>
                                {/* <li>Email support</li> */}
                            </ul>
                            <form action={formUrl + "?plan=pro"} method="POST">
                                <button type="submit" className="w-100 btn btn-lg btn-primary">{buttonText}</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card mb-4 rounded-3 shadow-sm border-primary">
                        <div className="card-header py-3 text-bg-primary border-primary">
                            <h4 className="my-0 fw-normal">Premium {isPremium && mark}</h4>
                        </div>
                        <div className="card-body">
                            <h1 className="card-title pricing-card-title">$20<small className="text-body-secondary fw-light">/mo</small></h1>
                            <ul className="list-unstyled mt-3 mb-4">
                                <li>No file size limit<i className="ms-1 bi bi-question-circle"></i></li>
                                <li>Priority support</li>
                                <li>1TB+ storage<i className="ms-1 bi bi-question-circle"></i></li>
                                {/* <li>Priority email support</li> */}
                            </ul>
                            <form action={formUrl + "?plan=premium"} method="POST">
                                <button type="submit" className="w-100 btn btn-lg btn-primary">{buttonText}</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* <h2 className="display-6 text-center mb-4">Compare plans</h2> */}

            <MaxWidthContainer maxWidth={"1000px"}>
                <div className="table-responsive">
                    <table className="table text-center">
                        <thead>
                            <tr>
                                <th style={{ width: "34%" }}></th>
                                <th style={{ width: "22%" }}>Free</th>
                                <th style={{ width: "22%" }}>Pro</th>
                                <th style={{ width: "22%" }}>Premium</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row" className="text-start">Quick Share<i className="ms-1 bi bi-question-circle"></i></th>
                                <td>{checkMark}</td>
                                <td>{checkMark}</td>
                                <td>{checkMark}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-start">End-to-end encryption<i className="ms-1 bi bi-question-circle"></i></th>
                                <td>{checkMark}</td>
                                <td>{checkMark}</td>
                                <td>{checkMark}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-start">Share by QR code or link</th>
                                <td>{checkMark}</td>
                                <td>{checkMark}</td>
                                <td>{checkMark}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-start">File preview</th>
                                <td>{checkMark}</td>
                                <td>{checkMark}</td>
                                <td>{checkMark}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-start">Statistics<i className="ms-1 bi bi-question-circle"></i></th>
                                <td></td>
                                <td>{checkMark}</td>
                                <td>{checkMark}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-start">Share by email</th>
                                <td></td>
                                <td>{checkMark}</td>
                                <td>{checkMark}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-start">Ad-free</th>
                                <td></td>
                                <td>{checkMark}</td>
                                <td>{checkMark}</td>
                            </tr>
                            {/* <tr>
                                <th scope="row" className="text-start">Compress files</th>
                                <td></td>
                                <td></td>
                                <td>{checkMark}</td>
                            </tr> */}
                            <tr>
                                <th scope="row" className="text-start">Most storage</th>
                                <td></td>
                                <td></td>
                                <td>{checkMark}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-start">Priority support</th>
                                <td></td>
                                <td></td>
                                <td>{checkMark}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-start">End world hunger</th>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            {/* <tr>
                                <th scope="row" className="text-start">Native mobile app</th>
                                <td></td>
                                <td></td>
                                <td>{checkMark}</td>
                            </tr> */}
                        </tbody>

                    </table>
                </div>
            </MaxWidthContainer>
        </main>
    )

    return (
        <div className="PricingPage">
            <MaxWidthContainer maxWidth={"1100px"}>
                <MaxWidthContainer className="container py-3" maxWidth={"950px"}>
                    {cards}
                </MaxWidthContainer>
                <MaxWidthContainer id="faq" className={"mb-5"} maxWidth={"900px"}>
                    <h2 className="display-6 text-center mb-4 mt-4 fw-bold">Frequently Asked Questions</h2>
                    <Accordion defaultActiveKey="0">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Is there really no file size limit?</Accordion.Header>
                            <Accordion.Body>
                                There is no file size limit when using Quick Share, because the file is never stored on our servers. 
                                For transfers there are limits determined by your plan, because they will be stored on our servers.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>How does quick share work?</Accordion.Header>
                            <Accordion.Body>
                                It uses <a href="https://webrtc.org">WebRTC</a> for peer-to-peer data transfer, meaning the files are streamed 
                                directly between peers and not stored anywhere in the process, not even on transfer.zip 
                                servers. To let peers initially discover each other, a signaling server is implemented 
                                in NodeJS using WebSockets, which importantly no sensitive data is sent through. 
                                In addition, the file data is end-to-end encrypted 
                                using <a href="https://en.wikipedia.org/wiki/Galois/Counter_Mode">AES-GCM</a> with a client-side 
                                256 bit generated key, meaning if someone could impersonate a peer or capture the 
                                traffic, they would not be able to decrypt the file without knowing the key. 
                                Because the file is streamed directly between peers, there are no file size or 
                                bandwidth limitations.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>Is transfer.zip safe to use?</Accordion.Header>
                            <Accordion.Body>
                                Security is a top priority at transfer.zip, the site was founded by an IT-security consultant, with
                                many years of experience. Furthermore, your transfers are stored encrypted on our servers, meaning
                                if an attacker could gain access to our servers hosting the files, they would not be able to steal your data.
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </MaxWidthContainer>
            </MaxWidthContainer>
        </div>
    )
}