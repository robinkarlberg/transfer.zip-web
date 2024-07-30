import landing_bg from "../../../img/landing_background.png"
import MaxWidthContainer from "../../../components/MaxWidthContainer"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet"

export default function ToolGenericSitePage({ title, display, tags, children, subtitle, description, question, steps }) {

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
                <title>{title} | Quickly send large files! No signup, no size limit, with end-to-end encryption, all for free.</title>
            </Helmet>
            <div className="Landing-div d-flex" style={{
                minHeight: "700px",
                backgroundImage: "url(" + landing_bg + ")",
                backgroundPosition: "center",
                backgroundSize: "cover"
            }}>
                <div className="flex-grow-1 d-flex flex-row flex-wrap flex-md-nowrap justify-content-center align-items-start p-2 px-3 px-sm-5 m-auto gap-5" style={{ maxWidth: "1300px" }}>
                    <div className="flex-grow-1 d-flex flex-column justfiy-content-start align-items-start flex-wrap" style={{ minWidth: "300px", maxWidth: "700px" }}>
                        <h1 className="display-5 fw-bold mb-2">{display}</h1>
                        <p className="text-body-secondary fs-5 d-flex flex-column mb-3">
                            { tags.map(tag => <div><i className="bi bi-caret-right-fill fs-6"></i> {tag}</div>) }
                        </p>
                        <div className="ms-1">

                        </div>
                    </div>
                    { children }
                </div>
            </div>
            <div className="px-3">
                <MaxWidthContainer maxWidth={"1100px"}>
                    <div className="mt-5 p-4 border rounded-4 shadow-sm">
                        <h2>{subtitle}</h2>
                        <span className="fs-5">
                            {description}
                        </span>
                    </div>

                    <div className="mt-5">
                        <div className="mb-3 d-flex flex-row">
                            <h3 className="d-inline-block">
                                {question}
                            </h3>
                            <span className="ms-2 p-1 px-2 bg-primary text-light my-auto rounded-4"><nobr>in {steps.length} steps</nobr></span>
                        </div>
                        <ol className="list-unstyled d-flex flex-row flex-wrap flex-md-nowrap justify-content-center gap-3">
                            {steps.map(step => <HowToCard {...step}/>)}
                        </ol>
                    </div>
                </MaxWidthContainer>
            </div>
        </div>
    )
}