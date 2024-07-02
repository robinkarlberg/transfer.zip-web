
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import AppGenericPage from "../../../components/app/AppGenericPage"

import "./QuickSharePage.css"
import { useState } from "react"
import UploadFilesModal from "../../../components/modals/UploadFilesModal"
import InlineFooter from "../../../components/app/InlineFooter"

export default function QuickSharePage({ }) {

    return (
        <div className="w-100 d-flex flex-column flex-grow-1 justify-content-between align-items-center p-3 me-md-5">
            <div className="flex-grow-0 flex-md-grow-1 d-flex justify-content-center justify-md-content-start align-items-center">
                <Outlet />
            </div>
            <InlineFooter/>
        </div>
    )
}