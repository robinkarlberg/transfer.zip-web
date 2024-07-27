import { Link } from "react-router-dom"
import { isSelfHosted } from "../../utils"

export default function InlineFooter() {

    const InlineLink = ({ to, children }) => {
        return <Link className="link-secondary link-underline link-underline-opacity-0 link-underline-opacity-100-hover" to={to} reloadDocument>{children}</Link>
    }

    if (isSelfHosted()) {
        return (
            <div className="inline-footer d-flex flex-row gap-2">
                {/* <InlineLink to={"https://github.com/robinkarlberg/transfer.zip-web"}>GitHub</InlineLink> */}
            </div>
        )
    }

    return (
        <div className="inline-footer d-flex flex-row gap-2">
            <InlineLink to={"/upgrade"}>Plans</InlineLink>
            <InlineLink to={"/about"}>About</InlineLink>
            <InlineLink to={"https://blog.transfer.zip/"}>Blog</InlineLink>
            <InlineLink to={"/about/legal/terms-and-conditions"}>Terms</InlineLink>
            <InlineLink to={"/about/legal/privacy-policy"}>Privacy</InlineLink>
            <InlineLink to={"https://github.com/robinkarlberg/transfer.zip-web"}>GitHub</InlineLink>
        </div>
    )
}