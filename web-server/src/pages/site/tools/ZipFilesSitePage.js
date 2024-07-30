import test_img from "../../../img/test-cropped.png"
import promo_1 from "../../../img/promo_1.png"
import promo_2 from "../../../img/promo_2.png"
import landing_bg from "../../../img/landing_background.png"
import landing_bg_dark from "../../../img/landing_background_dark.png"
import { useEffect, useState } from "react"
import MaxWidthContainer from "../../../components/MaxWidthContainer"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet"
import UploadFilesArea from "../../../components/app/UploadFilesArea"
import ZipFileOnlineFilePicker from "../../../components/site/tools/ZipFileOnlineFilePicker"

export default function ZipFilesSitePage({ }) {

    const HowToCard = ({ step, icon, text }) => {
        return (
            <div className="w-100">
                <div className="fs-5 bg-body-tertiary border p-4 rounded-4" style={{ maxWidth: "400px" }}>
                    <div className="display-6">
                        <i className={"bi " + icon}></i>
                    </div>
                    <div>
                        <small>STEP {step}</small>
                    </div>
                    <p className="fw-bold mb-1">{text}</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Helmet>

            </Helmet>
            <div className="Landing-div d-flex" style={{
                minHeight: "700px",
                backgroundImage: "url(" + landing_bg + ")",
                backgroundPosition: "center",
                backgroundSize: "cover"
            }}>
                <div className="flex-grow-1 d-flex flex-row flex-wrap flex-md-nowrap justify-content-center align-items-start p-2 px-3 px-sm-5 m-auto gap-5" style={{ maxWidth: "1300px" }}>
                    <div className="flex-grow-1 d-flex flex-column justfiy-content-start align-items-start flex-wrap" style={{ minWidth: "300px", maxWidth: "700px" }}>
                        <h1 className="display-5 fw-bold mb-2"><span className="text-primary">Easily</span> compress your files online.</h1>
                        <p className="text-body-secondary fs-5 d-flex flex-column mb-3">
                            <div><i className="bi bi-caret-right-fill fs-6"></i> Zip your files or a whole folder</div>
                            <div><i className="bi bi-caret-right-fill fs-6"></i> Share the zip file afterwards</div>
                            <div><i className="bi bi-caret-right-fill fs-6"></i> Fast and free</div>
                        </p>
                        <div className="ms-1">

                        </div>
                    </div>
                    <div className="bg-body-tertiary shadow-lg rounded-4">
                        <ZipFileOnlineFilePicker />
                    </div>
                </div>
            </div>
            <div className="px-3">
                <MaxWidthContainer maxWidth={"1100px"}>
                    <div className="mt-5 p-4 border rounded-4 shadow-sm">
                        <h2><span className="fw-bold">Compress your files,</span> <span className="text-primary">save disk space</span> and upload faster</h2>
                        <span className="fs-5">
                            Effortlessly compress even the biggest files with our online file and folder zip tool.
                            You can pick a whole folder and multiple files from your computer, and they will be converted into a zip archive, ready to download instantly.
                            You can also choose to <b>share the zip file for free</b> using <Link to={"/app/quick-share"}>Quick Share</Link> if you need to.
                        </span>
                    </div>

                    <div className="mt-5">
                        <div className="mb-3 d-flex flex-row">
                            <h3 className="d-inline-block">
                                How to compress zip file
                            </h3>
                            <span className="ms-2 p-1 px-2 bg-primary text-light my-auto rounded-4"><nobr>in 3 steps</nobr></span>
                        </div>
                        <ol className="list-unstyled d-flex flex-row flex-wrap flex-md-nowrap justify-content-center gap-3">
                            <HowToCard step={1} icon={"bi-file-earmark-plus-fill"} text={"Pick your files or select a folder"} />
                            <HowToCard step={2} icon={"bi-hourglass-split"} text={"Compress and wait"} />
                            <HowToCard step={3} icon={"bi-cloud-arrow-down-fill"} text={<span>Download or <Link to={"/app/quick-share"}>share your zip file</Link></span>} />
                        </ol>
                    </div>
                </MaxWidthContainer>
            </div>
        </div>

    )
}