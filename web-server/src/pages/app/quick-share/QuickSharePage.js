
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import AppGenericPage from "../../../components/app/AppGenericPage"

import "./QuickSharePage.css"
import { useState } from "react"
import UploadFilesModal from "../../../components/modals/UploadFilesModal"

export default function QuickSharePage({ }) {

    return (
        <div className="w-100 d-flex flex-grow-1 justify-content-center align-items-center p-3">
            <Outlet/>
        </div>
    )
}