
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import AppGenericPage from "../../../components/app/AppGenericPage"

import "./QuickSharePage.css"
import { useState } from "react"
import UploadFilesModal from "../../../components/modals/UploadFilesModal"

export default function QuickSharePage({ }) {

    const InlineLink = ({ to, children }) => {
        return <Link className="link-secondary link-underline link-underline-opacity-0 link-underline-opacity-100-hover" to={to}>{children}</Link>
    }

    return (
        <div className="w-100 d-flex flex-column flex-grow-1 justify-content-between align-items-center p-3">
            <div className="flex-grow-0 flex-md-grow-1 d-flex justify-content-center justify-md-content-start align-items-center">
                <Outlet />
            </div>
            <div className="inline-footer d-flex flex-row gap-2">
                <InlineLink to={"/upgrade"}>Plans</InlineLink>
                <InlineLink to={"/about"}>About</InlineLink>
                <InlineLink to={"/terms-of-service"}>Terms</InlineLink>
                <InlineLink to={"/privacy-policy"}>Privacy</InlineLink>
                <InlineLink to={"https://github.com/robinkarlberg/transfer.zip-web"}>GitHub</InlineLink>
            </div>
        </div>
    )
}