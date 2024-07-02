import { Link } from "react-router-dom"

export default function InlineFooter() {

    const InlineLink = ({ to, children }) => {
        return <Link className="link-secondary link-underline link-underline-opacity-0 link-underline-opacity-100-hover" to={to}>{children}</Link>
    }

    return (
        <div className="inline-footer d-flex flex-row gap-2">
            <InlineLink to={"/upgrade"}>Plans</InlineLink>
            <InlineLink to={"/about"}>About</InlineLink>
            <InlineLink to={"/about/legal/terms-and-conditions"}>Terms</InlineLink>
            <InlineLink to={"/about/legal/privacy-policy"}>Privacy</InlineLink>
            <InlineLink to={"https://github.com/robinkarlberg/transfer.zip-web"}>GitHub</InlineLink>
        </div>
    )
}