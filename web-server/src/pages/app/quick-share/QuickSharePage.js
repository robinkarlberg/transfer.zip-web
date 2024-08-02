
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import AppGenericPage from "../../../components/app/AppGenericPage"

import "./QuickSharePage.css"
import { useState } from "react"
import UploadFilesModal from "../../../components/modals/UploadFilesModal"
import InlineFooter from "../../../components/app/InlineFooter"
import { Helmet } from "react-helmet"

export default function QuickSharePage({ }) {

    return (
        <div className="w-100 d-flex flex-column flex-grow-1 justify-content-between align-items-center p-3 position-relative">
            <Helmet>
                <title>TransferZip - Send large files with no signup, no size limit, for free</title>
            </Helmet>
            <div className="d-none d-md-inline-block position-absolute top-0 end-0 m-3">
                <InlineFooter />
            </div>
            <div className="flex-grow-0 flex-md-grow-1 d-flex justify-content-center justify-md-content-start align-items-center">
                <Outlet />
            </div>
            <div className="d-md-none">
                <InlineFooter />
            </div>
        </div>
    )
}