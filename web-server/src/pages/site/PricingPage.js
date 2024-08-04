import { useContext } from "react"
import { Link, useLocation } from "react-router-dom"
import { AuthContext } from "../../providers/AuthProvider"
import MaxWidthContainer from "../../components/MaxWidthContainer"
import { Accordion } from "react-bootstrap"
import { API_URL } from "../../api/Api"
import QuestionMark from "../../components/QuestionMark"
import { Helmet } from "react-helmet"


export default function PricingPage({ }) {
    const checkMark = <i className="bi bi-check2"></i>

    const { state } = useLocation()
    const { user } = useContext(AuthContext)

    const newSignUp = state?.newSignUp

    const isFree = user?.plan == "free"
    const isPro = user?.plan == "pro"
    const isPremium = user?.plan == "premium"
    const hasPlan = isFree || isPro || isPremium

    const proButtonText = "Join Waitlist" //isPro ? "Manage" : (isPremium ? "Change" : "Upgrade")
    const premiumButtonText = "Join Waitlist" //isPremium ? "Manage" : "Upgrade"

    const proFormUrl = "/join-waitlist" //API_URL + ((isPro) ? "/create-customer-portal-session" : "/create-checkout-session")
    const premiumFormUrl = "/join-waitlist" //API_URL + ((isPremium) ? "/create-customer-portal-session" : "/create-checkout-session")

    const mark = <small className="ms-1 bg-warning-subtle rounded border border-warning p-1 text-warning fs-5">Current</small>

    const noSizeLimitTooltip = (
        <span>When using Quick Share, there is no file size limit. The files are sent directly between your devices without being stored anywhere on our servers.</span>
    )

    const oneTbStorageTooltip = (
        <span>Initially, the max storage is 1TB. If you reach the limit, you can contact us and request to expand your storage. We make decisions on a case-by-case basis.</span>
    )

    const quickShareTooltip = (
        <span>
            Send files in realtime, with no file size limit. The files are end-to-end encrypted, and will be transfered directly
            between you and the recipient, using peer-to-peer technology.
            Quick Share is completely private and open source.
        </span>
    )

    const e2eEncryptionTooltip = (
        <span>When using Quick Share, your files are end-to-end encrypted using AES-GCM with a 256 bit key.</span>
    )

    const encryptionTooltip = (
        <span>All transfers are encrypted at-rest using AES-256.</span>
    )

    const statisticsTooltip = (
        <span>View comprehensive statistics on your transfers. See if your recipients have downloaded your files.</span>
    )

    const endWorldHungerTooltip = (
        <span>Unfortunately Transfer.zip can't end world hunger with the resources we have now, but in the future that could change.</span>
    )

    const removeAdsForeverTooltip = (
        <span>If you purchase a plan, your account will <b>never-ever</b> see ads again, even if you cancel your subscription.</span>
    )

    const momentText = "Transfer.zip is free and will stay free forever. If you want to bigger storage and more features, while also supporting the developer, try signing up for a plan."

    const cards = (
        <main>
            {
                newSignUp ? (
                    <div className="pricing-header p-2 pb-md-4 mx-auto text-center">
                        <h1 className="display-4 fw-normal text-body-emphasis fw-bold">Thank you! <i className="bi bi-heart-fill"></i></h1>
                        <p className="fs-5 text-body-secondary">
                            {momentText}
                        </p>
                    </div>
                ) :
                    (
                        <div className="pricing-header p-3 pb-md-4 mx-auto text-center">
                            <h1 className="display-4 fw-normal text-body-emphasis fw-bold">Pricing</h1>
                            <p className="fs-5 text-body-secondary">
                                {momentText}
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
                                <li>No file size limit<QuestionMark>{noSizeLimitTooltip}</QuestionMark></li>
                                {/* <li>Progressive Web App for mobile</li> */}
                                {/* <li>Transfer files in realtime</li> */}
                                <li>Share by QR code or link</li>
                                <li>1GB storage</li>
                            </ul>
                            <a type="button" href="/app" className="w-100 btn btn-lg btn-outline-primary">Open app</a>
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
                                <li>No file size limit<QuestionMark>{noSizeLimitTooltip}</QuestionMark></li>
                                <li>Share by QR code or link</li>
                                <li>200GB storage</li>
                                <li>Password protect files</li>
                                <li><b>Ad-free forever</b><QuestionMark>{removeAdsForeverTooltip}</QuestionMark></li>
                                <li><b>Share by email</b></li>
                                <li><b>Transfer statistics</b></li>
                                {/* <li>Email support</li> */}
                            </ul>
                            <Link to={proFormUrl} className="w-100 btn btn-lg btn-primary">{proButtonText}</Link>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card mb-4 rounded-3 shadow-lg border-primary">
                        <div className="card-header py-3 text-bg-primary border-primary">
                            <h4 className="my-0 fw-normal">Premium {isPremium && mark}</h4>
                        </div>
                        <div className="card-body">
                            <h1 className="card-title pricing-card-title">$20<small className="text-body-secondary fw-light">/mo</small></h1>
                            <ul className="list-unstyled mt-3 mb-4">
                                <li>No file size limit<QuestionMark>{noSizeLimitTooltip}</QuestionMark></li>
                                <li>Share by QR code or link</li>
                                <li><b>1TB+ storage</b><QuestionMark>{oneTbStorageTooltip}</QuestionMark></li>
                                <li>Password protect files</li>
                                <li><b>Ad-free forever</b><QuestionMark>{removeAdsForeverTooltip}</QuestionMark></li>
                                <li>Share by email</li>
                                <li>Transfer statistics</li>
                                <li><b>Priority support</b></li>
                                {/* <li>Priority email support</li> */}
                            </ul>
                            <Link to={premiumFormUrl} className="w-100 btn btn-lg btn-primary">{premiumButtonText}</Link>
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
                                <th scope="row" className="text-start">Quick Share<QuestionMark>{quickShareTooltip}</QuestionMark></th>
                                <td>{checkMark}</td>
                                <td>{checkMark}</td>
                                <td>{checkMark}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-start">End-to-end encryption<QuestionMark>{e2eEncryptionTooltip}</QuestionMark></th>
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
                                <th scope="row" className="text-start">Statistics<QuestionMark>{statisticsTooltip}</QuestionMark></th>
                                <td></td>
                                <td>{checkMark}</td>
                                <td>{checkMark}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-start">Password-protect files</th>
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
                                <th scope="row" className="text-start">Ad-free forever<QuestionMark>{removeAdsForeverTooltip}</QuestionMark></th>
                                <td></td>
                                <td>{checkMark}</td>
                                <td>{checkMark}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-start">File encryption<QuestionMark>{encryptionTooltip}</QuestionMark></th>
                                <td></td>
                                <td>{checkMark}</td>
                                <td>{checkMark}</td>
                            </tr>
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
                                <th scope="row" className="text-start">End world hunger<QuestionMark>{endWorldHungerTooltip}</QuestionMark></th>
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
            <Helmet>
                <title>Pricing | Transfer.zip</title>
                {/* <meta name="description" content="Quickly send large files! No signup, no size limit, with end-to-end encryption, all for free." /> */}
            </Helmet>
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