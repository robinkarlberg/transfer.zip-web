
import { Outlet } from "react-router-dom"
import AppGenericPage from "../../../components/app/AppGenericPage"

import "./QuickSharePage.css"

export default function QuickSharePage({ }) {
    
    return (
        // <AppGenericPage title={"Quick Share"} className="QuickSharePage">
            
        // </AppGenericPage>
        <div className="w-100 d-flex flex-grow-1 justify-content-center align-items-center p-3">
            <Outlet/>
        </div>
    )
}