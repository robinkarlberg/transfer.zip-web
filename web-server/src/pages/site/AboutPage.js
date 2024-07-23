import test_img from "../../img/test-cropped.png"
import promo_1 from "../../img/promo_1.png"
import promo_2 from "../../img/promo_2.png"
import { useEffect, useState } from "react"
import MaxWidthContainer from "../../components/MaxWidthContainer"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet"

export default function AboutPage({ }) {

    const [stars, setStars] = useState(null)

    useEffect(() => {
        fetch("https://api.github.com/repos/robinkarlberg/transfer.zip-web", {
            "credentials": "omit",
            "method": "GET"
        }).then(res => res.json()).then(json => {
            setStars(json.stargazers_count)
        }).catch(err => {
            console.log("Likes fetch error :(")
        })
    }, [])

    return (
        <div>
            <Helmet>
                <title>About | transfer.zip</title>
                <meta name="description" content="Quickly send large files! No signup, no size limit, with end-to-end encryption, all for free."/>
            </Helmet>
            <div className="Landing-div d-flex" style={
                {
                    height: "80vh",
                    // backgroundImage: "url(" + bg_logo + ")",
                    // backgroundRepeat: "repeat",
                    // backgroundSize: "60px",
                    // backgroundPosition: "center"
                }}>
                <div className="flex-grow-1 d-flex flex-row justify-content-center align-items-start p-2 px-3 px-sm-5 m-auto gap-5" style={{ maxWidth: "1300px" }}>
                    <div className="d-flex flex-column justfiy-content-start align-items-start flex-wrap" style={{ minWidth: "300px", maxWidth: "700px" }}>
                        <h1 className="display-5 fw-bold mb-2">The <span className="text-primary">universal</span> file transfer solution.</h1>
                        <p className="text-body-secondary fs-5 d-flex flex-column mb-3">
                            {/* transfer.zip is <b>free</b>, <b>fast</b> and <b>encrypted</b>, all while being open-source.  */}
                            {/* Wether you want to send a 4K movie, share a screenshot or collaborate on creative projects, use transfer.zip to
              send files <b>without size limits</b>, even for free, using WebRTC technology. */}
                            <div><i className="bi bi-caret-right-fill fs-6"></i> <b>Unlimited </b>1TB+ file size with Quick Share</div>
                            <div><i className="bi bi-caret-right-fill fs-6"></i> <b>Statistics</b> for your transfers</div>
                            <div><i className="bi bi-caret-right-fill fs-6"></i> <b>Customize</b> download pages</div>
                            {/* <div><i className="bi bi-caret-right-fill fs-6"></i> <b>Fast</b> download speeds</div> */}
                            <div><i className="bi bi-caret-right-fill fs-6"></i> No account required</div>
                            {/* <div><i className="bi bi-caret-right-fill fs-6"></i> <b>Branded</b> download pages</div> */}
                        </p>
                        <div className="ms-1">
                            {/* <Link className="btn btn-primary me-2 px-3" to="/signup">Sign up</Link> */}
                            <a className="btn btn-primary me-2" href={process.env.REACT_APP_APP_URL}>Open app</a>
                            {/* <Link className="btn btn-outline-primary px-3" to="/signup">Sign up</Link> */}
                            <a className="btn btn-sm btn-link" target="_blank" href="https://github.com/robinkarlberg/transfer.zip-web">
                                <i className="bi bi-star"></i> Star on GitHub {stars && `(${stars})`}
                            </a>
                        </div>
                    </div>
                    <div className="d-none d-md-inline-block">
                        <img className="rounded-3" src={test_img} width="500"></img>
                    </div>
                </div>
            </div>
            <div className="clip overflow-hidden px-3 px-sm-5" data-bs-theme="dark" style={{ clipPath: "margin-box", backgroundColor: "#16181a" }}>
                <div className="m-auto" style={{ maxWidth: "1200px" }}>
                    <div className="d-flex flex-column flex-md-row-reverse pt-5" style={{ height: "400px" }}>
                        <div style={{ maxWidth: "31.2vw" }} className="flex-shrink-1 d-none d-md-inline-block">
                            <img src={promo_1} className="rounded-4" style={{ position: "relative", left: "5vw", maxWidth: "700px" }}></img>
                        </div>
                        <div style={{ minWidth: "260px" }}>
                            <h2 className="fw-bold text-body">Share your <span className="text-primary">{ /*most important*/}big</span> files while keeping them secure.</h2>
                            <p className="text-body-secondary mb-2">
                                transfer.zip is optimized for file sharing.
                                Wether you want to send a 4K movie, share a screenshot or collaborate on creative projects, use transfer.zip to
                                send files <b>without size limits</b>, even for free.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-body clip overflow-hidden px-3 px-sm-5" style={{ clipPath: "margin-box" }}>
                <div className="m-auto" style={{ maxWidth: "1200px" }}>
                    <div className="d-flex flex-row pt-5" style={{ height: "400px" }}>
                        <div className="d-none d-md-inline-block" style={{ width: "calc(60vw - 31.2vw)" }}>
                            <img src={promo_2} className="rounded-4" width="700px" style={{ position: "relative", left: "calc(31.2vw - 780px)" }}></img>
                        </div>
                        <div style={{ minWidth: "260px" }}>
                            <h2 className="fw-bold">Unlimited file size with <span className="text-primary">Quick Share</span>.</h2>
                            {/* <h5>- For when you need to send something really big. </h5> */}
                            <p className="text-body-secondary">
                                Send files in realtime, with no file size limit. The files are end-to-end encrypted, and will be transfered directly
                                between you and the recipient, using peer-to-peer technology.
                                Quick Share is completely private and <a href="https://github.com/robinkarlberg/transfer.zip-web/">open source.</a>
                            </p>
                            <a className="btn btn-primary" href={process.env.REACT_APP_APP_URL + "/quick-share"}>Try now, no account required</a>
                        </div>
                    </div>
                </div>
            </div>
            <MaxWidthContainer maxWidth={"1100px"} className="bg-body-secondary py-5 px-3">
                <div>
                    <div className="m-auto mt-5">
                        <h2 className="display-5 fw-bold">Transfer smarter.</h2>
                        <p>Ideal for professionals and hobbyists alike. Whenever you need to share files, use transfer.zip!</p>
                    </div>
                </div>
                <div className="d-flex flex-row flex-wrap py-4 gap-3">
                    <div className="flex-grow-1 bg-body text-center p-3 py-5 rounded">
                        <h2 className="fw-bold"><i className="bi bi-ban me-2"></i>No file size limit</h2>
                        <p style={{ maxWidth: "300px" }} className="m-auto">When the file is transfered using Quick Share, there are no file size or bandwidth limitations.</p>
                    </div>
                    <div className="flex-grow-1 bg-body text-center p-3 py-5 rounded">
                        <h2 className="fw-bold"><i className="bi bi-file-earmark-lock2 me-2"></i>Encryption</h2>
                        <p style={{ maxWidth: "300px" }} className="m-auto">Transfers are encrypted using AES-256. <nobr>Quick Share</nobr> is end-to-end encrypted using a client-side generated key.</p>
                    </div>
                    <div className="flex-grow-1 bg-body text-center p-3 py-5 rounded">
                        <h2 className="fw-bold"><i className="bi bi-bar-chart-fill me-2"></i>Statistics</h2>
                        <p style={{ maxWidth: "300px" }} className="m-auto">See comprehensive download statistics for all your transfers, enabling you to make better decisions.</p>
                    </div>
                    <div className="flex-grow-1 bg-body text-center p-3 py-5 rounded">
                        <h2 className="fw-bold"><i className="bi bi-piggy-bank-fill me-2"></i>Fair price</h2>
                        <p style={{ maxWidth: "300px" }} className="m-auto">Our <Link to="pricing">plans</Link> are some of the most competitive in the business.</p>
                    </div>
                    <div className="flex-grow-1 bg-body text-center p-3 py-5 rounded">
                        <h2 className="fw-bold"><i className="bi bi-cpu-fill me-2"></i>Cross-platform</h2>
                        <p style={{ maxWidth: "300px" }} className="m-auto">File transfers work across all platforms. Everything is handled in the browser.</p>
                    </div>
                    <div className="flex-grow-1 bg-body text-center p-3 py-5 rounded">
                        <h2 className="fw-bold"><i className="bi bi-github me-2"></i>Open source</h2>
                        <p style={{ maxWidth: "300px" }} className="m-auto">The file transfer source code is freely available on GitHub. <a href="https://github.com/robinkarlberg/transfer.zip-web/">Check it out.</a></p>
                    </div>
                </div>
            </MaxWidthContainer>
            <MaxWidthContainer maxWidth={500} className={"my-5"}>
                <div className="text-center">
                    <h2 className="display-6 fw-bold">Try it today!</h2>
                    <p>No account or credit card required.</p>
                    <a className="btn btn-primary py-2 px-3" href={process.env.REACT_APP_APP_URL + "/"}>Open app</a>
                </div>
            </MaxWidthContainer>
        </div>
    )
}